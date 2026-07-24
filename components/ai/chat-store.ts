import type { UIMessage } from 'ai'

const STORAGE_KEY = 'librechat-ai-chat'

export function sanitizeMessages(value: unknown): UIMessage[] {
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

    const parts = message.parts.filter(
      (part: unknown): part is { type: 'text'; text: string } =>
        !!part &&
        typeof part === 'object' &&
        'type' in part &&
        part.type === 'text' &&
        'text' in part &&
        typeof part.text === 'string',
    )

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
    return sanitizeMessages(JSON.parse(raw))
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
