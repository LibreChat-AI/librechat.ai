import React, { useEffect, useState } from 'react'
import { getPagesUnderRoute } from 'nextra/context'
import { type Page } from 'nextra'
import { SocialIcon } from 'react-social-icons'
import BlogCard from '../blog/BlogCard'
import Image from 'next/image'
import { Cards } from 'nextra/components'
import { Blog } from '@/components/CardIcons/Blog'
import { OurAuthors } from '@/components/CardIcons/OurAuthors'

//TODO: Fix Mobile view to better handle more than 4 socials;
//TODO: Better fallback social icon (the default one is the "share" icon)
//TODO: Tag selection on "Recent Posts by" (author pages)
//TODO: fix profile pic position when no bio

interface AuthorMetadata {
  authorid: string
  subtitle: string
  name: string
  bio: string
  ogImage: string
  socials?: Record<string, string> // Dynamically match social media platforms
}

interface AuthorProfileProps {
  authorId: string
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({ authorId }) => {
  const authors = getPagesUnderRoute('/authors') as Array<Page & { frontMatter: AuthorMetadata }>
  const author = authors.find((a) => a.frontMatter.authorid === authorId)?.frontMatter
  const blogPosts = getPagesUnderRoute('/blog') as Array<Page & { frontMatter: any }>

  // Filter posts by the current authorId
  const authorPosts = blogPosts.filter((post) => post.frontMatter.authorid === authorId)
  const sortedAuthorPosts = authorPosts.sort(
    (a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime(),
  )

  if (!author) {
    return <div>Author not found!</div>
  }

  const socialsEntries = Object.entries(author.socials ?? {}).filter(([, value]) => !!value)

  // State to track whether the component is rendered on the client side
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <section className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 mt-12 mb-24 md:mb-32">
        <div>
          <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-2">{author.name}</h1>
          <p
            className="md:text-lg mb-6 md:mb-10 font-medium"
            style={{ fontSize: '1.3rem', fontWeight: 'bold' }}
          >
            {author.subtitle}
          </p>
          {author.bio && <p className="md:text-lg text-base-content/80">{author.bio}</p>}
        </div>

        <div className="max-md:order-first flex md:flex-col gap-4 shrink-0">
          <Image
            width={512}
            height={512}
            src={author.ogImage}
            alt={author.name}
            className="rounded-box w-[12rem] md:w-[16rem] h-[12rem] md:h-[16rem] rounded-square"
            style={{ borderRadius: '20px', objectFit: 'cover' }}
          />

          <div className="flex flex-wrap gap-4 max-w-[4rem] md:max-w-[16rem]">
            {isClient &&
              socialsEntries.map(([key, value]) => (
                <a
                  key={key}
                  href={value}
                  className="btn btn-square relative overflow-hidden"
                  title={`See ${author.name}'s ${key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ transition: 'transform 0.3s ease' }} // Add transition here
                >
                  <SocialIcon
                    url={value}
                    className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
                    bgColor="#9B9B9B80"
                    fgColor="background"
                    // fallback={{ path: 'M32 2 A30 30 0 0 1 62 32 A30 30 0 0 1 32 62 A30 30 0 0 1 2 32 A30 30 0 0 1 32 2 Z' }}
                  />
                </a>
              ))}
          </div>
        </div>
      </section>
      <section className="max-w-4xl mx-auto mt-8">
        <h2 className="font-bold text-2xl mb-6 text-center">Recent Posts by {author.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
          {sortedAuthorPosts.map((post) => (
            <BlogCard
              key={post.route}
              page={post}
              handleTagClick={(tag) => console.log('Tag clicked:', tag)}
              selectedTags={undefined}
            />
          ))}
        </div>
        <div style={{ marginTop: '75px' }}></div>
        <div>
          <Cards num={3}>
            <Cards.Card title="" href="/blog" icon={<Blog />} image>
              {null}
            </Cards.Card>
            <Cards.Card title="" href="/authors" icon={<OurAuthors />} image>
              {null}
            </Cards.Card>
          </Cards>
        </div>
      </section>
    </>
  )
}

export default AuthorProfile
