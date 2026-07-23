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
  if (data.accessToken && !data.mfaRequired) {
    setCrmPlatformToken(data.accessToken)
  }
  return data
}

/** Link an existing legacy session to the platform API (after company-register, etc.). */
export async function bridgeCrmPlatformWithLegacyToken(legacyToken) {
  const url = `${getCrmPlatformBase()}/auth/legacy-bridge`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ legacyToken }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Platform bridge failed (${res.status})`)
  }
  if (data.accessToken) setCrmPlatformToken(data.accessToken)
  return data
}

export async function verifyCrmPlatformMfa(mfaToken, code) {
  const url = `${getCrmPlatformBase()}/auth/mfa/verify`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mfaToken, code }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `MFA failed (${res.status})`)
  }
  if (data.accessToken) setCrmPlatformToken(data.accessToken)
  return data
}

export async function setupCrmPlatformMfa() {
  return platformFetch('/auth/mfa/setup', { method: 'POST', body: JSON.stringify({}) })
}

export async function enableCrmPlatformMfa(code) {
  return platformFetch('/auth/mfa/enable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export async function disableCrmPlatformMfa(code) {
  return platformFetch('/auth/mfa/disable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export async function getOnboardingStatus() {
  return platformFetch('/auth/onboarding')
}

export async function syncTenantModulesFromPlatform(updateSession) {
  if (!getCrmPlatformToken()) return null
  try {
    const data = await getOnboardingStatus()
    const modules = data.workspace?.enabledModules?.length
      ? data.workspace.enabledModules
      : ['crm']
    const planModules = data.workspace?.planModules?.length
      ? data.workspace.planModules
      : modules
    const { storeEnabledProducts } = await import('@/libs/tenantModules')
    storeEnabledProducts(modules)
    if (updateSession) {
      await updateSession({
        user: {
          enabledModules: modules,
          enabledProducts: modules,
          planModules,
        },
      })
    }
    return modules
  } catch {
    return null
  }
}

export async function updateOnboarding(payload) {
  return platformFetch('/auth/onboarding', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function completeOnboarding() {
  return platformFetch('/auth/onboarding/complete', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function listPublicPlans() {
  return platformFetch('/billing/public/plans')
}

export async function publicSignup(payload) {
  return platformFetch('/billing/public/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function publicVerifyPayment(payload) {
  return platformFetch('/billing/public/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
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

export async function fetchPipelines(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()
  return platformFetch(`/pipelines${qs ? `?${qs}` : ''}`)
}

export async function fetchPipeline(pipelineId) {
  return platformFetch(`/pipelines/${pipelineId}`)
}

export async function fetchPipelineBoard(pipelineId) {
  return platformFetch(`/pipelines/${pipelineId}/board`)
}

export async function createPipeline(payload) {
  return platformFetch('/pipelines', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updatePipeline(pipelineId, payload) {
  return platformFetch(`/pipelines/${pipelineId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export async function deletePipeline(pipelineId) {
  return platformFetch(`/pipelines/${pipelineId}`, { method: 'DELETE' })
}

export async function clonePipeline(pipelineId, payload = {}) {
  return platformFetch(`/pipelines/${pipelineId}/clone`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function publishPipeline(pipelineId, payload = {}) {
  return platformFetch(`/pipelines/${pipelineId}/publish`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function exportPipeline(pipelineId) {
  return platformFetch(`/pipelines/${pipelineId}/export`)
}

export async function importPipeline(payload) {
  return platformFetch('/pipelines/import', { method: 'POST', body: JSON.stringify(payload) })
}

export async function fetchPipelineTemplates() {
  return platformFetch('/pipelines/templates')
}

export async function applyPipelineTemplate(payload) {
  return platformFetch('/pipelines/templates/apply', { method: 'POST', body: JSON.stringify(payload) })
}

export async function savePipelineAsTemplate(pipelineId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/save-template`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function addPipelineStage(pipelineId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/stages`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function updatePipelineStage(pipelineId, stageId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deletePipelineStage(pipelineId, stageId) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}`, { method: 'DELETE' })
}

export async function reorderPipelineStages(pipelineId, stageIds) {
  return platformFetch(`/pipelines/${pipelineId}/stages/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ stageIds }),
  })
}

export async function duplicatePipelineStage(pipelineId, stageId) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/duplicate`, { method: 'POST', body: '{}' })
}

export async function upsertStageField(pipelineId, stageId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/fields`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteStageField(pipelineId, stageId, fieldId) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/fields/${fieldId}`, { method: 'DELETE' })
}

export async function upsertStageDocument(pipelineId, stageId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/documents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteStageDocument(pipelineId, stageId, docId) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/documents/${docId}`, { method: 'DELETE' })
}

