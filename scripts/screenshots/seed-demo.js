/**
 * Seeds the demo account with the sidebar content the landing-page hero shots
 * need: a spread of conversations across providers so the sidebar shows a
 * column of different provider icons, plus a LibreChat agent.
 *
 * Runs under mongosh so this repo needs no database dependency:
 *
 *   mongosh "$MONGO_URI" --eval 'DEMO_EMAIL="demo@example.com"' scripts/screenshots/seed-demo.js
 *
 * Flags, set the same way as DEMO_EMAIL:
 *   DRY_RUN=true   report what would change and write nothing
 *   CLEAN=true     remove everything a previous run seeded, then exit
 *
 * Idempotent: every document it creates is tagged with SEED_TAG, and a normal
 * run clears the previous batch first. It never touches conversations you
 * created by hand.
 *
 * No inference is billed. Assistant replies are written straight to the
 * messages collection rather than generated.
 */

/* global db, DEMO_EMAIL, DEMO_BASE_URL, DRY_RUN, CLEAN, print, quit */

/**
 * LibreChat stores conversationId and messageId as canonical UUID strings.
 * mongosh's own UUID() is a BSON binary with no hex accessor, so use the
 * WebCrypto generator, which mongosh exposes and which already returns the
 * dashed form.
 */
function uuid() {
  return crypto.randomUUID()
}

const SEED_TAG = 'docs-hero-seed'
const AGENT_ID = 'agent_docs_hero_librechat'
// Served by the demo itself; www.librechat.ai/assets/logo.svg is a 404.
// Override with DEMO_ORIGIN if the demo is hosted elsewhere.
const DEMO_ORIGIN =
  typeof DEMO_BASE_URL === 'undefined' || !DEMO_BASE_URL
    ? 'https://chat.librechat.ai'
    : String(DEMO_BASE_URL).replace(/\/+$/, '')
const LIBRECHAT_AVATAR = `${DEMO_ORIGIN}/assets/logo.svg`

/**
 * `endpoint` picks the sidebar icon. These names must match endpoints the demo
 * actually has configured in librechat.yaml, otherwise LibreChat falls back to
 * a generic icon and the row looks broken. Check the demo's config and prune
 * this list before running; the script reports which endpoints it used so a
 * wrong one is obvious in the screenshot afterwards.
 *
 * `model` is shown when a conversation is opened, and drives the icon for
 * endpoints that vary by model (openAI's gpt-4o vs o1, for example).
 */
const CHATS = [
  { endpoint: 'anthropic', model: 'claude-sonnet-4-5', title: 'Refactor this React hook' },
  { endpoint: 'openAI', model: 'gpt-4o', title: 'Explaining quantum mechanics' },
  { endpoint: 'google', model: 'gemini-2.5-pro', title: 'Summarize this paper' },
  { endpoint: 'anthropic', model: 'claude-opus-4-1', title: 'Plan a trip to Tokyo' },
  { endpoint: 'openAI', model: 'gpt-4o-mini', title: 'Best apps for learning guitar' },
  { endpoint: 'google', model: 'gemini-2.5-flash', title: 'Understanding climate data' },
  { endpoint: 'anthropic', model: 'claude-sonnet-4-5', title: 'Debug a failing CI pipeline' },
  { endpoint: 'openAI', model: 'gpt-4o', title: 'Ideas for a weekend getaway' },
  { endpoint: 'google', model: 'gemini-2.5-pro', title: 'Compare vector databases' },
  { endpoint: 'anthropic', model: 'claude-sonnet-4-5', title: 'Write a SQL migration' },
  { endpoint: 'openAI', model: 'gpt-4o', title: 'How to fix a flat tire' },
  { endpoint: 'google', model: 'gemini-2.5-flash', title: 'Beginner guide to gardening' },
  { endpoint: 'anthropic', model: 'claude-opus-4-1', title: 'Design a REST API' },
  { endpoint: 'openAI', model: 'gpt-4o', title: 'Improving productivity at work' },
  { endpoint: 'google', model: 'gemini-2.5-pro', title: 'Troubleshooting Wi-Fi' },
  { endpoint: 'anthropic', model: 'claude-sonnet-4-5', title: 'Explain Kubernetes operators' },
  { endpoint: 'openAI', model: 'gpt-4o-mini', title: 'Creative gift ideas' },
  { endpoint: 'google', model: 'gemini-2.5-flash', title: 'How to start running' },
  { endpoint: 'anthropic', model: 'claude-sonnet-4-5', title: 'Review my Dockerfile' },
  { endpoint: 'openAI', model: 'gpt-4o', title: 'Best tools for video editing' },
  { endpoint: 'google', model: 'gemini-2.5-pro', title: 'Understanding cryptocurrency' },
  { endpoint: 'anthropic', model: 'claude-sonnet-4-5', title: 'Optimize a slow query' },
  { endpoint: 'openAI', model: 'gpt-4o', title: 'Home automation ideas' },
  { endpoint: 'google', model: 'gemini-2.5-flash', title: 'Learning a new language' },
  { endpoint: 'anthropic', model: 'claude-opus-4-1', title: 'Architecture review' },
]

