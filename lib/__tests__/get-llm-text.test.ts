import { describe, expect, it, vi } from 'vitest'

// Page tree mirroring a slice of content/docs/meta.json: a root index page,
// section separators, ordered pages, and a folder with an index + children.
const pageTree = {
  en: {
    name: 'Docs',
    children: [
      { type: 'page', name: 'Home', url: '/docs' },
      { type: 'separator', name: 'Deploy' },
      { type: 'page', name: 'Quick Start', url: '/docs/quick_start' },
      { type: 'page', name: 'Local Install', url: '/docs/local' },
      { type: 'separator', name: 'Configure' },
      {
        type: 'folder',
        name: 'Configuration',
        index: { type: 'page', name: 'Configuration', url: '/docs/configuration' },
        children: [
          { type: 'page', name: 'librechat.yaml', url: '/docs/configuration/librechat_yaml' },
        ],
      },
    ],
  },
}

// Deliberately out of navigation order, plus an orphan page absent from the tree.
const pages = [
  { url: '/docs/configuration/librechat_yaml' },
  { url: '/docs/orphan' },
  { url: '/docs/quick_start' },
  { url: '/docs' },
  { url: '/docs/configuration' },
  { url: '/docs/local' },
]

const getPages = vi.fn((_lang?: string) => pages)

vi.mock('@/lib/source', () => ({
  docsSource: {
    pageTree,
    getPages: (lang?: string) => getPages(lang),
  },
}))

const { getOrderedDocsPages } = await import('../get-llm-text')

describe('getOrderedDocsPages', () => {
  it('orders pages to match the navigation tree, descending into folders', () => {
    const urls = getOrderedDocsPages().map((page) => page.url)

    expect(urls).toEqual([
      '/docs',
      '/docs/quick_start',
      '/docs/local',
      '/docs/configuration',
      '/docs/configuration/librechat_yaml',
      '/docs/orphan',
    ])
  })

  it('appends pages that are not reachable from the tree so nothing is dropped', () => {
    const urls = getOrderedDocsPages().map((page) => page.url)

    expect(urls).toContain('/docs/orphan')
    expect(urls).toHaveLength(pages.length)
  })

  it('requests pages for the default language', () => {
    getPages.mockClear()
    getOrderedDocsPages()

    expect(getPages).toHaveBeenCalledWith('en')
  })
})
