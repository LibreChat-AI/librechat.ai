import { defineDocs, defineCollections, defineConfig } from 'fumadocs-mdx/config'
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins'
import { z } from 'zod'

export const docs = defineDocs({
  dir: 'content/docs',
})

export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().or(z.date()),
    author: z.string().optional(),
    ogImage: z.string().optional(),
    ogMetaImage: z.string().optional(),
    ogImageWidth: z.number().optional(),
    ogImageHeight: z.number().optional(),
    ogImagePosition: z.string().optional(),
    category: z.enum(['release', 'feature', 'guide', 'announcement']).optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
})

export const changelog = defineCollections({
  type: 'doc',
  dir: 'content/changelog',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().or(z.date()),
    version: z.string().optional(),
    ogImage: z.string().optional(),
  }),
})

export default defineConfig({
  mdxOptions: {
    remarkCodeTabOptions: false,
    remarkNpmOptions: false,
    // fumadocs-core 16's remark-image fetches dimensions for external images at
    // build time and hard-errors when a remote URL can't be sized (and it would
    // make builds depend on third-party hosts). Leave external images untouched;
    // only local images under /public get build-time sizing.
    remarkImageOptions: { external: false },
    // 16 switched Shiki to the JS regex engine. fumadocs only auto-collects the
    // content's grammars when rehypeCodeOptions is unset, so once we set options
    // we must list every language ourselves (lazy loading 404s mid-build) and map
    // aliases the bundle doesn't know; anything unlisted falls back to plain text.
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      lazy: false,
      langs: [
        'yaml',
        'bash',
        'json',
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'python',
        'markdown',
        'mdx',
        'nginx',
        'diff',
        'sql',
        'ini',
        'html',
        'css',
        'toml',
        'docker',
      ],
      langAlias: {
        ...(rehypeCodeDefaultOptions.langAlias ?? {}),
        sh: 'bash',
        shell: 'bash',
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        md: 'markdown',
        txt: 'text',
        env: 'ini',
        math: 'text',
        mermaid: 'text',
        ansi: 'text',
        dockerfile: 'docker',
      },
      fallbackLanguage: 'text',
    },
  },
})
