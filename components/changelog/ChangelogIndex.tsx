import { getPagesUnderRoute } from 'nextra/context'
import Link from 'next/link'
import Image from 'next/image'
import { type Page } from 'nextra'
import { Video } from '../Video'

export const ChangelogIndex = ({ maxItems }: { maxItems?: number }) => {
  return (
    <div className="mt-12 max-w-6xl mx-auto divide-y divide-primary/10">
      {(getPagesUnderRoute('/changelog') as Array<Page & { frontMatter: any }>)
        .slice(0, maxItems)
        .sort(
          (a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime(),
        )
        .map((page, i) => (
          <div
            className="md:grid md:grid-cols-4 md:gap-5 py-16 transition-all"
            id={page.route.replace('/changelog/', '')}
            key={page.route.replace('/changelog/', '')}
          >
            <div className="hidden md:block opacity-80 text-lg group-hover:opacity-100 sticky top-24 self-start">
              {page.frontMatter?.date
                ? new Date(page.frontMatter.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })
                : null}
            </div>
            <div className="md:col-span-3">
              <Link key={page.route} href={page.route} className="block group">
                {page.frontMatter?.ogVideo ? (
                  <Video
                    src={page.frontMatter.ogVideo}
                    gifStyle
                    className="mb-14 rounded relative overflow-hidden shadow-md group-hover:shadow-lg ring-0 border-0 transform scale-100 transition-transform hover:scale-105 cursor-pointer"
                  />
                ) : page.frontMatter?.ogImage ? (
                  <div className="mb-14 rounded relative aspect-video overflow-hidden shadow-md transform scale-100 transition-transform hover:scale-105 cursor-pointer">
                    <Image
                      style={{ borderRadius: '20px' }}
                      src={page.frontMatter.gif ?? page.frontMatter.ogImage}
                      className="object-cover"
                      alt={page.frontMatter?.title ?? 'Changelog post image'}
                      fill={true}
                      sizes="(min-width: 1024px) 1000px, 100vw"
                      priority={i < 3}
                      unoptimized={
                        page.frontMatter.gif !== undefined ||
                        page.frontMatter.ogImage?.endsWith('.gif')
                      }
                    />
                  </div>
                ) : null}
                <div className="md:hidden opacity-80 text-sm mb-4 group-hover:opacity-100">
                  {page.frontMatter?.date
                    ? new Date(page.frontMatter.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC',
                      })
                    : null}
                </div>
                <h2 className="block font-mono text-3xl opacity-90 group-hover:opacity-100">
                  {page.meta?.title || page.frontMatter?.title || page.name}
                </h2>
                <div className="opacity-80 mt-4 text-lg group-hover:opacity-100">
                  {page.frontMatter?.description}
                </div>
              </Link>
            </div>
          </div>
        ))}
    </div>
  )
}
