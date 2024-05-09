import Image from 'next/image'
import { getPagesUnderRoute } from 'nextra/context'
import { Page } from 'nextra'

type AuthorPage = Page & {
  frontMatter: {
    name: string
    ogImage: string
    authorid: string
  }
}

export const AuthorSmall = ({ authorid }: { authorid: string }) => {
  const authorPages = getPagesUnderRoute('/authors')
  const page = authorPages?.find(
    (page) => (page as AuthorPage).frontMatter.authorid === authorid,
  ) as AuthorPage

  if (!page) {
    // Handle the case when the author page is not found
    console.error('Author page not found for authorid:', authorid)
    return null
  }

  const { name, ogImage } = page.frontMatter

  return (
    <div className="group shrink-0" key={name}>
      <div className="flex items-center gap-4">
        <Image
          src={ogImage}
          width={20}
          height={20}
          className="rounded-full"
          alt={`Picture ${name}`}
        />
        <span className="text-primary/60 whitespace-nowrap">{name}</span>
      </div>
    </div>
  )
}