export async function addStageChecklistItem(pipelineId, stageId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/checklist`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteStageChecklistItem(pipelineId, stageId, itemId) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/checklist/${itemId}`, { method: 'DELETE' })
}

export async function addStagePermission(pipelineId, stageId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/permissions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteStagePermission(pipelineId, stageId, permId) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/permissions/${permId}`, { method: 'DELETE' })
}

export async function addStageAutomation(pipelineId, stageId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/automations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteStageAutomation(pipelineId, stageId, autoId) {
  return platformFetch(`/pipelines/${pipelineId}/stages/${stageId}/automations/${autoId}`, { method: 'DELETE' })
}

export async function upsertTransitionRule(pipelineId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/transitions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteTransitionRule(pipelineId, ruleId) {
  return platformFetch(`/pipelines/${pipelineId}/transitions/${ruleId}`, { method: 'DELETE' })
}

export async function validatePipelineTransition(pipelineId, payload) {
  return platformFetch(`/pipelines/${pipelineId}/validate-transition`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchPipelineAudit(pipelineId) {
  return platformFetch(`/pipelines/${pipelineId}/audit`)
}

export async function fetchPipelineVersions(pipelineId) {
  return platformFetch(`/pipelines/${pipelineId}/versions`)
}

export async function restorePipelineVersion(pipelineId, version) {
  return platformFetch(`/pipelines/${pipelineId}/versions/${version}/restore`, {
    method: 'POST',
    body: '{}',
  })
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

// ─── Billing ────────────────────────────────────────────────────────────────

export async function getBillingRevenue() {
  return platformFetch('/billing/revenue')
}

export async function listBillingPlans() {
  return platformFetch('/billing/plans')
}

export async function upsertBillingPlan(payload) {
  return platformFetch('/billing/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listBillingSubscriptions(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()
  return platformFetch(`/billing/subscriptions${qs ? `?${qs}` : ''}`)
}

export async function getWorkspaceSubscription(workspaceId) {
  return platformFetch(`/billing/subscriptions/workspace/${workspaceId}`)
}

export async function assignBillingSubscription(payload) {
  return platformFetch('/billing/subscriptions/assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function cancelBillingSubscription(id, atPeriodEnd = true) {
  return platformFetch(`/billing/subscriptions/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ atPeriodEnd }),
  })
}

export async function listBillingCoupons() {
  return platformFetch('/billing/coupons')
}

export async function upsertBillingCoupon(payload) {
  return platformFetch('/billing/coupons', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listBillingInvoices(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()
  return platformFetch(`/billing/invoices${qs ? `?${qs}` : ''}`)
}

export async function createRazorpayOrder(payload) {
  return platformFetch('/billing/razorpay/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createRazorpayPaymentLink(payload) {
  return platformFetch('/billing/razorpay/payment-links', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function verifyRazorpayPayment(payload) {
  return platformFetch('/billing/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getSuperAdminMe() {
  return platformFetch('/super-admin/me')
}

export async function listPlatformStaff() {
  return platformFetch('/super-admin/staff')
}

export async function createPlatformStaff(payload) {
  return platformFetch('/super-admin/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updatePlatformStaff(membershipId, payload) {
  return platformFetch(`/super-admin/staff/${membershipId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
