'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  Send,
  Loader2,
  ArrowUpRight,
  Search,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  RotateCcw,
  PanelRightClose,
  Sparkles,
  Share2,
  Check,
  FileText,
  Globe,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChatMarkdown } from './markdown'
import { saveMessages, loadMessages, clearMessages } from './chat-store'

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const PANEL_WIDTH = 420

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function LCIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/librechat.svg" alt="" width={16} height={16} className={cn('shrink-0', className)} />
  )
}

function extractDocRefs(text: string): { title: string; url: string }[] {
  const refs: { title: string; url: string }[] = []
  const seen = new Set<string>()
  const regex = /\[([^\]]+)\]\((\/docs\/[^)]+)\)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    if (!seen.has(match[2])) {
      seen.add(match[2])
      refs.push({ title: match[1], url: match[2] })
    }
  }
  return refs
}

function getStartersForPage(pathname: string): string[] {
  const p = pathname.toLowerCase()
  if (p.includes('/local/docker'))
    return ['How do I update LibreChat?', 'Docker compose override setup', 'Fix port already in use']
  if (p.includes('/configuration/azure'))
    return ['Configure Azure API keys', 'Azure model deployment', 'Fix Azure auth errors']
  if (p.includes('/features/agents'))
    return ['How do I create an agent?', 'Agent tool configuration', 'Agent file handling']
  if (p.includes('/features/mcp'))
    return ['How to enable MCP?', 'MCP server configuration', 'Connect external tools via MCP']
  if (p.includes('/configuration/librechat_yaml'))
    return ['YAML config example', 'Add a custom endpoint', 'Configure model parameters']
  if (p.includes('/configuration/authentication'))
    return ['Set up OAuth login', 'Enable LDAP auth', 'Configure SSO with SAML']
  if (p.includes('/features/web_search'))
    return ['Enable web search', 'Configure Google search', 'Web search with agents']
  if (p.includes('/quick_start'))
    return ['Quickstart with Docker', 'Add my first AI provider', 'Configure custom endpoints']
  if (p.includes('/remote'))
    return ['Deploy on Railway', 'Nginx reverse proxy', 'Deploy on DigitalOcean']
  if (p.includes('/features'))
    return ['What features does LibreChat have?', 'How to use code interpreter?', 'Enable memory']
  if (p.includes('/docs'))
    return ['How do I get started?', 'Docker vs local install?', 'Configure an AI provider']
  return ['How do I get started?', 'Docker setup guide', 'How to enable MCP?']
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function DocRef({ url, title }: { url: string; title: string }) {
  return (
    <Link
      href={url}
      className="inline-flex items-center gap-1 rounded-full border border-fd-border bg-fd-secondary/50 px-2.5 py-1 text-xs font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
    >
      <LCIcon className="size-3" />
      {title}
      <ArrowUpRight className="size-3 text-fd-muted-foreground" />
    </Link>
  )
}

function MessageFeedback({ messageId: _messageId }: { messageId: string }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  if (vote) {
    return (
      <span className="text-[10px] text-fd-muted-foreground">
        {vote === 'up' ? 'Thanks!' : 'Noted.'}
      </span>
    )
  }
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => setVote('up')}
        className="rounded p-0.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        aria-label="Helpful"
      >
        <ThumbsUp className="size-3" />
      </button>
      <button
        onClick={() => setVote('down')}
        className="rounded p-0.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        aria-label="Not helpful"
      >
        <ThumbsDown className="size-3" />
      </button>
    </div>
  )
}

