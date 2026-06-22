/**
 * Progress reporter for the docs translation pipeline.
 *
 * Three modes, chosen once by the entrypoint via `configure()`:
 *   - 'tty'    — a live, in-place dashboard (per-locale bars + overall bar/ETA)
 *                for an interactive terminal.
 *   - 'ci'     — periodic single-line heartbeats for non-interactive logs
 *                (GitHub Actions). Per-attempt retry noise is collapsed into a
 *                running counter instead of one log line per backoff.
 *   - 'silent' — the default; a complete no-op so unit tests that call
 *                `runTranslation` stay quiet and side-effect free.
 *
 * It is a module singleton because the per-retry signal originates deep in the
 * model wrapper (engine.ts) while file/locale progress originates in run.ts;
 * threading a reporter object through `model.generate()` would touch every layer.
 */

type Mode = 'tty' | 'ci' | 'silent'

interface StatsRef {
  translatedBlocks: number
  cachedBlocks: number
  skipped: string[]
}

const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

const TTY_FRAME_MS = 250
const CI_HEARTBEAT_MS = 15_000

const ansi = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
}

const fmt = (n: number) => n.toLocaleString('en-US')

function fmtDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const total = Math.round(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m${String(s).padStart(2, '0')}s`
  return `${s}s`
}

function pct(frac: number): string {
  return `${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%`
}

function bar(frac: number, width: number, color: boolean): string {
  const filled = Math.max(0, Math.min(width, Math.round(frac * width)))
  const fill = '█'.repeat(filled)
  const track = '░'.repeat(width - filled)
  return color ? ansi.cyan(fill) + ansi.dim(track) : fill + track
}

class Progress {
  private mode: Mode = 'silent'
  private locales: string[] = []
  private filesPerLocale = 0
  private stats: StatsRef = { translatedBlocks: 0, cachedBlocks: 0, skipped: [] }
  private completed = new Map<string, number>()
  private completedTotal = 0
  private active: string | null = null
  private finished = new Set<string>()
  private retries = 0
  private status = ''
  private startedAt = 0
  private tick = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private lastLines = 0
  private lastHeartbeat = 0
  private ended = false

  /**
   * Pick the mode. With no argument it auto-detects: a real TTY (and not a CI
   * runner) gets the live dashboard, everything else gets heartbeat logging.
   * `TRANSLATE_PROGRESS=tty|ci|silent` forces a mode (useful for local debugging).
   */
  configure(mode?: Mode): void {
    if (mode) {
      this.mode = mode
      return
    }
    const env = process.env.TRANSLATE_PROGRESS
    if (env === 'tty' || env === 'ci' || env === 'silent') {
      this.mode = env
      return
    }
    this.mode = process.stdout.isTTY && !process.env.CI ? 'tty' : 'ci'
  }

  begin(opts: { locales: string[]; filesPerLocale: number; stats: StatsRef }): void {
    this.locales = opts.locales
    this.filesPerLocale = opts.filesPerLocale
    this.stats = opts.stats
    this.completed = new Map()
    this.completedTotal = 0
    this.active = null
    this.finished = new Set()
    this.retries = 0
    this.status = ''
    this.startedAt = Date.now()
    this.lastHeartbeat = this.startedAt
    this.ended = false
    if (this.mode === 'silent') return

    const total = this.locales.length * this.filesPerLocale
    if (this.mode === 'ci') {
      console.log(
        `[translate] starting · ${this.locales.length} locale(s) · ${fmt(total)} file unit(s)`,
      )
      this.timer = setInterval(() => this.heartbeat(false), CI_HEARTBEAT_MS)
    } else {
      process.stdout.write('\x1b[?25l') // hide cursor
      this.timer = setInterval(() => this.paint(), TTY_FRAME_MS)
    }
    this.timer?.unref?.()
  }

  startLocale(locale: string): void {
    this.active = locale
    if (!this.completed.has(locale)) this.completed.set(locale, 0)
  }

  finishLocale(locale: string): void {
    this.finished.add(locale)
    if (this.mode === 'ci') {
      const c = this.completed.get(locale) ?? 0
      console.log(
        `[translate] ✓ ${locale} · ${fmt(c)}/${fmt(this.filesPerLocale)} files · ${fmtDuration(Date.now() - this.startedAt)} elapsed`,
      )
    }
  }

  /** A file reached a terminal state (written or deliberately skipped). */
  fileDone(locale: string): void {
    this.completed.set(locale, (this.completed.get(locale) ?? 0) + 1)
    this.completedTotal++
  }

  /** A single in-flight request backed off. Counted, never logged per-attempt. */
  retry(): void {
    this.retries++
  }

  /** An incidental notice (e.g. a retry round). Folded into the UI, not spammed. */
  note(message: string): void {
    if (this.mode === 'ci') console.log(`[translate] ${message}`)
    else if (this.mode === 'tty') this.status = message
  }

  end(): void {
    if (this.ended || this.mode === 'silent') return
    this.ended = true
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.mode === 'tty') {
      this.paint()
      process.stdout.write('\x1b[?25h\n') // show cursor
    } else if (this.mode === 'ci') {
      const total = this.locales.length * this.filesPerLocale
      console.log(
        `[translate] complete · ${fmt(this.completedTotal)}/${fmt(total)} files · ${fmtDuration(Date.now() - this.startedAt)} elapsed · ⟳ ${fmt(this.retries)} retries`,
      )
    }
  }

  private heartbeat(force: boolean): void {
    const now = Date.now()
    if (!force && now - this.lastHeartbeat < CI_HEARTBEAT_MS - 1) return
    this.lastHeartbeat = now
    const total = this.locales.length * this.filesPerLocale
    const done = this.completedTotal
    const elapsed = now - this.startedAt
    const eta = done > 0 ? (elapsed * (total - done)) / done : Number.POSITIVE_INFINITY
    const c = this.active ? (this.completed.get(this.active) ?? 0) : 0
    const localePart = this.active
      ? `${this.active} ${fmt(c)}/${fmt(this.filesPerLocale)} (${pct(this.filesPerLocale ? c / this.filesPerLocale : 0)}) · `
      : ''
    console.log(
      `[translate] ${localePart}overall ${fmt(done)}/${fmt(total)} (${pct(total ? done / total : 0)}) · ${fmtDuration(elapsed)} elapsed · ~${fmtDuration(eta)} left · ⟳ ${fmt(this.retries)} retries`,
    )
  }

  private paint(): void {
    this.tick++
    const frame = this.frame()
    const lineCount = frame.split('\n').length
    let out = ''
    if (this.lastLines > 0) out += `\x1b[${this.lastLines}A`
    out += '\x1b[0J' // clear from cursor to end of screen
    out += frame + '\n'
    process.stdout.write(out)
    this.lastLines = lineCount
  }

  private frame(): string {
    const total = this.locales.length * this.filesPerLocale
    const done = this.completedTotal
    const elapsed = Date.now() - this.startedAt
    const frac = total ? done / total : 0
    const eta = done > 0 && done < total ? (elapsed * (total - done)) / done : 0
    const spin = SPIN[this.tick % SPIN.length]
    const width = String(this.filesPerLocale).length

    const lines: string[] = []
    lines.push(
      ansi.bold(`Translating docs`) +
        ansi.dim(` → ${this.locales.length} locales · ${fmt(total)} files`),
    )
    lines.push('')
    for (const locale of this.locales) {
      const c = this.completed.get(locale) ?? 0
      const lf = this.filesPerLocale ? c / this.filesPerLocale : 0
      const marker = this.finished.has(locale)
        ? ansi.green('✓')
        : locale === this.active
          ? ansi.cyan(spin)
          : ' '
      lines.push(
        `  ${marker} ${locale.padEnd(3)} ${bar(lf, 18, true)} ${pct(lf).padStart(4)}  ` +
          `${String(c).padStart(width)}/${this.filesPerLocale}`,
      )
    }
    lines.push('')
    lines.push(
      `  ${ansi.bold('overall')} ${bar(frac, 18, true)} ${pct(frac).padStart(4)}  ` +
        `${fmt(done)}/${fmt(total)}   ` +
        ansi.dim(`${fmtDuration(elapsed)} elapsed · ~${fmtDuration(eta)} left`),
    )
    lines.push(
      ansi.dim(
        `         ${fmt(this.stats.translatedBlocks)} translated · ${fmt(this.stats.cachedBlocks)} cached · ` +
          `${this.stats.skipped.length} skipped · ⟳ ${fmt(this.retries)} retries`,
      ),
    )
    if (this.status) lines.push(ansi.dim(`         ${this.status}`))
    return lines.join('\n')
  }
}

export const progress = new Progress()
