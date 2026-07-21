'use client'

/**
 * WOXOX CRM Platform API (NestJS + PostgreSQL)
 * Gated by NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD
 */

const PLATFORM_TOKEN_KEY = 'crmPlatformToken'

export function isCrmPlatformEnabled() {
  return process.env.NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD === 'true'
}

export function getCrmPlatformBase() {
  if (typeof window !== 'undefined') {
    // Prefer same-origin proxy in the browser (works on production domain)
    return `${window.location.origin}/platform-api/api/v1`
  }
  return process.env.NEXT_PUBLIC_CRM_PLATFORM_API_URL || 'http://localhost:4001/api/v1'
}

export function getCrmPlatformToken() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(PLATFORM_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setCrmPlatformToken(token) {
  if (typeof window === 'undefined' || !token) return
  try {
    window.localStorage.setItem(PLATFORM_TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export function clearCrmPlatformToken() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PLATFORM_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

/** Login to platform API (call after legacy login with same credentials). */
export async function loginCrmPlatform(email, password) {
  const url = `${getCrmPlatformBase()}/auth/login`
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch (err) {
    throw new Error(`Failed to reach platform API (${url}). ${err.message}`)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Platform login failed (${res.status})`)
  }
  if (data.accessToken) {
    setCrmPlatformToken(data.accessToken)
  }
  return data
}

async function platformFetch(path, options = {}) {
  const token = getCrmPlatformToken()
  const res = await fetch(`${getCrmPlatformBase()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export async function fetchDashboardSummary() {
  return platformFetch('/dashboard/summary')
}

export async function fetchLeads(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()
  return platformFetch(`/leads${qs ? `?${qs}` : ''}`)
}

export async function fetchPipelines() {
  return platformFetch('/pipelines')
}

export async function fetchPipelineBoard(pipelineId) {
  return platformFetch(`/pipelines/${pipelineId}/board`)
}

export async function listSuperAdminTenants() {
  return platformFetch('/super-admin/tenants')
}

export async function createSuperAdminTenant(payload) {
  return platformFetch('/super-admin/tenants', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSuperAdminTenant(id, payload) {
  return platformFetch(`/super-admin/tenants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function resetSuperAdminTenantPassword(id, newPassword) {
  return platformFetch(`/super-admin/tenants/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  })
}
