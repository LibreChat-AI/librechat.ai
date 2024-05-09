import Image from 'next/image'
import { useRouter } from 'next/router'
import { Page } from 'nextra'
import { getPagesUnderRoute } from 'nextra/context'
import Link from 'next/link'
import { Author } from '../Author/Authors'
import { Video } from '../Video'

export const BlogHeader = () => {
  const router = useRouter()
  const changelogPages = getPagesUnderRoute('/blog')
  const page = changelogPages.find((page) => page.route === router.pathname) as Page & {
    frontMatter: any
  }

  const { title, description, ogImage, ogVideo, gif, date, authorid } = page.frontMatter

  return (
    <div className="md:mt-10 flex flex-col gap-10">
      <Link
        href={`/blog${page.route ? '#' + page.route.replace('/blog/', '') : ''}`}
        className="md:mb-10"
      >
        ← Back
      </Link>

      <div>
        <div className="text-lg text-primary/60 mb-3">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          })}
        </div>
        <div className="flex flex-col gap-5 md:gap-10 md:flex-row justify-between md:items-center">
          <div>
            <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-2">{title}</h1>
          </div>
        </div>
        <p
          className="md:text-lg md:mb-5 font-medium"
          style={{ fontSize: '1.3rem', fontWeight: 'bold' }}
        >
          {description}
        </p>
        <div style={{ textAlign: 'right' }}>
          <Author authorid={authorid} />
        </div>
        <br></br>
        {ogVideo ? (
          <Video src={ogVideo} gifStyle />
        ) : ogImage ? (
          <Image
            src={gif ?? ogImage}
            alt={title}
            width={1200}
            height={630}
            className="border"
            style={{ borderRadius: 20 }}
            unoptimized={
              page.frontMatter.gif !== undefined || page.frontMatter.ogImage?.endsWith('.gif')
            }
          />
        ) : null}
        <div className="mt-6 md:mt-4"></div>
      </div>
    </div>
  )
}
