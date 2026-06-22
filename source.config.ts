import { defineDocs, defineCollections, defineConfig } from 'fumadocs-mdx/config'
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
  },
})