function SourcesCollapsible({ sources }: { sources: { title: string; url: string }[] }) {
  const [open, setOpen] = useState(false)
  if (sources.length === 0) return null
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[10px] text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      >
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
        {sources.length} source{sources.length > 1 ? 's' : ''}
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-1">
          {sources.map((s) => (
            <Link
              key={s.url}
              href={s.url}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              <FileText className="size-3 shrink-0" />
              {s.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Chat input                                                                */
/* -------------------------------------------------------------------------- */

function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  onClose,
  mode,
  onModeChange,
  isDocsPage,
}: {
  input: string
  setInput: (v: string) => void
  onSubmit: () => void
  isLoading: boolean
  onClose: () => void
  mode: 'search' | 'page'
  onModeChange: (m: 'search' | 'page') => void
  isDocsPage: boolean
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const rows = Math.min(4, Math.max(1, input.split('\n').length))

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="shrink-0 border-t border-fd-border p-3">
      {/* Mode toggle */}
      {isDocsPage && (
        <div className="mb-2 flex gap-1">
          <button
            onClick={() => onModeChange('search')}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              mode === 'search'
                ? 'bg-fd-primary text-fd-primary-foreground'
                : 'text-fd-muted-foreground hover:bg-fd-accent',
            )}
          >
            <Globe className="size-3" />
            All docs
          </button>
          <button
            onClick={() => onModeChange('page')}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              mode === 'page'
                ? 'bg-fd-primary text-fd-primary-foreground'
                : 'text-fd-muted-foreground hover:bg-fd-accent',
            )}
          >
            <FileText className="size-3" />
            This page
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-xl border border-fd-border bg-fd-secondary p-1.5 transition-colors focus-within:ring-2 focus-within:ring-fd-ring">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'page' ? 'Ask about this page…' : 'Ask about LibreChat…'}
          rows={rows}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-fd-secondary-foreground placeholder:text-fd-muted-foreground focus-visible:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit()
            }
            if (e.key === 'Escape') onClose()
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !input.trim()}
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-all',
            input.trim() && !isLoading
              ? 'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90'
              : 'text-fd-muted-foreground opacity-40',
          )}
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-fd-muted-foreground">
        AI can make mistakes · <kbd className="rounded border border-fd-border px-1">⌘.</kbd> to
        toggle
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Transport                                                                 */
/* -------------------------------------------------------------------------- */

// Mutable context — updated by the component before each send
const transportContext = { mode: 'search' as 'search' | 'page', pageUrl: '/' }

