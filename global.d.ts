interface Window {
  _hsq?: unknown[]
}

declare module '@glidejs/glide' {
  interface GlideOptions {
    type?: string
    startAt?: number
    perView?: number
    focusAt?: string | number
    gap?: number
    autoplay?: number | false
    hoverpause?: boolean
    keyboard?: boolean
    bound?: boolean
    swipeThreshold?: number | false
    dragThreshold?: number | false
    perTouch?: number | false
    touchRatio?: number
    touchAngle?: number
    animationDuration?: number
    rewind?: boolean
    rewindDuration?: number
    animationTimingFunc?: string
    direction?: 'ltr' | 'rtl'
    peek?: number | { before: number; after: number }
    breakpoints?: Record<number, Partial<GlideOptions>>
    classes?: Record<string, Record<string, string>>
    throttle?: number
  }

  export default class Glide {
    constructor(selector: string | HTMLElement, options?: GlideOptions)
    mount(): this
    destroy(): void
    go(pattern: string): void
    update(settings?: Partial<GlideOptions>): void
    on(event: string, callback: () => void): void
    disable(): void
    enable(): void
    index: number
    settings: GlideOptions
  }
}
