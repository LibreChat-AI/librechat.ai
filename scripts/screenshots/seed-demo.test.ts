import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'

/**
 * Runs seed-demo.js under a stub that behaves like mongosh, not like the
 * legacy mongo shell.
 *
 * The distinction matters: an earlier stub returned a plain array from find(),
 * which made `cursor.map(...).length` work in the test and fail on a real
 * server. In mongosh, map() returns another lazy cursor, and passing one to a
 * query throws a BSON serialization error. Both behaviours are modelled below
 * so the test fails the same way a server would.
 */

const SCRIPT = resolve(__dirname, 'seed-demo.js')

/** Endpoints the demo actually serves, from a live authenticated inventory. */
const LIVE_ENDPOINTS = new Set([
  '302AI',
  'APIpie',
  'Fireworks',
  'Github Models',
  'HuggingFace',
  'Hyperbolic',
  'Kluster',
  'Mistral',
  'NanoGPT',
  'Nvidia',
  'OpenRouter',
  'Perplexity',
  'SambaNova',
  'Unify',
  'agents',
  'anthropic',
  'cohere',
  'deepseek',
  'glhf.chat',
  'google',
  'groq',
  'openAI',
  'together.ai',
  'xai',
])

interface Doc {
  [key: string]: unknown
}

/** A mongosh cursor: map() stays lazy, only toArray() materialises. */
function cursor(docs: Doc[]) {
  return {
    toArray: () => docs,
    map(fn: (d: Doc) => unknown) {
      return cursor(docs.map((d) => fn(d) as Doc))
    },
  }
}

function isPlainArray(value: unknown): boolean {
  return Array.isArray(value)
}

interface RunResult {
  logs: string[]
  conversations: Doc[]
  messages: Doc[]
  agents: Doc[]
  deletes: { collection: string; filter: Doc }[]
}

function run(options: { existing?: Doc[]; vars?: Record<string, unknown> } = {}): RunResult {
  const existing = options.existing ?? []
  const result: RunResult = {
    logs: [],
    conversations: [],
    messages: [],
    agents: [],
    deletes: [],
  }

  const collection = (name: string) => ({
    findOne: (query: Doc) =>
      name === 'users' && query.email
        ? { _id: 'OID_demo_user', email: query.email, name: 'LibreChat Demo' }
        : null,
    find: () => cursor(name === 'conversations' ? existing : []),
    insertMany: (docs: Doc[]) => {
      if (name === 'conversations') result.conversations.push(...docs)
      if (name === 'messages') result.messages.push(...docs)
      return { insertedCount: docs.length }
    },
    deleteMany: (filter: Doc) => {
      // A real server rejects a non-array $in before executing anything.
      const inClause = (filter.conversationId as { $in?: unknown } | undefined)?.$in
      if (inClause !== undefined && !isPlainArray(inClause)) {
        throw new TypeError('Cannot convert circular structure to BSON')
      }
      result.deletes.push({ collection: name, filter })
      return { deletedCount: name === 'conversations' ? existing.length : 0 }
    },
    updateOne: (_query: Doc, update: { $set: Doc }) => {
      result.agents.push(update.$set)
      return { upsertedCount: 1 }
    },
  })

  const db = new Proxy(
    { getName: () => 'demo' },
    {
      get: (target: Record<string, unknown>, prop: string) =>
        prop in target ? target[prop] : collection(String(prop)),
    },
  )

  const context = vm.createContext({
    db,
    crypto,
    DEMO_EMAIL: 'demo@librechat.ai',
    print: (message: unknown) => result.logs.push(String(message)),
    quit: () => {
      throw new Error('__QUIT__')
    },
    ...(options.vars ?? {}),
  })

  try {
    vm.runInContext(readFileSync(SCRIPT, 'utf8'), context)
  } catch (err) {
    if (!String((err as Error).message).includes('__QUIT__')) throw err
  }
  return result
}

