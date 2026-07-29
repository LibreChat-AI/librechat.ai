import type { UIMessage } from 'ai'

const STORAGE_KEY = 'librechat-ai-chat'

function isTextPart(part: unknown): part is { type: 'text'; text: string } {
  return (
    !!part &&
    typeof part === 'object' &&
    'type' in part &&
    part.type === 'text' &&
    'text' in part &&
    typeof part.text === 'string'
  )
}

function isRenderablePart(part: unknown): part is { type: string } {
  return !!part && typeof part === 'object' && 'type' in part && typeof part.type === 'string'
}

export interface SanitizeOptions {
  /**
   * Keep tool parts (`tool-search`, `tool-navigate`) so a restored transcript
   * still renders its search indicators and navigation cards.
   *
   * Only pass this for data we wrote ourselves to same-origin storage. The
   * share hash is attacker-supplied, so it stays text-only: every tool part
   * there would be fabricated, and the navigate card renders a link.
   */
  allowToolParts?: boolean
}

/**
 * Coerce untrusted JSON into UIMessages, discarding anything that does not
 * match the shape the renderer expects. Messages left with no parts are
 * dropped rather than rendered as empty bubbles.
 */
export function sanitizeMessages(value: unknown, options: SanitizeOptions = {}): UIMessage[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((message, index) => {
    if (
      !message ||
      typeof message !== 'object' ||
      !('role' in message) ||
      (message.role !== 'user' && message.role !== 'assistant') ||
      !('parts' in message) ||
      !Array.isArray(message.parts)
    ) {
      return []
    }

    const parts = options.allowToolParts
      ? message.parts.filter(isRenderablePart)
      : message.parts.filter(isTextPart)

    if (parts.length === 0) return []

    return [
      {
        id: 'id' in message && typeof message.id === 'string' ? message.id : `restored-${index}`,
        role: message.role,
        parts,
      } as UIMessage,
    ]
  })
}

export function saveMessages(messages: UIMessage[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // sessionStorage full or unavailable
  }
}

export function loadMessages(): UIMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    // Our own sessionStorage: keep tool parts so a reload does not silently
    // strip the search indicators and navigation cards from the transcript.
    return sanitizeMessages(JSON.parse(raw), { allowToolParts: true })
  } catch {
    return []
  }
}

export function clearMessages(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
