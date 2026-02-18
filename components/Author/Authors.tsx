import Image from 'next/image'
import { getPagesUnderRoute } from 'nextra/context'

export const Author = ({ authorid }: { authorid: string }) => {
  const authorPages = getPagesUnderRoute('/authors')
  const page = authorPages?.find((page) => page.frontMatter.authorid === authorid)

  if (!page) {
    // Handle the case when the author page is not found
    console.error('Author page not found for authorid:', authorid)
    return null
  }

  const { name, ogImage } = page.frontMatter

  return (
    <div>
      <a href={`/authors/${authorid}`} className="group shrink-0" rel="noopener noreferrer">
        <div className="flex justify-end gap-2" key={name}>
          <div className="flex items-center gap-2">
            {ogImage ? (
              <Image
                src={ogImage}
                width={40}
                height={40}
                className="rounded-full"
                alt={`Picture ${name}`}
              />
            ) : null}
            <span className="text-primary/60 group-hover:text-primary whitespace-nowrap">
              {name}
            </span>
          </div>
        </div>
      </a>
    </div>
  )
}
