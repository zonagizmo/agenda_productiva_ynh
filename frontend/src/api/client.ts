import type { Providers } from '@/types'

const BASE = './api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  storage: {
    get:    (key: string)                 => request<{ value: string | null }>(`/storage/${key}`),
    set:    (key: string, val: unknown)   => request<{ ok: boolean }>(`/storage/${key}`, { method: 'POST', body: JSON.stringify({ value: JSON.stringify(val) }) }),
    delete: (key: string)                 => request<{ ok: boolean }>(`/storage/${key}`, { method: 'DELETE' }),
  },
  providers:    ()          => request<Providers>('/providers'),
  buildPrompt:  (body: unknown) => request<{ prompt?: string; error?: string }>('/build-prompt', { method: 'POST', body: JSON.stringify(body) }),
  version:      ()          => request<{ version: string; label: string }>('/version'),
}
