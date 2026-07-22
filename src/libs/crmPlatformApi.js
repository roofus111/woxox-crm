'use client'

/**
 * WOXOX CRM Platform API (NestJS + PostgreSQL)
 * Gated by NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD
 */

const PLATFORM_TOKEN_KEY = 'crmPlatformToken'
const IMPERSONATION_KEY = 'crmPlatformImpersonation'

export function isCrmPlatformEnabled() {
  return process.env.NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD === 'true'
}

export function getCrmPlatformBase() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/platform-proxy`
  }
  return (
    process.env.CRM_PLATFORM_API_URL ||
    process.env.NEXT_PUBLIC_CRM_PLATFORM_API_URL ||
    'http://localhost:4001/api/v1'
  )
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

export function getImpersonationState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(IMPERSONATION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setImpersonationState(state) {
  if (typeof window === 'undefined') return
  try {
    if (!state) window.localStorage.removeItem(IMPERSONATION_KEY)
    else window.localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function clearImpersonationState() {
  setImpersonationState(null)
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
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || `Request failed (${res.status})`
    const err = new Error(message)
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

export async function getSuperAdminStats() {
  return platformFetch('/super-admin/stats')
}

export async function listSuperAdminTenants(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()
  return platformFetch(`/super-admin/tenants${qs ? `?${qs}` : ''}`)
}

export async function getSuperAdminTenant(id) {
  return platformFetch(`/super-admin/tenants/${id}`)
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

export async function extendSuperAdminTrial(id, days) {
  return platformFetch(`/super-admin/tenants/${id}/extend-trial`, {
    method: 'POST',
    body: JSON.stringify({ days }),
  })
}

export async function changeSuperAdminOwner(id, payload) {
  return platformFetch(`/super-admin/tenants/${id}/change-owner`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function softDeleteSuperAdminTenant(id) {
  return platformFetch(`/super-admin/tenants/${id}/soft-delete`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function restoreSuperAdminTenant(id) {
  return platformFetch(`/super-admin/tenants/${id}/restore`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function bulkUpdateSuperAdminTenants(ids, action) {
  return platformFetch('/super-admin/tenants/bulk', {
    method: 'POST',
    body: JSON.stringify({ ids, action }),
  })
}

export async function listSuperAdminTenantAudit(id, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()
  return platformFetch(`/super-admin/tenants/${id}/audit${qs ? `?${qs}` : ''}`)
}

export async function impersonateSuperAdminTenant(id) {
  return platformFetch(`/super-admin/tenants/${id}/impersonate`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function openLegacyCrmAsTenant(id) {
  return platformFetch(`/super-admin/tenants/${id}/legacy-open`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function stopSuperAdminImpersonation(sessionId) {
  return platformFetch('/super-admin/impersonation/stop', {
    method: 'POST',
    body: JSON.stringify(sessionId ? { sessionId } : {}),
  })
}