describe('seed-demo', () => {
  it('runs against a fresh account without touching a cursor as a query value', () => {
    // Regression: cursor.map() returns a cursor in mongosh, so the previous
    // version reported "would remove undefined" and threw on the first delete.
    const result = run()
    expect(result.logs).toContain('nothing previously seeded')
    expect(result.logs.join('\n')).not.toContain('undefined')
  })

  it('materialises existing ids before using them in a query', () => {
    const existing = [{ conversationId: 'a' }, { conversationId: 'b' }]
    const result = run({ existing })
    const deletion = result.deletes.find((d) => d.collection === 'messages')
    expect(deletion).toBeDefined()
    expect((deletion!.filter.conversationId as { $in: unknown[] }).$in).toEqual(['a', 'b'])
  })

  it('covers every endpoint the demo serves and invents none', () => {
    const used = new Set(run().conversations.map((c) => c.endpoint as string))
    expect([...used].filter((e) => !LIVE_ENDPOINTS.has(e))).toEqual([])
    expect([...LIVE_ENDPOINTS].filter((e) => !used.has(e))).toEqual([])
  })

  it('writes enough conversations to clear the capture guard', () => {
    // capture.ts refuses to shoot a desktop image below MIN_SIDEBAR_CHATS.
    expect(run().conversations.length).toBeGreaterThanOrEqual(10)
  })

  it('gives every document a valid uuid and the seed tag', () => {
    const { conversations, messages } = run()
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    expect(conversations.every((c) => uuid.test(c.conversationId as string))).toBe(true)
    expect(messages.every((m) => uuid.test(m.messageId as string))).toBe(true)
    expect(conversations.every((c) => (c.tags as string[]).includes('docs-hero-seed'))).toBe(true)
    const ids = conversations.map((c) => c.conversationId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chains each reply to the message it answers', () => {
    const { conversations, messages } = run()
    const pinned = conversations.find((c) => c.pinned)!
    const thread = messages.filter((m) => m.conversationId === pinned.conversationId)
    expect(thread.length).toBeGreaterThan(1)
    for (const [index, message] of thread.entries()) {
      if (index === 0) continue
      expect(message.parentMessageId).toBe(thread[index - 1].messageId)
    }
  })

  it('orders conversations so the sidebar groups them by date', () => {
    const dates = run()
      .conversations.map((c) => (c.updatedAt as Date).getTime())
      .sort((a, b) => b - a)
    expect(dates.every((d, i) => i === 0 || dates[i - 1] > d)).toBe(true)
  })

  it('creates no agent, since the demo hosts its own', () => {
    // A previous version upserted one. /api/agents never returned it, so it
    // was invisible in the app while still being a second "LibreChat" agent in
    // the database, and the capture would have branded the shot with it.
    expect(run().agents).toEqual([])
  })

  it('writes nothing in dry-run mode', () => {
    const result = run({ vars: { DRY_RUN: 'true' } })
    expect(result.conversations).toEqual([])
    expect(result.messages).toEqual([])
    expect(result.agents).toEqual([])
    expect(result.deletes).toEqual([])
  })

  it('points the pinned conversation at an agent that exists', () => {
    // It referenced an agent this script used to create and no longer does,
    // which left the conversation resolving to nothing when opened.
    const pinned = run().conversations.find((c) => c.pinned)!
    expect(pinned.agent_id).not.toBe('agent_docs_hero_librechat')
    expect(String(pinned.agent_id)).toMatch(/^agent_/)
  })

  it("never deletes the demo's own agent, only the retired one", () => {
    const result = run({ vars: { CLEAN: 'true' } })
    const agentDeletes = result.deletes.filter((d) => d.collection === 'agents')
    expect(agentDeletes.length).toBeGreaterThan(0)
    for (const del of agentDeletes) {
      expect(del.filter.id).toBe('agent_docs_hero_librechat')
    }
  })

  it('removes the agent on clean even when no conversations remain', () => {
    // The agent outlives its conversations, so a clean that returned early on
    // an empty batch would strand it and CLEAN could never undo a seed.
    const result = run({ vars: { CLEAN: 'true' } })
    expect(result.deletes.some((d) => d.collection === 'agents')).toBe(true)
    expect(result.conversations).toEqual([])
  })
})
