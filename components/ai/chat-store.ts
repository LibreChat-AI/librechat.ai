import type { UIMessage } from 'ai'

const STORAGE_KEY = 'librechat-ai-chat'

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
    return JSON.parse(raw) as UIMessage[]
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
