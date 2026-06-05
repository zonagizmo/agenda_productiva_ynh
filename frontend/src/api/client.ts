import type { Providers } from '@/types'
import { Capacitor } from '@capacitor/core'

export class AuthError extends Error { name = 'AuthError' }

let nativeBase = ''

export function initNativeApi(serverUrl: string) {
  nativeBase = serverUrl.replace(/\/$/, '') + '/api'
}

function base() {
  return Capacitor.isNativePlatform() && nativeBase ? nativeBase : './api'
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  })

  // SSOwat redirige a su página de login cuando la sesión expira.
  // fetch la sigue y devuelve 200 HTML en vez del JSON esperado.
  if (res.status === 401 || res.status === 403) throw new AuthError()
  if (res.redirected || res.headers.get('content-type')?.includes('text/html')) throw new AuthError()

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  storage: {
    get:    (key: string)               => request<{ value: string | null }>(`/storage/${key}`),
    set:    (key: string, val: unknown) => request<{ ok: boolean }>(`/storage/${key}`, { method: 'POST', body: JSON.stringify({ value: JSON.stringify(val) }) }),
    delete: (key: string)               => request<{ ok: boolean }>(`/storage/${key}`, { method: 'DELETE' }),
  },
  providers:   ()              => request<Providers>('/providers'),
  buildPrompt: (body: unknown) => request<{ prompt?: string; error?: string }>('/build-prompt', { method: 'POST', body: JSON.stringify(body) }),
  version:     ()              => request<{ version: string; label: string }>('/version'),
  backup: {
    status: ()  => request<{ last_backup: string | null; file_count: number }>('/backup/status'),
    run:    ()  => request<{ timestamp: string; users: string[]; errors: string[] }>('/backup/run', { method: 'POST' }),
  },
  caldav: {
    getConfig:  ()              => request<Record<string, unknown>>('/caldav/config'),
    saveConfig: (body: unknown) => request<{ ok: boolean }>('/caldav/config', { method: 'POST', body: JSON.stringify(body) }),
    test:       ()              => request<{ ok: boolean; status?: number }>('/caldav/test', { method: 'POST' }),
    sync:       ()              => request<{ synced: number; deleted: number; errors: string[]; last_sync: string }>('/caldav/sync', { method: 'POST' }),
  },
}
