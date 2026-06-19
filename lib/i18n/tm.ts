import { readFile, writeFile, mkdir } from 'node:fs/promises'
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
    try {
      const raw = await readFile(join(baseDir, `${locale}.json`), 'utf8')
      return new TM(locale, baseDir, JSON.parse(raw) as Record<string, string>)
    } catch {
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
    await writeFile(
      join(this.baseDir, `${this.locale}.json`),
      `${JSON.stringify(sorted, null, 2)}\n`,
    )
  }
}
