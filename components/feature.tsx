import Image from 'next/image'

export function Feature(props: {
  src
  imageAlt: string
  imagePosition: 'left' | 'right'
  children
}) {
  return (
    <div className="my-16 md:my-32 lg:grid lg:grid-cols-3 md:gap-10 md:items-center">
      {props.imagePosition === 'right' ? (
        <div className="mb-8 lg:mb-0 md:text-center [&>h2]:mt-0">{props.children}</div>
      ) : (
        <div className="mb-8 md:text-center lg:hidden">{props.children}</div>
      )}

      <Image
        alt={props.imageAlt}
        src={props.src}
        style={{ objectFit: 'contain' }}
        className="lg:col-span-2 max-h-96"
      />

      {props.imagePosition === 'left' ? (
        <div className="hidden mb-8 lg:mb-0 lg:block md:text-center [&>h2]:mt-0">
          {props.children}
        </div>
      ) : null}
    </div>
  )
}
