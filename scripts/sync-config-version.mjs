import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_CHANGELOG_DIR = 'content/changelog'
export const DEFAULT_DOCS_DIR = 'content/docs'

const CONFIG_VERSION_COMMENT = '# Configuration version (required)'
const CONFIG_CHANGELOG_FILE_PATTERN = /^config_v(.+)\.mdx$/
const FRONTMATTER_VERSION_PATTERN = /^version:\s*['"]?([^'"\n]+)['"]?\s*$/m
const YAML_FENCE_PATTERN = /^([ \t]*```ya?ml[^\r\n]*\r?\n)([\s\S]*?)(^[ \t]*```[ \t]*$)/gim
const TOP_LEVEL_VERSION_PATTERN =
  /^version:\s*(['"]?)(\d+\.\d+(?:\.\d+)?)(\1)([^\S\r\n]*(?:#.*)?)?$/gm

export function parseConfigVersion(version) {
  const parts = version.split('.')
  const hasInvalidPart = parts.some((part) => /^\d+$/.test(part) === false)

  if (parts.length < 2 || parts.length > 3 || hasInvalidPart) {
    throw new Error(`Invalid config version: ${version}`)
  }

  const numbers = parts.map((part) => Number.parseInt(part, 10))

  if (parts.length === 2 && /^0\d+$/.test(parts[1])) {
    return [numbers[0], 0, numbers[1]]
  }

  if (parts.length === 2) {
    return [numbers[0], numbers[1], 0]
  }

  return [numbers[0], numbers[1], numbers[2]]
}

export function compareConfigVersions(left, right) {
  const leftParts = parseConfigVersion(left)
  const rightParts = parseConfigVersion(right)

  for (let index = 0; index < leftParts.length; index += 1) {
    const difference = leftParts[index] - rightParts[index]
    if (difference !== 0) {
      return difference
    }
  }

  return 0
}

function frontmatterVersion(content, filePath) {
  const frontmatterEnd = content.indexOf('\n---', 3)

  if (content.startsWith('---\n') && frontmatterEnd > 0) {
    const frontmatter = content.slice(4, frontmatterEnd)
    const versionMatch = FRONTMATTER_VERSION_PATTERN.exec(frontmatter)

    if (versionMatch) {
      return versionMatch[1]
    }
  }

  throw new Error(`Missing config version frontmatter in ${filePath}`)
}

export async function findLatestConfigVersion(
  changelogDir = path.join(process.cwd(), DEFAULT_CHANGELOG_DIR),
) {
  const entries = await readdir(changelogDir, { withFileTypes: true })
  let latestVersion = null

  for (const entry of entries) {
    const configMatch = CONFIG_CHANGELOG_FILE_PATTERN.exec(entry.name)

    if (entry.isFile() && configMatch) {
      const filePath = path.join(changelogDir, entry.name)
      const content = await readFile(filePath, 'utf8')
      const version = frontmatterVersion(content, filePath)

      if (version !== configMatch[1]) {
        throw new Error(
          `Config version mismatch in ${filePath}: frontmatter is ${version}, filename is ${configMatch[1]}`,
        )
      }

      if (latestVersion === null || compareConfigVersions(version, latestVersion) > 0) {
        latestVersion = version
      }
    }
  }

  if (latestVersion !== null) {
    return latestVersion
  }

  throw new Error(`No config changelog entries found in ${changelogDir}`)
}

function isLibreChatConfigFence(openingLine, body) {
  return /\blibrechat\.ya?ml\b/i.test(openingLine) || body.includes(CONFIG_VERSION_COMMENT)
}

function updateVersionInFence(body, latestVersion) {
  let updates = 0

  const content = body.replaceAll(
    TOP_LEVEL_VERSION_PATTERN,
    (line, quote, currentVersion, _closingQuote, tail = '') => {
      if (currentVersion === latestVersion) {
        return line
      }

      updates += 1
      return `version: ${quote}${latestVersion}${quote}${tail}`
    },
  )

  return { content, updates }
}

export function updateConfigVersionsInMarkdown(content, latestVersion) {
  let updates = 0

  const nextContent = content.replaceAll(
    YAML_FENCE_PATTERN,
    (fence, openingLine, body, closingLine) => {
      if (isLibreChatConfigFence(openingLine, body)) {
        const updated = updateVersionInFence(body, latestVersion)
        updates += updated.updates
        return `${openingLine}${updated.content}${closingLine}`
      }

      return fence
    },
  )

  return { content: nextContent, updates }
}

async function listMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await listMdxFiles(entryPath)))
    }

    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(entryPath)
    }
  }

  return files
}

export async function syncConfigVersions({
  changelogDir = path.join(process.cwd(), DEFAULT_CHANGELOG_DIR),
  docsDir = path.join(process.cwd(), DEFAULT_DOCS_DIR),
  write = false,
} = {}) {
  const latestVersion = await findLatestConfigVersion(changelogDir)
  const files = await listMdxFiles(docsDir)
  const changedFiles = []
  let updates = 0

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf8')
    const updated = updateConfigVersionsInMarkdown(content, latestVersion)

    if (updated.updates > 0) {
      updates += updated.updates
      changedFiles.push({ filePath, updates: updated.updates })

      if (write) {
        await writeFile(filePath, updated.content)
      }
    }
  }

  return { latestVersion, changedFiles, updates }
}

function usage() {
  return [
    'Usage: node scripts/sync-config-version.mjs [--check|--write]',
    '',
    'Options:',
    '  --check                Report stale librechat.yaml version snippets (default)',
    '  --write                Update stale librechat.yaml version snippets',
    '  --changelog-dir=<dir>  Config changelog directory',
    '  --docs-dir=<dir>       Docs content directory',
  ].join('\n')
}

function parseArgs(argv) {
  const options = { write: false }

  for (const arg of argv) {
    if (arg === '--check') {
      options.write = false
      continue
    }

    if (arg === '--write') {
      options.write = true
      continue
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }

    if (arg.startsWith('--changelog-dir=')) {
      options.changelogDir = arg.slice('--changelog-dir='.length)
      continue
    }

    if (arg.startsWith('--docs-dir=')) {
      options.docsDir = arg.slice('--docs-dir='.length)
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

async function main() {
  let options

  try {
    options = parseArgs(process.argv.slice(2))
  } catch (error) {
    console.error(`[config-version] ${error.message}`)
    console.error(usage())
    process.exitCode = 1
    return
  }

  if (options.help) {
    console.log(usage())
    return
  }

  const result = await syncConfigVersions(options)
  const action = options.write ? 'updated' : 'found'

  if (result.updates === 0) {
    console.log(`[config-version] librechat.yaml examples already use ${result.latestVersion}`)
    return
  }

  console.error(
    `[config-version] ${action} ${result.updates} stale version(s); latest config version is ${result.latestVersion}`,
  )

  for (const changedFile of result.changedFiles) {
    console.error(`[config-version] ${changedFile.filePath} (${changedFile.updates})`)
  }

  if (options.write) {
    return
  }

  console.error('[config-version] run `pnpm sync:config-version` to update docs snippets')
  process.exitCode = 1
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null
const modulePath = fileURLToPath(import.meta.url)

if (invokedPath === modulePath) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
