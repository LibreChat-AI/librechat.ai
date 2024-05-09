import Image from 'next/image'

export function Blog() {
  return (
    <>
      <div className="flex gap-2 items-center">
        {/* Image */}
        <Image src="/images/cards/article.svg" alt="Blog Logo" width={30} height={30} />
        {/* Text */}
        <span className="ml-2 text-lg font-bold text-gray-600 dark:text-gray-300">Blog</span>
        {/* CSS for hover effect */}
        <style jsx>{`
          div {
            padding: 0.5rem 0.5rem 0.5rem 0;
            mask-image: linear-gradient(
              60deg,
              #bba0ff 25%,
              rgba(187, 160, 255, 0.2) 50%,
              #bba0ff 75%
            );
            mask-size: 400%;
            mask-position: 0%;
          }
          div:hover {
            mask-position: 100%;
            transition:
              mask-position 1s ease,
              -webkit-mask-position 1s ease;
          }
        `}</style>
      </div>
    </>
  )
}
