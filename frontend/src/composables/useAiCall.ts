import type { Provider, Lang } from '@/types'

export async function callAiDirect(
  prompt: string,
  provider: Provider,
  model: string,
  apiKey: string,
  lang: Lang,
): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (provider.mode === 'anthropic') {
    headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const res = await fetch(provider.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = (j as { error?: { message?: string }; message?: string })?.error?.message ?? (j as { message?: string })?.message ?? ''
    } catch {
      detail = (await res.text().catch(() => '')).slice(0, 120)
    }
    const es = lang === 'es'
    if (res.status === 429) throw new Error(es ? 'Límite de peticiones alcanzado. Espera unos segundos.' : 'Rate limit reached. Wait a moment.')
    if (res.status === 401 || res.status === 403) throw new Error(es ? 'API key inválida o sin permisos.' : 'Invalid API key or insufficient permissions.')
    throw new Error(`HTTP ${res.status}${detail ? ': ' + detail : ''}`)
  }

  const data = await res.json() as { content?: { text: string }[]; choices?: { message: { content: string } }[] }
  return provider.mode === 'anthropic'
    ? data.content![0].text
    : data.choices![0].message.content
}
