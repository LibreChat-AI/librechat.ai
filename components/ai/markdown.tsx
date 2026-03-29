'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => clearTimeout(timeout.current)
  }, [])

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <button
      onClick={copy}
      className="absolute right-2 top-2 rounded-md border border-fd-border bg-fd-card p-1 text-fd-muted-foreground opacity-0 transition-opacity group-hover/code:opacity-100 hover:text-fd-foreground"
      aria-label="Copy code"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  )
}

export function ChatMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children: c }) => {
          if (href?.startsWith('/')) {
            return (
              <Link
                href={href}
                className="font-medium text-fd-primary underline underline-offset-2 hover:text-fd-primary/80"
              >
                {c}
              </Link>
            )
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-fd-primary underline underline-offset-2 hover:text-fd-primary/80"
            >
              {c}
            </a>
          )
        },
        pre: ({ children: c }) => {
          // Extract text content for copy button
          let text = ''
          const extractText = (node: React.ReactNode): void => {
            if (typeof node === 'string') {
              text += node
            } else if (Array.isArray(node)) {
              for (const n of node) { extractText(n) }
            } else if (node && typeof node === 'object' && 'props' in node) {
              extractText((node as React.ReactElement).props.children)
            }
          }
          extractText(c)

          return (
            <div className="group/code relative my-2">
              <pre className="overflow-x-auto rounded-lg border border-fd-border bg-fd-secondary p-3 text-xs leading-relaxed">
                {c}
              </pre>
              <CopyButton text={text.trim()} />
            </div>
          )
        },
        code: ({ className, children: c, ...props }) => {
          if (className?.startsWith('language-')) {
            const lang = className.replace('language-', '')
            return (
              <>
                <div className="mb-0 flex items-center gap-1.5 text-[10px] text-fd-muted-foreground">
                  <span className={cn('rounded px-1 py-0.5 uppercase', 'bg-fd-muted')}>{lang}</span>
                </div>
                <code className={className} {...props}>
                  {c}
                </code>
              </>
            )
          }
          return (
            <code
              className="rounded bg-fd-muted px-1 py-0.5 font-mono text-xs text-fd-foreground"
              {...props}
            >
              {c}
            </code>
          )
        },
        p: ({ children: c }) => <p className="my-1.5 leading-relaxed">{c}</p>,
        ul: ({ children: c }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{c}</ul>,
        ol: ({ children: c }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{c}</ol>,
        li: ({ children: c }) => <li className="leading-relaxed">{c}</li>,
        strong: ({ children: c }) => <strong className="font-semibold">{c}</strong>,
        blockquote: ({ children: c }) => (
          <blockquote className="my-2 border-l-2 border-fd-primary/40 pl-3 text-fd-muted-foreground italic">
            {c}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-fd-border" />,
        h3: ({ children: c }) => (
          <h3 className="mb-1 mt-3 text-sm font-semibold text-fd-foreground">{c}</h3>
        ),
        table: ({ children: c }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full text-xs">{c}</table>
          </div>
        ),
        th: ({ children: c }) => (
          <th className="border border-fd-border bg-fd-muted px-2 py-1 text-left font-medium">
            {c}
          </th>
        ),
        td: ({ children: c }) => (
          <td className="border border-fd-border px-2 py-1">{c}</td>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
