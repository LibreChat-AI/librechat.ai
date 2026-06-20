import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { join } from 'node:path'

const DEFAULT_BASE = join(process.cwd(), 'content/.i18n-cache')

/** Per-locale, content-hash-keyed translation memory persisted as JSON. */
export class TM {
  private dirty = false
  private used = new Set<string>()

  private constructor(
    private readonly locale: string,
    private readonly baseDir: string,
    private store: Record<string, string>,
  ) {}

  static async load(locale: string, baseDir: string = DEFAULT_BASE): Promise<TM> {
    let raw: string
    try {
      raw = await readFile(join(baseDir, `${locale}.json`), 'utf8')
    } catch {
      return new TM(locale, baseDir, {}) // No cache yet — start fresh.
    }
    try {
      const parsed: unknown = JSON.parse(raw)
      // A corrupt/half-written or non-object cache must not crash get()/prune();
      // discard it and re-translate rather than operating on bad data.
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('cache is not a JSON object')
      }
      return new TM(locale, baseDir, parsed as Record<string, string>)
    } catch (e) {
      console.warn(
        `[i18n] ignoring corrupt translation cache ${locale}.json: ${(e as Error).message}`,
      )
      return new TM(locale, baseDir, {})
    }
  }

  get(hash: string): string | undefined {
    return this.store[hash]
  }

  has(hash: string): boolean {
    return hash in this.store
  }

  set(hash: string, value: string): void {
    if (this.store[hash] !== value) this.dirty = true
    this.store[hash] = value
    this.used.add(hash)
  }

  markUsed(hash: string): void {
    this.used.add(hash)
  }

  prune(): void {
    for (const hash of Object.keys(this.store)) {
      if (!this.used.has(hash)) {
        delete this.store[hash]
        this.dirty = true
      }
    }
  }

  async save(): Promise<void> {
    if (!this.dirty) return
    const sorted: Record<string, string> = {}
    for (const key of Object.keys(this.store).sort()) sorted[key] = this.store[key]
    await mkdir(this.baseDir, { recursive: true })
    // Write-then-rename so an interrupted run (Ctrl-C, OOM, CI timeout) can never
    // leave a half-written JSON file that the next load would have to discard.
    const file = join(this.baseDir, `${this.locale}.json`)
    const tmp = `${file}.tmp`
    await writeFile(tmp, `${JSON.stringify(sorted, null, 2)}\n`)
    await rename(tmp, file)
  }
}
