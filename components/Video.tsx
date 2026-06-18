'use client'
import '@vidstack/react/player/styles/base.css'
import { cn } from '@/lib/utils'
import {
  MediaPlayer,
  MediaProvider,
  useMediaRemote,
  useMediaStore,
  type MediaPlayerInstance,
} from '@vidstack/react'
import { Play } from 'lucide-react'
import { useState, useRef, type ComponentProps } from 'react'

/** Video embed component using vidstack. Supports poster overlays, gif-style autoplay, and lazy loading. */
export const Video = ({
  src,
  poster,
  aspectRatio,
  className,
  gifStyle = false,
  title,
  type,
}: {
  src: string
  poster?: string
  /** Ratio in `width/height` form, e.g. `"16/9"`. */
  aspectRatio?: string
  gifStyle?: boolean
  className?: string
  title?: string
  /** Explicit MIME type, e.g. `"video/mp4"`. Needed for extensionless URLs. */
  type?: string
}) => {
  const [panelDismissed, setPanelDismissed] = useState(false)
  const mediaPlayerRef = useRef<MediaPlayerInstance>(null)
  const remote = useMediaRemote(mediaPlayerRef)
  const { duration } = useMediaStore(mediaPlayerRef)
  const durationString = duration
    ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60)} min`
    : null

  // Vidstack infers the provider from a string src's file extension. Extensionless
  // URLs (e.g. GitHub asset links) resolve no provider, so pass an explicit MIME
  // type: honor an override, keep recognized extensions as plain strings, and
  // default the rest to mp4.
  const source = (
    type === undefined
      ? /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mpd)(\?|#|$)/i.test(src)
        ? src
        : { src, type: 'video/mp4' }
      : { src, type }
  ) as ComponentProps<typeof MediaPlayer>['src']

  return (
    <MediaPlayer
      ref={mediaPlayerRef}
      src={source}
      controls={!gifStyle && panelDismissed}
      autoPlay={gifStyle}
      muted={gifStyle}
      loop={gifStyle}
      load={gifStyle ? 'eager' : 'custom'}
      playsInline={gifStyle}
      aspectRatio={aspectRatio}
      className={cn(
        'my-4 overflow-hidden shadow-lg ring-1 ring-slate-700 bg-cover object-cover',
        className,
      )}
    >
      {gifStyle ? (
        // Capture mouse events, they broke scrolling on iOS
        <div className="absolute inset-0 z-10" />
      ) : panelDismissed ? null : (
        // Overlay with play button and poster image
        <div
          role="button"
          tabIndex={0}
          aria-label={title ? `Play ${title}` : 'Play video'}
          className="group cursor-pointer absolute inset-0 z-10 flex flex-col justify-center items-center bg-cover"
          style={{
            backgroundImage: poster ? `url(${poster})` : undefined,
          }}
          onMouseEnter={() => {
            remote.startLoading()
          }}
          onClick={() => {
            remote.play()
            setPanelDismissed(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              remote.play()
              setPanelDismissed(true)
            }
          }}
        >
          <div className="p-3 md:p-6 rounded-full bg-black/75 group-hover:ring-8 ring-black/20 hover:bg-black/90 transition flex">
            <Play className="size-6 text-white" />
          </div>
          <div className="mt-3 md:mt-6 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="flex gap-2 text-xs md:text-sm font-semibold bg-black/90 text-white py-1 px-3 rounded-full">
              {title && <span>{title}</span>}
              {durationString && <span className="text-white/70">{durationString}</span>}
            </span>
          </div>
        </div>
      )}
      <MediaProvider />
    </MediaPlayer>
  )
}
