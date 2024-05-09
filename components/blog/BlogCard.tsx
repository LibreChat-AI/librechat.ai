import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Video } from '../Video'
import { Author } from '../Author/Authors'

const BlogCard = ({ page, handleTagClick, selectedTags = [] }) => {
  const router = useRouter()
  const [cardWidth, setCardWidth] = useState(0)
  const [maxDescriptionLength, setMaxDescriptionLength] = useState(160)
  const handleCardClick = () => {
    router.push(page.route)
  }

  useEffect(() => {
    setMaxDescriptionLength(cardWidth > 260 ? 145 : 46) // Adjust maxLength based on card width
  }, [cardWidth])

  useEffect(() => {
    const updateCardWidth = () => {
      setCardWidth(document.querySelector('.blog-card').clientWidth)
    }
    window.addEventListener('resize', updateCardWidth)
    updateCardWidth()
    return () => {
      window.removeEventListener('resize', updateCardWidth)
    }
  }, [])

  const truncateDescription = (text) => {
    if (text.length > maxDescriptionLength) {
      return text.slice(0, maxDescriptionLength) + '...'
    }
    return text
  }

  return (
    <div className="bg-popover rounded-lg shadow-md overflow-hidden blog-card">
      <div
        className="relative h-52 md:h-64 mb-1 overflow-hidden transform scale-100 transition-transform hover:scale-105 cursor-pointer"
        onClick={handleCardClick}
        style={{ transformOrigin: 'bottom center' }}
      >
        {page.frontMatter?.ogVideo ? (
          <Video
            src={page.frontMatter.ogVideo}
            gifStyle
            className="object-cover w-full h-full mt-0"
          />
        ) : page.frontMatter?.ogImage ? (
          <Image
            src={page.frontMatter.gif ?? page.frontMatter.ogImage}
            width={1200}
            height={675}
            className="object-cover absolute top-0 left-0 w-full h-full"
            alt={page.frontMatter?.title ?? 'Blog post image'}
            unoptimized={
              page.frontMatter.gif !== undefined || page.frontMatter.ogImage?.endsWith('.gif')
            }
          />
        ) : null}
      </div>
      <div className="p-4 pt-2 h-56 overflow-hidden relative">
        <div className="items-center justify-between mb-2">
          {page.frontMatter?.tags?.map((tag) => (
            <span
              key={tag}
              className={`cursor-pointer text-xs py-1 px-2 bg-background/80 shadow-md rounded-md ml-1 mr-1 ${
                selectedTags.includes(tag) ? 'bg-gray-700/20' : ''
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
        {/* Modified title and description to be clickable */}
        <div className="mb-2 ml-1 mr-1 cursor-pointer" onClick={handleCardClick}>
          <h2 className="font-mono text-xl mb-2 font-bold">
            {page.meta?.title || page.frontMatter?.title || page.name}
          </h2>
          <div>{truncateDescription(page.frontMatter?.description || '')}</div>
        </div>
        <div className="flex items-center justify-between absolute bottom-4 left-4 right-4">
          <Author authorid={page.frontMatter.authorid} />
          <span className="text-sm opacity-60">{page.frontMatter.date}</span>
        </div>
      </div>
    </div>
  )
}

export default BlogCard
