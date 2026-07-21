/**
 * LegalOS API client — CRM session → LegalOS JWT via /api/legalos/bridge
 */

const STORAGE_KEY = 'woxox-legalos-session'

export function getLegalosApiBase() {
  return (
    process.env.NEXT_PUBLIC_LEGALOS_API_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '')
}

export function readLegalosSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeLegalosSession(session) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export async function ensureLegalosSession() {
  const existing = readLegalosSession()
  if (existing?.token && existing?.workspaceId) return existing

  const res = await fetch('/api/legalos/bridge', { method: 'POST' })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'LegalOS bridge failed')
  }

  const session = {
    token: json.data.token,
    workspaceId: json.data.workspaceId || '000000000000000000000001',
    user: json.data.user || null
  }
  writeLegalosSession(session)
  return session
}

export async function legalosFetch(path, init = {}) {
  const session = await ensureLegalosSession()
  const base = getLegalosApiBase()
  const url = `${base}/api/v1/legal${path.startsWith('/') ? path : `/${path}`}`

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
      'X-Workspace-Id': session.workspaceId,
      ...(init.headers || {})
    }
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json?.error?.message || json?.error || res.statusText || 'Request failed'
    throw new Error(typeof msg === 'string' ? msg : 'Request failed')
  }
  return json?.data !== undefined ? { data: json.data, meta: json.meta } : { data: json }
}

export function formatLegalField(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'object') {
    return value.name || value.title || value.label || value.courtName || value.fullName || ''
  }
  return ''
}
