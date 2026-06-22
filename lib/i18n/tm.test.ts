import { describe, it, expect, beforeEach } from 'vitest'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TM } from './tm'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'tm-'))
})

describe('TM', () => {
  it('returns undefined for a missing hash', async () => {
    const tm = await TM.load('zh', dir)
    expect(tm.get('abc')).toBeUndefined()
    expect(tm.has('abc')).toBe(false)
  })

  it('persists and reloads entries', async () => {
    const tm = await TM.load('zh', dir)
    tm.set('abc', '你好')
    await tm.save()

    const reloaded = await TM.load('zh', dir)
    expect(reloaded.get('abc')).toBe('你好')

    const raw = await readFile(join(dir, 'zh.json'), 'utf8')
    expect(JSON.parse(raw)).toEqual({ abc: '你好' })
  })

  it('delete removes an entry and persists its removal', async () => {
    const tm = await TM.load('zh', dir)
    tm.set('a', '1')
    tm.set('b', '2')
    tm.delete('a')
    expect(tm.get('a')).toBeUndefined()
    expect(tm.get('b')).toBe('2')
    await tm.save()

    const reloaded = await TM.load('zh', dir)
    expect(reloaded.get('a')).toBeUndefined()
    expect(reloaded.get('b')).toBe('2')
  })

  it('delete of a missing hash is a no-op', async () => {
    const tm = await TM.load('zh', dir)
    expect(() => tm.delete('nope')).not.toThrow()
    expect(tm.get('nope')).toBeUndefined()
  })

  it('prune drops entries not marked used this run', async () => {
    const tm = await TM.load('zh', dir)
    tm.set('keep', 'k')
    tm.set('drop', 'd')
    await tm.save()

    const next = await TM.load('zh', dir)
    next.markUsed('keep')
    next.prune()
    expect(next.get('keep')).toBe('k')
    expect(next.get('drop')).toBeUndefined()
  })
})
