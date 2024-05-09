import React, { useEffect, useState } from 'react'
import { getPagesUnderRoute } from 'nextra/context'
import { Page } from 'nextra'
import BlogCard from './BlogCard'
import Select from 'react-select'
import { AuthorSmall } from '../Author/AuthorsSmall'

export const BlogIndex = ({ maxItems }: { maxItems?: number }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)

  const allPages = getPagesUnderRoute('/blog') as Array<Page & { frontMatter: any }>

  const allTags = Array.from(new Set(allPages.flatMap((page) => page.frontMatter.tags || []))).sort(
    (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
  )

  const allAuthors = Array.from(new Set(allPages.map((page) => page.frontMatter.authorid))).sort()

  const sortedPages = allPages
    .sort((a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime())
    .slice(0, maxItems)

  const handleTagClick = (tag: string) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag)
      }
      return [...prevTags, tag]
    })
  }

  const handleAuthorClick = (author: string) => {
    setSelectedAuthor(author === 'all' ? null : author)
  }

  const filteredPages = selectedTags.length
    ? sortedPages.filter(
        (page) =>
          page.frontMatter.tags && selectedTags.every((tag) => page.frontMatter.tags.includes(tag)),
      )
    : sortedPages

  const finalFilteredPages = selectedAuthor
    ? filteredPages.filter((page) => page.frontMatter.authorid === selectedAuthor)
    : filteredPages

  const [menuPortalTarget, setMenuPortalTarget] = useState(null)

  useEffect(() => {
    setMenuPortalTarget(document.body)
  }, [])

  return (
    <div className="flex flex-col items-start bg-background">
      <div className="flex justify-between w-full mb-4">
        {' '}
        {/* This flexbox will spread its children */}
        <div className="flex">
          {' '}
          {/* This flexbox will hold selects together */}
          <Select
            // className={styles["tags-menu"]}
            options={allTags.map((tag) => ({ value: tag, label: tag }))}
            onChange={(selectedOptions) => {
              setSelectedTags(selectedOptions ? selectedOptions.map((opt) => opt.value) : [])
            }}
            value={selectedTags.map((tag) => ({ value: tag, label: tag }))}
            placeholder="Select tags..."
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: 'grey',
                backgroundColor: state.isFocused ? 'background' : 'background',
                borderRadius: 8,
                width: '100%',
                minHeight: 35,
                marginBottom: 20,
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused ? 'grey' : 'background',
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                borderRadius: 8,
                backgroundColor: 'background',
              }),
              menuList: (baseStyles) => ({
                ...baseStyles,
                borderRadius: 8,
                border: '1px solid grey',
              }),
              multiValue: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
                backgroundColor: 'rgba(200, 0, 100, 0.7)',
                borderRadius: 8,
              }),
              multiValueRemove: (styles) => ({
                ...styles,
                ':hover': {
                  color: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '50%',
                  borderColor: 'rgba(128, 128, 128, 0.5)',
                },
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
                borderRadius: 8,
              }),
            }}
            menuPortalTarget={menuPortalTarget}
            isClearable // Enables the clearable option
            hideSelectedOptions={false} // Show selected options in the dropdown
            isSearchable={false}
            isMulti // Enable multiple selection
          />
          <Select
            options={allAuthors.map((author) => ({
              value: author,
              label: <AuthorSmall authorid={author} />,
            }))}
            onChange={(selectedOption) =>
              handleAuthorClick(selectedOption ? selectedOption.value : null)
            }
            value={
              selectedAuthor
                ? { value: selectedAuthor, label: <AuthorSmall authorid={selectedAuthor} /> }
                : null
            }
            placeholder="Select author..."
            isSearchable={false}
            isClearable
            menuPortalTarget={menuPortalTarget}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'grey' : 'grey',
                backgroundColor: state.isFocused ? 'background' : 'background',
                borderRadius: 8,
                width: '100%',
                minHeight: 35,
                marginBottom: 20,
                marginLeft: 10,
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused ? 'grey' : 'background',
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                borderRadius: 8,
                backgroundColor: 'background',
              }),
              menuList: (baseStyles) => ({
                ...baseStyles,
                borderRadius: 8,
                border: '1px solid grey',
              }),
            }}
          />
        </div>
        <button
          className="ml-auto px-2 py-1 rounded-md border border-white focus:outline-none"
          onClick={() => (window.location.href = '/authors')}
          style={{
            color: 'gray',
            height: '38px', // Match the height of the selects
            backgroundColor: 'transparent', // No background color
            borderRadius: '8px', // Match the border-radius of the selects
            border: '1px solid grey',
          }}
          // Add onMouseEnter and onMouseLeave event handlers
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(200, 200, 200, 0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'grey')}
        >
          Meet our authors ↗
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
        {finalFilteredPages.map((page) => (
          <BlogCard
            key={page.route}
            page={page}
            handleTagClick={handleTagClick}
            selectedTags={selectedTags}
          />
        ))}
      </div>
    </div>
  )
}
