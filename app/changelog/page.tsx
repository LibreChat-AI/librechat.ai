import { changelog } from '@/lib/source'
import { ChangelogFeed } from './changelog-feed'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Release notes and configuration updates for LibreChat.',
}

function getSlug(path: string): string {
  return path.replace(/\.mdx?$/, '')
}

interface ChangelogEntry {
  title: string
  description?: string
  date: string
  url: string
  version?: string
  type: 'release' | 'config'
}

export default function ChangelogPage() {
  const entries: ChangelogEntry[] = changelog.map((entry) => {
    const slug = getSlug(entry._file.path)
    const date =
      typeof entry.date === 'string' ? entry.date : new Date(entry.date).toISOString().split('T')[0]

    return {
      title: entry.title,
      description: entry.description,
      date,
      url: `/changelog/${slug}`,
      version: entry.version,
      type: slug.startsWith('config_') ? 'config' : 'release',
    }
  })

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Changelog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Release notes and configuration updates for LibreChat.
        </p>
      </header>

      <ChangelogFeed entries={entries} />
    </div>
  )
}
