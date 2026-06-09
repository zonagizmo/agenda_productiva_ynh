import type { Providers } from '@/types'
import { Capacitor } from '@capacitor/core'
import { idbGet, idbSet, idbEnqueue } from '@/api/idb'

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

export const apiMeta = { lastSaveMs: 0 }

export const api = {
  storage: {
    get: async (key: string): Promise<{ value: string | null }> => {
      try {
        const res = await request<{ value: string | null }>(`/storage/${key}`)
        if (res.value !== null) idbSet(key, res.value)
        return res
      } catch (e) {
        if (e instanceof AuthError) throw e
        const cached = await idbGet(key)
        return { value: cached }
      }
    },
    set: async (key: string, val: unknown): Promise<{ ok: boolean }> => {
      apiMeta.lastSaveMs = Date.now()
      const serialized = JSON.stringify(val)
      idbSet(key, serialized)
      try {
        return await request<{ ok: boolean }>(`/storage/${key}`, { method: 'POST', body: JSON.stringify({ value: serialized }) })
      } catch (e) {
        if (e instanceof AuthError) throw e
        await idbEnqueue(key, serialized)
        return { ok: false }
      }
    },
    // Sync-only: sends directly without offline fallback (used by offline store queue flush)
    rawSet: (key: string, serialized: string) =>
      request<{ ok: boolean }>(`/storage/${key}`, { method: 'POST', body: JSON.stringify({ value: serialized }) }),
    delete: (key: string)               => request<{ ok: boolean }>(`/storage/${key}`, { method: 'DELETE' }),
    stamp:  ()                          => request<{ stamp: string }>('/storage/stamp'),
  },
  providers:   ()              => request<Providers>('/providers'),
  buildPrompt:     (body: unknown) => request<{ prompt?: string; error?: string }>('/build-prompt',     { method: 'POST', body: JSON.stringify(body) }),
  buildRulePrompt: (body: unknown) => request<{ prompt: string }>('/build-rule-prompt', { method: 'POST', body: JSON.stringify(body) }),
  version:     ()              => request<{ version: string; label: string }>('/version'),
  backup: {
    status: ()  => request<{ last_backup: string | null; file_count: number }>('/backup/status'),
    run:    ()  => request<{ timestamp: string; users: string[]; errors: string[] }>('/backup/run', { method: 'POST' }),
  },
  caldav: {
    getConfig:  ()              => request<Record<string, unknown>>('/caldav/config'),
    saveConfig: (body: unknown) => request<{ ok: boolean }>('/caldav/config', { method: 'POST', body: JSON.stringify(body) }),
    test:       ()              => request<{ ok: boolean; status?: number; hint?: string }>('/caldav/test', { method: 'POST' }),
    discover:   ()              => request<{ ok: boolean; calendars: { name: string; slug: string }[]; hint?: string }>('/caldav/discover', { method: 'POST' }),
    sync:       ()              => request<{ synced: number; deleted: number; errors: string[]; last_sync: string }>('/caldav/sync', { method: 'POST' }),
  },
}
