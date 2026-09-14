import { execFile as execFileCallback } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'
import {
  archiveDocsVersion,
  isLocalizedFile,
  isValidVersionId,
  rewriteArchivedLinks,
} from './archive-docs-version'

const execFile = promisify(execFileCallback)
const temporaryDirectories: string[] = []

async function git(cwd: string, ...args: string[]): Promise<void> {
  await execFile('git', args, {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Archive Test',
      GIT_AUTHOR_EMAIL: 'archive@example.test',
      GIT_COMMITTER_NAME: 'Archive Test',
      GIT_COMMITTER_EMAIL: 'archive@example.test',
    },
  })
}

async function allFiles(directory: string, relative = ''): Promise<string[]> {
  const entries = await readdir(path.join(directory, relative), { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = path.join(relative, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await allFiles(directory, entryPath)))
    } else {
      files.push(entryPath.replaceAll(path.sep, '/'))
    }
  }

  return files.sort()
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('archive docs version helpers', () => {
  it('validates archive version ids', () => {
    expect(isValidVersionId('v0.7.x')).toBe(true)
    expect(isValidVersionId('v1.2.3')).toBe(true)
    expect(isValidVersionId('0.7')).toBe(false)
    expect(isValidVersionId('v0')).toBe(false)
    expect(isValidVersionId('latest')).toBe(false)
    expect(isValidVersionId('v0.7.x.1')).toBe(false)
  })

  it('detects localized files using the configured locales', () => {
    expect(isLocalizedFile('index.de.mdx')).toBe(true)
    expect(isLocalizedFile('meta.pt-BR.json')).toBe(true)
    expect(isLocalizedFile('index.mdx')).toBe(false)
    expect(isLocalizedFile('meta.json')).toBe(false)
    expect(isLocalizedFile('nested/s3.mdx')).toBe(false)
  })

  it('rewrites only eligible live docs links outside fenced code', () => {
    const source = [
      '[Quick start](/docs/quick_start)',
      '[Docs](/docs)',
      '<a href="/docs/x">Docs</a>',
      'https://www.librechat.ai/docs/x',
      '/docsearch',
      '```bash',
      'curl /docs/x',
      '```',
    ].join('\n')

    expect(rewriteArchivedLinks(source, 'v0.7.x')).toBe(
      [
        '[Quick start](/v0.7.x/docs/quick_start)',
        '[Docs](/v0.7.x/docs)',
        '<a href="/v0.7.x/docs/x">Docs</a>',
        'https://www.librechat.ai/docs/x',
        '/docsearch',
        '```bash',
        'curl /docs/x',
        '```',
      ].join('\n'),
    )
  })
})

describe('archiveDocsVersion', () => {
  it('archives an exact git fixture, skips localized files, and handles replacement', async () => {
    const repository = await mkdtemp(path.join(os.tmpdir(), 'archive-docs-'))
    temporaryDirectories.push(repository)
    await git(repository, 'init', '-q')
    await mkdirFixture(repository)
    await git(repository, 'add', 'content/docs')
    await git(repository, 'commit', '-q', '-m', 'fixture')

    const result = await archiveDocsVersion({ version: 'v0.7.x', cwd: repository })
    const destination = path.join(repository, 'content/docs-archive/v0.7.x')

    expect(result).toMatchObject({
      version: 'v0.7.x',
      ref: 'HEAD',
      filesWritten: 3,
      filesSkippedLocalized: 2,
      linksRewritten: 1,
    })
    expect(await allFiles(destination)).toEqual(['index.mdx', 'meta.json', 'nested/s3.mdx'])
    expect(await readFile(path.join(destination, 'index.mdx'), 'utf8')).toContain(
      '[Quick start](/v0.7.x/docs/quick_start)',
    )
    expect(await readFile(path.join(destination, 'index.mdx'), 'utf8')).toContain('echo /docs/x')
    await expect(archiveDocsVersion({ version: 'v0.7.x', cwd: repository })).rejects.toThrow(
      'pass --force',
    )
    await expect(
      archiveDocsVersion({ version: 'v0.7.x', cwd: repository, force: true }),
    ).resolves.toMatchObject({
      filesWritten: 3,
    })
  })
})

async function mkdirFixture(repository: string): Promise<void> {
  await mkdir(path.join(repository, 'content/docs/nested'), { recursive: true })
  await writeFile(
    path.join(repository, 'content/docs/index.mdx'),
    [
      '# English',
      '',
      '[Quick start](/docs/quick_start)',
      '```bash',
      'echo /docs/x',
      '```',
      '',
    ].join('\n'),
  )
  await writeFile(path.join(repository, 'content/docs/index.de.mdx'), '# Deutsch\n')
  await writeFile(path.join(repository, 'content/docs/meta.json'), '{"title":"Docs"}\n')
  await writeFile(path.join(repository, 'content/docs/meta.pt-BR.json'), '{"title":"Documentos"}\n')
  await writeFile(path.join(repository, 'content/docs/nested/s3.mdx'), '# Asset-like page\n')
}
