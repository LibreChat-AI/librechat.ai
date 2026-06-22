import { describe, it, expect, vi, afterEach } from 'vitest'
import { progress } from './progress'

function capture(fn: () => void): string[] {
  const lines: string[] = []
  const spy = vi.spyOn(console, 'log').mockImplementation((...args) => {
    lines.push(args.join(' '))
  })
  try {
    fn()
  } finally {
    spy.mockRestore()
  }
  return lines
}

afterEach(() => {
  // Leave the singleton torn down so a stray heartbeat timer can't outlive a test.
  progress.end()
})

describe('progress (ci mode)', () => {
  it('collapses retries into a counter instead of one log line per attempt', () => {
    const stats = { translatedBlocks: 0, cachedBlocks: 0, skipped: [] as string[] }
    const lines = capture(() => {
      progress.configure('ci')
      progress.begin({ locales: ['de'], filesPerLocale: 2, stats })
      progress.startLocale('de')
      // Many backoffs on one file: the old behaviour logged a line each time.
      for (let i = 0; i < 50; i++) progress.retry()
      progress.fileDone('de')
      progress.fileDone('de')
      progress.finishLocale('de')
      progress.end()
    })

    // None of the per-attempt spam ("rate-limited/transient error, retry N/6").
    expect(lines.some((l) => /rate-limited|retry \d+\/\d+/.test(l))).toBe(false)
    // The total is surfaced once, in the completion summary.
    const complete = lines.find((l) => l.includes('complete'))
    expect(complete).toMatch(/50 retries/)
  })

  it('reports per-locale completion and an overall summary', () => {
    const stats = { translatedBlocks: 4, cachedBlocks: 1, skipped: [] as string[] }
    const lines = capture(() => {
      progress.configure('ci')
      progress.begin({ locales: ['de', 'fr'], filesPerLocale: 1, stats })
      for (const loc of ['de', 'fr']) {
        progress.startLocale(loc)
        progress.fileDone(loc)
        progress.finishLocale(loc)
      }
      progress.end()
    })
    expect(lines.some((l) => l.includes('✓ de'))).toBe(true)
    expect(lines.some((l) => l.includes('✓ fr'))).toBe(true)
    expect(lines.some((l) => /complete · 2\/2 files/.test(l))).toBe(true)
  })
})

describe('progress (silent mode)', () => {
  it('produces no output, so unit tests calling runTranslation stay quiet', () => {
    const stats = { translatedBlocks: 0, cachedBlocks: 0, skipped: [] as string[] }
    const lines = capture(() => {
      progress.configure('silent')
      progress.begin({ locales: ['de'], filesPerLocale: 3, stats })
      progress.startLocale('de')
      progress.retry()
      progress.note('retrying 1 file')
      progress.fileDone('de')
      progress.finishLocale('de')
      progress.end()
    })
    expect(lines).toEqual([])
  })
})