/** The pinned conversation, shot as the hero when a conversation is captured. */
const PINNED = {
  title: 'Getting started with LibreChat',
  turns: [
    {
      user: 'What can I do with LibreChat?',
      assistant:
        'Quite a lot. LibreChat is an open-source chat app that puts every major AI provider behind one interface: OpenAI, Anthropic, Google, Azure, AWS Bedrock, and any OpenAI-compatible endpoint. You can switch models mid-conversation, build custom agents with tools, search the web, generate images, and run everything self-hosted with full control over your data.',
    },
    {
      user: 'Can I use my own API keys and self-host it?',
      assistant:
        'Yes. You bring your own keys per provider, and LibreChat runs anywhere Docker does, so your conversations and keys stay on your own infrastructure. There is no per-seat lock-in, and the whole stack is MIT-licensed.',
    },
  ],
}

const dryRun = typeof DRY_RUN !== 'undefined' && String(DRY_RUN) === 'true'
const clean = typeof CLEAN !== 'undefined' && String(CLEAN) === 'true'

if (typeof DEMO_EMAIL === 'undefined' || !DEMO_EMAIL) {
  print('ERROR: pass the demo account with --eval \'DEMO_EMAIL="..."\'')
  quit(1)
}

const user = db.users.findOne({ email: DEMO_EMAIL })
if (!user) {
  print(`ERROR: no user with email ${DEMO_EMAIL} in database "${db.getName()}"`)
  print('Check that the connection string includes the LibreChat database name.')
  quit(1)
}
const userId = String(user._id)
print(`user: ${DEMO_EMAIL} -> ${userId}`)
print(`database: ${db.getName()}`)

function removeSeeded() {
  const convos = db.conversations.find({ user: userId, tags: SEED_TAG }, { conversationId: 1 })
  const ids = convos.map((c) => c.conversationId)
  if (ids.length === 0) {
    print('nothing previously seeded')
    return
  }
  if (dryRun) {
    print(`would remove ${ids.length} seeded conversations and their messages`)
    return
  }
  const messages = db.messages.deleteMany({ user: userId, conversationId: { $in: ids } })
  const removed = db.conversations.deleteMany({ user: userId, tags: SEED_TAG })
  db.agents.deleteMany({ id: AGENT_ID })
  print(`removed ${removed.deletedCount} conversations, ${messages.deletedCount} messages, agent`)
}

if (clean) {
  removeSeeded()
  print('clean complete')
  quit(0)
}

// Replace the previous batch so re-running does not pile up duplicates.
removeSeeded()

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

const agent = {
  id: AGENT_ID,
  name: 'LibreChat',
  description: 'The default LibreChat agent',
  instructions: 'You are a helpful assistant for the LibreChat demo.',
  avatar: { filepath: LIBRECHAT_AVATAR, source: 'url' },
  provider: 'anthropic',
  model: 'claude-sonnet-4-5',
  model_parameters: {},
  tools: [],
  author: user._id,
  authorName: user.name || 'LibreChat',
  category: 'general',
  conversation_starters: [],
  versions: [],
  projectIds: [],
}

