import { vi } from 'vitest'

export function jsonRequest(
  url: string,
  body: unknown,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Request {
  const headers = new Headers(init.headers)
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  return new Request(url, {
    method: init.method ?? 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

export interface SupabaseMockOptions {
  existing?: { id: string; status: string } | null
  fetchError?: boolean
  insertError?: boolean
  updateError?: boolean
}

export function createSupabaseMock(options: SupabaseMockOptions = {}) {
  const eqAfterDelete = vi.fn().mockResolvedValue({ error: null })
  const deleteRows = vi.fn().mockReturnValue({ eq: eqAfterDelete })
  const eqAfterUpdate = vi
    .fn()
    .mockResolvedValue(
      options.updateError ? { error: { message: 'update failed' } } : { error: null },
    )
  const update = vi.fn().mockReturnValue({ eq: eqAfterUpdate })
  const insert = vi
    .fn()
    .mockResolvedValue(
      options.insertError ? { error: { message: 'insert failed' } } : { error: null },
    )
  const single = vi
    .fn()
    .mockResolvedValue(
      options.fetchError || !options.existing
        ? { data: null, error: { message: 'not found' } }
        : { data: options.existing, error: null },
    )
  const maybeSingle = vi
    .fn()
    .mockResolvedValue(options.existing ? { data: options.existing, error: null } : { data: null })
  const eqByStatus = vi.fn().mockReturnValue({ maybeSingle })
  const eqAfterSelect = vi.fn().mockReturnValue({ single, eq: eqByStatus })
  const select = vi.fn().mockReturnValue({ eq: eqAfterSelect })
  const from = vi.fn().mockReturnValue({ select, update, insert, delete: deleteRows })

  return {
    from,
    select,
    eqAfterSelect,
    eqByStatus,
    single,
    maybeSingle,
    update,
    eqAfterUpdate,
    insert,
    deleteRows,
    eqAfterDelete,
  }
}