const transport = new DefaultChatTransport({
  api: '/api/chat',
  headers: () => ({
    'x-chat-mode': transportContext.mode,
    'x-chat-page': transportContext.pageUrl,
  }),
})

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function AskAI() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'search' | 'page'>('search')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const navigatedRef = useRef<Set<string>>(new Set())
  const isDocsPage = pathname?.startsWith('/docs') ?? false

  const [initialMessages] = useState(() => {
    if (typeof window === 'undefined') return undefined
    const stored = loadMessages()
    return stored.length > 0 ? stored : undefined
  })

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: 'docs-ai',
    transport,
    messages: initialMessages,
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const starters = getStartersForPage(pathname ?? '/')

  // Update transport context when mode/page changes
  useEffect(() => {
    transportContext.mode = mode
    transportContext.pageUrl = pathname ?? '/'
  }, [mode, pathname])

  // Persist messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages)
    }
  }, [messages])

  // Push page content when panel opens (desktop only)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    if (open && mq.matches) {
      document.body.style.marginRight = `${PANEL_WIDTH}px`
      document.body.style.transition = 'margin-right 200ms ease'
    } else {
      document.body.style.marginRight = ''
    }
    return () => {
      document.body.style.marginRight = ''
      document.body.style.transition = ''
    }
  }, [open])

  // Auto-navigate on navigate tool result
  useEffect(() => {
    for (const m of messages) {
      if (m.role !== 'assistant' || navigatedRef.current.has(m.id)) continue
      for (const part of m.parts ?? []) {
        if (
          part.type === 'tool-navigate' &&
          'state' in part &&
          part.state === 'output-available'
        ) {
          const result = part.output as { action?: string; url?: string } | undefined
          if (
            result?.action === 'navigate' &&
            result.url?.startsWith('/docs/') &&
            !result.url.includes('..')
          ) {
            navigatedRef.current.add(m.id)
            router.push(result.url)
          }
        }
      }
    }
  }, [messages, router])

  const handleSubmit = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    setShareUrl(null)
    const context =
      mode === 'search' && isDocsPage ? `[I'm currently on ${pathname}] ` : ''
    sendMessage({ text: context + text })
  }, [input, isLoading, sendMessage, pathname, mode, isDocsPage])

  const handleClear = useCallback(() => {
    setMessages([])
    clearMessages()
    setShareUrl(null)
  }, [setMessages])

  const handleShare = useCallback(async () => {
    try {
      // Strip tool invocation output (large) and keep only user/assistant text
      const slim = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          parts: m.parts?.filter((p) => p.type === 'text'),
        }))
      const json = JSON.stringify(slim)
      const bytes = new TextEncoder().encode(json)
      const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
      const encoded = btoa(binary)
      const url = `${window.location.origin}${pathname ?? '/'}#chat=${encoded}`
      await navigator.clipboard.writeText(url)
      setShareUrl(url)
      setTimeout(() => setShareUrl(null), 3000)
    } catch {
      // ignore
    }
  }, [messages, pathname])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => document.querySelector<HTMLTextAreaElement>('[data-chat-input]')?.focus(), 100)
    }
  }, [open])

  // Load shared chat from URL hash
  useEffect(() => {
    const { hash } = window.location
    if (!hash.startsWith('#chat=')) return
    try {
      const encoded = hash.slice('#chat='.length)
      const binary = atob(encoded)
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
      const json = new TextDecoder().decode(bytes)
      const shared = JSON.parse(json) as { role: string; parts: { type: string; text: string }[] }[]
      if (Array.isArray(shared) && shared.length > 0) {
        setMessages(
          shared.map((m, i) => ({
            id: `shared-${i}`,
            role: m.role as 'user' | 'assistant',
            parts: m.parts ?? [],
          })) as Parameters<typeof setMessages>[0] extends (infer U)[] ? U[] : never,
        )
        setOpen(true)
        // Clean hash from URL without navigation
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    } catch {
      // invalid hash, ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + .
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-fd-border bg-fd-card px-4 py-2.5 text-sm font-medium text-fd-muted-foreground shadow-lg transition-all hover:bg-fd-accent hover:text-fd-accent-foreground',
          open && 'pointer-events-none opacity-0',
        )}
        aria-label="Ask AI (Ctrl+.)"
      >
        <LCIcon className="size-5" />
        Ask AI
      </button>

      {/* Panel */}
      {open && (
        <div
          className={cn(
            'fixed z-50 flex flex-col border-fd-border bg-fd-card',
            'inset-x-0 bottom-0 h-[85vh] rounded-t-2xl border-t shadow-2xl',
            'md:inset-y-0 md:right-0 md:left-auto md:h-full md:rounded-none md:border-l md:border-t-0 md:shadow-none',
          )}
        >
          <style>{`@media (min-width: 768px) { [data-ask-ai-panel] { width: ${PANEL_WIDTH}px; } }`}</style>
          <div data-ask-ai-panel="" className="flex size-full flex-col">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-fd-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-fd-foreground">
                <Sparkles className="size-4 text-fd-primary" />
                Ask AI
                {isDocsPage && (
                  <span className="rounded bg-fd-secondary px-1.5 py-0.5 text-[10px] font-normal text-fd-muted-foreground">
                    {pathname?.split('/').pop()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <>
                    <button
                      onClick={handleShare}
                      className="rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                      aria-label={shareUrl ? 'Link copied!' : 'Share conversation'}
                      title={shareUrl ? 'Link copied!' : 'Share conversation'}
                    >
                      {shareUrl ? (
                        <Check className="size-3.5 text-green-500" />
                      ) : (
                        <Share2 className="size-3.5" />
                      )}
                    </button>
                    <button
                      onClick={handleClear}
                      className="rounded-md px-2 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                      aria-label="Clear chat"
                    >
                      Clear
                    </button>
                  </>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                  aria-label="Close panel"
                >
                  <PanelRightClose className="hidden size-4 md:block" />
                  <X className="size-4 md:hidden" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Empty state */}
              {messages.length === 0 && !error && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <LCIcon className="size-10 opacity-20" />
                  <div>
                    <p className="text-sm font-medium text-fd-foreground">Ask me anything</p>
                    <p className="mt-1 text-xs text-fd-muted-foreground">
                      I&apos;ll search the docs and give you a concise answer.
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {starters.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage({ text: q })}
                        className="rounded-full border border-fd-border px-3 py-1.5 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error state (empty) */}
              {error && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="size-8 text-destructive opacity-60" />
                  <div>
                    <p className="text-sm font-medium text-fd-foreground">Something went wrong</p>
                    <p className="mt-1 max-w-[280px] text-xs text-fd-muted-foreground">
                      {error.message.includes('API key') || error.message.includes('503')
                        ? 'The AI service is not configured. Please set OPENROUTER_API_KEY.'
                        : 'Failed to connect to the AI service. Please try again.'}
                    </p>
                  </div>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 rounded-full border border-fd-border px-3 py-1.5 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
                  >
                    <RotateCcw className="size-3" />
                    Try again
                  </button>
                </div>
              )}

              {/* Message list */}
              {messages
                .filter((m) => m.role !== 'system')
                .map((m) => {
                  const fullText = m.parts
                    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                    .map((p) => p.text)
                    .join('')
                  const docRefs =
                    m.role === 'assistant' && fullText ? extractDocRefs(fullText) : []

                  // Collect sources from search tool results
                  const sources: { title: string; url: string }[] = []
                  if (m.role === 'assistant') {
                    for (const part of m.parts ?? []) {
                      if (
                        part.type === 'tool-search' &&
                        'state' in part &&
                        part.state === 'output-available' &&
                        'output' in part
                      ) {
                        const output = part.output as
                          | { title: string; url: string }[]
                          | undefined
                        if (Array.isArray(output)) {
                          for (const s of output) {
                            if (s.url && s.title) sources.push({ title: s.title, url: s.url })
                          }
                        }
                      }
                    }
                  }

                  return (
                    <div key={m.id} className="flex flex-col gap-1.5">
                      {/* User */}
                      {m.role === 'user' && (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-fd-primary px-3.5 py-2 text-sm text-fd-primary-foreground">
                            {m.parts?.map((part, i) =>
                              part.type === 'text' ? (
                                <span key={i}>
                                  {part.text.replace(/^\[I'm currently on \/[^\]]+\] /, '')}
                                </span>
                              ) : null,
                            )}
                          </div>
                        </div>
                      )}

                      {/* Assistant */}
                      {m.role === 'assistant' && (
                        <div className="flex gap-2.5">
                          <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-fd-border bg-fd-card">
                            <LCIcon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {/* Tools */}
                            {m.parts?.map((part, i) => {
                              if (!part.type.startsWith('tool-')) return null

                              if (
                                part.type === 'tool-navigate' &&
                                'state' in part &&
                                part.state === 'output-available'
                              ) {
                                const res = (
                                  part as { output?: { url?: string; title?: string } }
                                ).output
                                if (res?.url) {
                                  return (
                                    <Link
                                      key={i}
                                      href={res.url}
                                      className="mb-2 flex items-center gap-2 rounded-lg border border-fd-border bg-fd-secondary/50 p-2.5 text-xs transition-colors hover:bg-fd-accent"
                                    >
                                      <ExternalLink className="size-3.5 shrink-0 text-fd-primary" />
                                      <div className="min-w-0">
                                        <p className="font-medium text-fd-foreground">
                                          {res.title ?? 'Opening page…'}
                                        </p>
                                        <p className="truncate text-fd-muted-foreground">
                                          {res.url}
                                        </p>
                                      </div>
                                    </Link>
                                  )
                                }
                              }

                              if (part.type === 'tool-search') {
                                const isDone =
                                  'state' in part &&
                                  (part.state === 'output-available' ||
                                    part.state === 'output-error')
                                return (
                                  <div
                                    key={i}
                                    className="mb-1.5 flex items-center gap-1.5 text-xs text-fd-muted-foreground"
                                  >
                                    <Search
                                      className={cn('size-3', !isDone && 'animate-pulse')}
                                    />
                                    {isDone ? 'Searched docs' : 'Searching docs…'}
                                  </div>
                                )
                              }

                              return null
                            })}

                            {/* Body */}
                            {fullText && (
                              <div className="text-sm text-fd-foreground">
                                <ChatMarkdown>{fullText}</ChatMarkdown>
                              </div>
                            )}

                            {/* Sources collapsible */}
                            <SourcesCollapsible sources={sources} />

                            {/* Refs + feedback */}
                            {fullText && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {docRefs.map((ref) => (
                                  <DocRef key={ref.url} url={ref.url} title={ref.title} />
                                ))}
                                <div className="ml-auto">
                                  <MessageFeedback messageId={m.id} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* Inline error */}
              {error && messages.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span className="flex-1">
                    {error.message.includes('API key') || error.message.includes('503')
                      ? 'AI service not configured.'
                      : 'Request failed. Try again.'}
                  </span>
                  <button
                    onClick={handleClear}
                    className="shrink-0 rounded px-2 py-0.5 transition-colors hover:bg-destructive/10"
                  >
                    <RotateCcw className="size-3" />
                  </button>
                </div>
              )}

              {/* Loading */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2.5">
                  <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-fd-border bg-fd-card">
                    <LCIcon className="size-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
                    <Search className="size-3 animate-pulse" />
                    {mode === 'page' ? 'Reading page…' : 'Searching docs…'}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <ChatInput
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onClose={() => setOpen(false)}
              mode={mode}
              onModeChange={setMode}
              isDocsPage={isDocsPage}
            />
          </div>
        </div>
      )}
    </>
  )
}