if (dryRun) {
  print(`would upsert agent ${AGENT_ID} ("LibreChat")`)
} else {
  db.agents.updateOne({ id: AGENT_ID }, { $set: agent }, { upsert: true })
  print(`agent: ${AGENT_ID} ("LibreChat")`)
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

// mongosh has no Date.now() restriction, but keep one clock reading so the
// staggered timestamps are consistent within a run.
const now = new Date()
const HOUR = 60 * 60 * 1000

/** Spreads conversations backwards in time so the sidebar shows date groups. */
function timestampFor(index) {
  return new Date(now.getTime() - (index + 1) * 6 * HOUR)
}

function buildConversation(spec, index, extra) {
  const at = timestampFor(index)
  return Object.assign(
    {
      conversationId: uuid(),
      title: spec.title,
      user: userId,
      endpoint: spec.endpoint,
      model: spec.model,
      messages: [],
      tags: [SEED_TAG],
      isTemporary: false,
      createdAt: at,
      updatedAt: at,
    },
    extra || {},
  )
}

function buildMessages(conversationId, turns, endpoint, model, at) {
  const docs = []
  let parentMessageId = '00000000-0000-0000-0000-000000000000'
  for (const [i, turn] of turns.entries()) {
    const userMessageId = uuid()
    const replyId = uuid()
    const stamp = new Date(at.getTime() + i * 60 * 1000)
    docs.push({
      messageId: userMessageId,
      conversationId,
      user: userId,
      parentMessageId,
      sender: 'User',
      text: turn.user,
      isCreatedByUser: true,
      error: false,
      unfinished: false,
      createdAt: stamp,
      updatedAt: stamp,
    })
    docs.push({
      messageId: replyId,
      conversationId,
      user: userId,
      parentMessageId: userMessageId,
      sender: 'LibreChat',
      text: turn.assistant,
      isCreatedByUser: false,
      error: false,
      unfinished: false,
      endpoint,
      model,
      createdAt: new Date(stamp.getTime() + 5000),
      updatedAt: new Date(stamp.getTime() + 5000),
    })
    parentMessageId = replyId
  }
  return docs
}

const conversations = []
const messages = []

// The pinned hero conversation, on the LibreChat agent.
const pinnedConvo = buildConversation(
  { title: PINNED.title, endpoint: 'agents', model: agent.model },
  -1,
  { pinned: true, agent_id: AGENT_ID, iconURL: LIBRECHAT_AVATAR },
)
pinnedConvo.createdAt = now
pinnedConvo.updatedAt = now
conversations.push(pinnedConvo)
messages.push(
  ...buildMessages(pinnedConvo.conversationId, PINNED.turns, 'agents', agent.model, now),
)

for (const [index, spec] of CHATS.entries()) {
  const convo = buildConversation(spec, index)
  conversations.push(convo)
  messages.push(
    ...buildMessages(
      convo.conversationId,
      [{ user: `${spec.title}?`, assistant: `Here is a rundown of ${spec.title.toLowerCase()}.` }],
      spec.endpoint,
      spec.model,
      convo.createdAt,
    ),
  )
}

const byEndpoint = {}
for (const c of conversations) {
  byEndpoint[c.endpoint] = (byEndpoint[c.endpoint] || 0) + 1
}

if (dryRun) {
  print(`would insert ${conversations.length} conversations, ${messages.length} messages`)
} else {
  db.conversations.insertMany(conversations)
  db.messages.insertMany(messages)
  print(`inserted ${conversations.length} conversations, ${messages.length} messages`)
}

print('')
print('endpoints used (each must exist in the demo librechat.yaml or the icon falls back):')
for (const endpoint of Object.keys(byEndpoint).sort()) {
  print(`  ${endpoint}: ${byEndpoint[endpoint]}`)
}
print('')
print(`pinned hero conversation: ${pinnedConvo.conversationId}`)
print('Set that as DEMO_CONVERSATION_ID if capturing the conversation view.')
