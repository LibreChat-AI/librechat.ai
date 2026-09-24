import { execFile } from 'node:child_process'
import { mkdtemp, readFile, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'
import {
  compareConfigVersions,
  findLatestConfigVersion,
  parseConfigVersion,
  syncConfigVersions,
  updateConfigVersionsInMarkdown,
} from './sync-config-version.mjs'

const execFileAsync = promisify(execFile)
const SCRIPT_PATH = fileURLToPath(new URL('./sync-config-version.mjs', import.meta.url))

function changelogEntry(version) {
  return [
    '---',
    'date: 2026-06-14',
    `title: Config v${version}`,
    `version: '${version}'`,
    '---',
  ].join('\n')
}

async function fixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'config-version-'))
  const changelogDir = path.join(root, 'content/changelog')
  const docsDir = path.join(root, 'content/docs')

  await mkdir(changelogDir, { recursive: true })
  await mkdir(docsDir, { recursive: true })

  return { root, changelogDir, docsDir }
}

describe('sync config version', () => {
  it('orders historical config versions with the old v1.03 naming scheme', () => {
    expect(parseConfigVersion('1.03')).toEqual([1, 0, 3])
    expect(compareConfigVersions('1.09', '1.1.0')).toBeLessThan(0)
    expect(compareConfigVersions('1.3.13', '1.3.9')).toBeGreaterThan(0)
  })

  it('updates only librechat.yaml config version snippets', () => {
    const markdown = [
      '```yaml filename="librechat.yaml"',
      'version: 1.2.1',
      'cache: true',
      '```',
      '',
      '```yaml filename="docker-compose.yml"',
      'version: "3.4"',
      '```',
      '',
      '```yaml',
      '# Configuration version (required)',
      'version: 1.2.9 # old docs value',
      '```',
      '',
      '```yaml filename="model_config"',
      'version: "2024-03-01-preview"',
      '```',
      '',
      '```yaml filename="librechat.yaml"',
      'endpoints:',
      '  azureOpenAI:',
      '    groups:',
      '      - version: "2024-03-01-preview"',
      '```',
      '',
      '```yaml filename="librechat.yaml"',
      "version: '1.2.3'",
      '---',
      'version: 1.2.4',
      '```',
    ].join('\n')

    const result = updateConfigVersionsInMarkdown(markdown, '1.3.13')

    expect(result.updates).toBe(4)
    expect(result.content).toContain('version: 1.3.13\ncache: true')
    expect(result.content).toContain('version: 1.3.13 # old docs value')
    expect(result.content).toContain('version: "3.4"')
    expect(result.content).toContain('version: "2024-03-01-preview"')
    expect(result.content).toContain('      - version: "2024-03-01-preview"')
    expect(result.content).toContain("version: '1.3.13'\n---\nversion: 1.3.13")
  })

  it('finds the latest config changelog version from frontmatter', async () => {
    const { changelogDir } = await fixtureRoot()

    await writeFile(path.join(changelogDir, 'config_v1.09.mdx'), changelogEntry('1.09'))
    await writeFile(path.join(changelogDir, 'config_v1.1.0.mdx'), changelogEntry('1.1.0'))
    await writeFile(path.join(changelogDir, 'config_v1.3.13.mdx'), changelogEntry('1.3.13'))
    await writeFile(path.join(changelogDir, 'v0.8.8.mdx'), changelogEntry('9.9.9'))

    await expect(findLatestConfigVersion(changelogDir)).resolves.toBe('1.3.13')
  })

  it('rejects a config changelog whose filename and frontmatter disagree', async () => {
    const { changelogDir } = await fixtureRoot()

    await writeFile(path.join(changelogDir, 'config_v1.3.16.mdx'), changelogEntry('1.3.15'))

    await expect(findLatestConfigVersion(changelogDir)).rejects.toThrow(
      /mismatch .*frontmatter is 1\.3\.15, filename is 1\.3\.16/,
    )
  })

  it('reports stale files in check mode and writes them in write mode', async () => {
    const { changelogDir, docsDir } = await fixtureRoot()
    const nestedDocPath = path.join(docsDir, 'configuration/cdn/s3.mdx')

    await mkdir(path.dirname(nestedDocPath), { recursive: true })
    await writeFile(path.join(changelogDir, 'config_v1.3.13.mdx'), changelogEntry('1.3.13'))
    await writeFile(
      nestedDocPath,
      ['```yaml filename="librechat.yaml"', 'version: 1.2.1', 'cache: true', '```'].join('\n'),
    )

    const checked = await syncConfigVersions({ changelogDir, docsDir })
    expect(checked.updates).toBe(1)
    expect(checked.changedFiles).toEqual([{ filePath: nestedDocPath, updates: 1 }])
    await expect(readFile(nestedDocPath, 'utf8')).resolves.toContain('version: 1.2.1')

    const written = await syncConfigVersions({ changelogDir, docsDir, write: true })
    expect(written.updates).toBe(1)
    await expect(readFile(nestedDocPath, 'utf8')).resolves.toContain('version: 1.3.13')

    const rerun = await syncConfigVersions({ changelogDir, docsDir, write: true })
    expect(rerun.updates).toBe(0)
    expect(rerun.changedFiles).toEqual([])
  })

  it('fails the CLI check when docs are stale and passes once synced', async () => {
    const { root, changelogDir, docsDir } = await fixtureRoot()

    await writeFile(path.join(changelogDir, 'config_v1.3.13.mdx'), changelogEntry('1.3.13'))
    await writeFile(
      path.join(docsDir, 'example.mdx'),
      ['```yaml filename="librechat.yaml"', 'version: 1.2.1', '```'].join('\n'),
    )

    const args = [SCRIPT_PATH, `--changelog-dir=${changelogDir}`, `--docs-dir=${docsDir}`]

    await expect(
      execFileAsync(process.execPath, [...args, '--check'], { cwd: root }),
    ).rejects.toMatchObject({ code: 1 })

    await execFileAsync(process.execPath, [...args, '--write'], { cwd: root })

    const { stdout } = await execFileAsync(process.execPath, [...args, '--check'], { cwd: root })
    expect(stdout).toContain('already use 1.3.13')
  })
})
