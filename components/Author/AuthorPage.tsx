import React, { useEffect, useState } from 'react'
import { getPagesUnderRoute } from 'nextra/context'
import { type Page } from 'nextra'
import { SocialIcon } from 'react-social-icons'
import Image from 'next/image'
import Link from 'next/link'

interface AuthorMetadata {
  authorid: string
  subtitle: string
  name: string
  bio: string
  ogImage: string
  socials?: Record<string, string>
}

const AuthorCard: React.FC<{ author: AuthorMetadata }> = ({ author }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const socialsEntries = Object.entries(author.socials ?? {}).filter(([, value]) => !!value)

  return (
    <Link href={`/authors/${author.authorid}`}>
      <div className="flex flex-col items-center gap-4 bg-gray-200 bg-opacity-20 rounded-lg p-6 h-full group">
        <div className="relative overflow-hidden rounded-full">
          <Image
            width={200}
            height={200}
            src={author.ogImage}
            alt={author.name}
            className="rounded-full transition-transform duration-300 ease-in-out group-hover:scale-110"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <h2 className="font-bold text-xl">{author.name}</h2>
        <p className="text-sm text-center text-gray-600 flex-grow">{author.subtitle}</p>
        <div className="flex flex-wrap gap-4 justify-center mt-2">
          {isClient &&
            socialsEntries.map(([key, value]) => (
              <a
                key={key}
                href={value as string}
                className="btn btn-square relative overflow-hidden"
                title={`See ${author.name}'s ${key}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ transition: 'transform 0.3s ease' }}
                onClick={(e) => e.stopPropagation()}
              >
                <SocialIcon
                  url={value as string}
                  className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
                  bgColor="#9B9B9B80"
                  fgColor="background"
                  style={{ width: '2em', height: '2em' }}
                />
              </a>
            ))}
        </div>
      </div>
    </Link>
  )
}

const AuthorPage: React.FC = () => {
  const allAuthors = getPagesUnderRoute('/authors') as Array<Page & { frontMatter: AuthorMetadata }>

  const authors = allAuthors.filter((author) => !!author.frontMatter.authorid)

  return (
    <section className="max-w-4xl mx-auto mt-12 mb-24 md:mb-32">
      <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-8 text-center">
        Our Authors
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {authors.map((author) => (
          <AuthorCard key={author.frontMatter.authorid} author={author.frontMatter} />
        ))}
      </div>
    </section>
  )
}

export default AuthorPage
