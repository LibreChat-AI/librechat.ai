import { execFile as execFileCallback } from 'node:child_process'
import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { DOCS_VERSION_ID_PATTERN } from '../lib/docs-version-order'
import { i18n } from '../lib/i18n'

const execFile = promisify(execFileCallback)
const MAX_BUFFER = 100 * 1024 * 1024
const PREFIX = '[docs-archive]'

export function isValidVersionId(version: string): boolean {
  return DOCS_VERSION_ID_PATTERN.test(version)
}

export function isLocalizedFile(
  filePath: string,
  languages: readonly string[] = i18n.languages,
): boolean {
  const basename = filePath.replaceAll('\\', '/').split('/').pop() ?? filePath

  return languages.some(
    (locale) => basename.endsWith(`.${locale}.mdx`) || basename === `meta.${locale}.json`,
  )
}

function rewriteLinksWithCount(
  content: string,
  version: string,
): { content: string; count: number } {
  const targetPattern =
    /(\]\(\s*|href\s*=\s*(?:["']|\{\s*["'])|url:\s*)(\/docs)(?=\/|[?#)]|["'\s}])/g
  let count = 0
  let inFence = false
  const segments = content.split(/(?<=\n)/)

  const rewritten = segments.map((segment) => {
    if (/^\s*```/.test(segment)) {
      inFence = !inFence
      return segment
    }

    if (inFence) {
      return segment
    }

    return segment.replaceAll(targetPattern, (_match, prefix: string) => {
      count += 1
      return `${prefix}/${version}/docs`
    })
  })

  return { content: rewritten.join(''), count }
}

export function rewriteArchivedLinks(content: string, version: string): string {
  return rewriteLinksWithCount(content, version).content
}

export interface ArchiveOptions {
  version: string
  ref?: string
  force?: boolean
  cwd?: string
}

export interface ArchiveResult {
  version: string
  ref: string
  filesWritten: number
  filesSkippedLocalized: number
  linksRewritten: number
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function gitOutput(args: string[], cwd: string): Promise<Buffer> {
  const result = await execFile('git', args, {
    cwd,
    encoding: 'buffer',
    maxBuffer: MAX_BUFFER,
  })
  return result.stdout as Buffer
}

async function gitText(args: string[], cwd: string): Promise<string> {
  return (await gitOutput(args, cwd)).toString('utf8')
}

async function prepareDestination(destination: string, force: boolean): Promise<void> {
  if (await pathExists(destination)) {
    let entries: string[]
    try {
      entries = await readdir(destination)
    } catch {
      entries = ['<non-directory>']
    }

    if (force) {
      await rm(destination, { recursive: true, force: true })
    } else if (entries.length > 0) {
      throw new Error(
        `${PREFIX} destination ${destination} is not empty; pass --force to replace it`,
      )
    }
  }

  await mkdir(destination, { recursive: true })
}

export async function archiveDocsVersion({
  version,
  ref = 'HEAD',
  force = false,
  cwd = process.cwd(),
}: ArchiveOptions): Promise<ArchiveResult> {
  if (!isValidVersionId(version)) {
    throw new Error(
      `${PREFIX} invalid version "${version}"; expected e.g. v0.8.7, v0.8.8-rc2 or v0.8.x`,
    )
  }

  const destination = path.join(cwd, 'content', 'docs-archive', version)

  let paths: string[]
  try {
    const listing = await gitText(['ls-tree', '-r', '--name-only', ref, '--', 'content/docs'], cwd)
    paths = listing.split('\n').filter(Boolean)
  } catch {
    throw new Error(`${PREFIX} git ref not found or cannot be read: ${ref}`)
  }

  await prepareDestination(destination, force)

  let filesWritten = 0
  let filesSkippedLocalized = 0
  let linksRewritten = 0

  for (const sourcePath of paths) {
    if (isLocalizedFile(sourcePath)) {
      filesSkippedLocalized += 1
      continue
    }

    const relativePath = sourcePath.slice('content/docs/'.length)
    const destinationPath = path.join(destination, ...relativePath.split('/'))
    let contents: Buffer

    try {
      contents = await gitOutput(['show', `${ref}:${sourcePath}`], cwd)
    } catch {
      throw new Error(`${PREFIX} could not read ${sourcePath} from git ref ${ref}`)
    }

    if (sourcePath.endsWith('.mdx')) {
      const rewritten = rewriteLinksWithCount(contents.toString('utf8'), version)
      contents = Buffer.from(rewritten.content, 'utf8')
      linksRewritten += rewritten.count
    }

    await mkdir(path.dirname(destinationPath), { recursive: true })
    await writeFile(destinationPath, contents)
    filesWritten += 1
  }

  return { version, ref, filesWritten, filesSkippedLocalized, linksRewritten }
}

function usage(): string {
  return [
    'Usage: pnpm docs:archive <version> [--ref=<git-ref>] [--force] [--help]',
    '',
    'Create an English-only archived snapshot of content/docs from a git ref.',
    '',
    'Options:',
    '  --ref=<git-ref>  Read docs from this git ref (default: HEAD)',
    '  --force          Replace an existing archive destination',
    '  --help           Show this help message',
  ].join('\n')
}

interface CliOptions {
  version?: string
  ref: string
  force: boolean
  help: boolean
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { ref: 'HEAD', force: false, help: false }

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }

    if (arg === '--force') {
      options.force = true
      continue
    }

    if (arg.startsWith('--ref=')) {
      options.ref = arg.slice('--ref='.length)
      if (!options.ref) {
        throw new Error(`${PREFIX} --ref requires a git ref`)
      }
      continue
    }

    if (arg.startsWith('-')) {
      throw new Error(`${PREFIX} unknown option: ${arg}`)
    }

    if (options.version) {
      throw new Error(`${PREFIX} expected one version argument, got: ${arg}`)
    }
    options.version = arg
  }

  if (!options.help && !options.version) {
    throw new Error(`${PREFIX} a version is required`)
  }

  return options
}

export async function main(): Promise<void> {
  let options: CliOptions
  try {
    options = parseArgs(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : `${PREFIX} ${String(error)}`)
    console.error(usage())
    process.exitCode = 1
    return
  }

  if (options.help) {
    console.log(usage())
    return
  }

  try {
    const result = await archiveDocsVersion({
      // parseArgs rejects a missing version unless --help short-circuits above.
      version: options.version!,
      ref: options.ref,
      force: options.force,
    })
    console.log(
      `${PREFIX} version=${result.version} ref=${result.ref} files written=${result.filesWritten} files skipped as localized=${result.filesSkippedLocalized} links rewritten=${result.linksRewritten}`,
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : `${PREFIX} ${String(error)}`)
    process.exitCode = 1
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null
const modulePath = fileURLToPath(import.meta.url)

if (invokedPath === modulePath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : `${PREFIX} ${String(error)}`)
    process.exitCode = 1
  })
}
