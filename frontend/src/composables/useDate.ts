import type { Lang } from '@/types'

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isToday(k: string): boolean { return k === todayKey() }
export function isPast(k: string): boolean  { return k < todayKey() }

export function fmtLong(k: string, lang: Lang): string {
  return new Date(k + 'T12:00:00').toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )
}

export function fmtShort(k: string, lang: Lang): string {
  return new Date(k + 'T12:00:00').toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { day: '2-digit', month: 'short' }
  )
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}
