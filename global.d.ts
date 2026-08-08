interface Window {
  _hsq?: unknown[]
}

interface WebMCPToolDefinition {
  name: string
  title?: string
  description: string
  inputSchema: Record<string, unknown>
  execute: (input: unknown) => unknown | Promise<unknown>
  annotations?: {
    readOnlyHint?: boolean
    untrustedContentHint?: boolean
  }
}

interface WebMCPModelContext {
  registerTool: (tool: WebMCPToolDefinition, options?: { signal?: AbortSignal }) => Promise<void>
}

interface Navigator {
  modelContext?: WebMCPModelContext
}

interface Document {
  modelContext?: WebMCPModelContext
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
