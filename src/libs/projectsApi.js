'use client'

import { authHeaders, getApiBase, syncAuthTokenFromSession } from '@/libs/apiAuth'

const base = () => `${getApiBase()}/api/projects`

async function handle(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || data.error || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

/** Call before project API usage so Bearer token is present. */
export function prepareProjectsAuth(accessToken) {
  syncAuthTokenFromSession(accessToken)
}

export async function fetchWorkspaceSummary(edition) {
  const q = edition ? `?edition=${encodeURIComponent(edition)}` : ''
  const res = await fetch(`${base()}/workspace/summary${q}`, { headers: authHeaders() })
  return handle(res)
}

export async function listProjects(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString()
  const res = await fetch(`${base()}${qs ? `?${qs}` : ''}`, { headers: authHeaders() })
  return handle(res)
}

export async function getProject(id) {
  const res = await fetch(`${base()}/${id}`, { headers: authHeaders() })
  return handle(res)
}

export async function createProject(payload) {
  const res = await fetch(`${base()}/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })
  return handle(res)
}

export async function updateProject(id, payload) {
  const res = await fetch(`${base()}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })
  return handle(res)
}

export async function archiveProject(id) {
  const res = await fetch(`${base()}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  return handle(res)
}

export async function addMilestone(projectId, payload) {
  const res = await fetch(`${base()}/${projectId}/milestones`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })
  return handle(res)
}

export async function linkTasks(projectId, taskIds) {
  const res = await fetch(`${base()}/${projectId}/link-tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ taskIds })
  })
  return handle(res)
}

export async function fetchTaskCounts() {
  const res = await fetch(`${getApiBase()}/api/tasks/getcounts`, { headers: authHeaders() })
  return handle(res)
}
