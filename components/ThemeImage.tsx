import { ImageZoom } from 'fumadocs-ui/components/image-zoom'

/**
 * Renders a screenshot that swaps between a light and dark variant based on the
 * active theme (via the global .image-light-theme / .image-dark-theme rules in
 * app/global.css). Each variant is wrapped in ImageZoom so it supports
 * click-to-zoom, just like markdown images do.
 *
 * Using a plain <img> as ImageZoom children keeps it working for both local and
 * remote sources without needing next/image width/height.
 */
function ZoomableImg({ src, alt }: { src: string; alt: string }) {
  return (
    <ImageZoom src={src} alt={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="rounded-lg" />
    </ImageZoom>
  )
}

export function ThemeImage({ light, dark, alt }: { light: string; dark: string; alt: string }) {
  return (
    <span className="my-4 flex justify-center">
      <span className="image-light-theme">
        <ZoomableImg src={light} alt={alt} />
      </span>
      <span className="image-dark-theme">
        <ZoomableImg src={dark} alt={alt} />
      </span>
    </span>
  )
}
