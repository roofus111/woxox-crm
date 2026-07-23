import axios from 'axios'

const API = () => process.env.NEXT_PUBLIC_API_URL

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function listEnvelopes(params = {}) {
  const { data } = await axios.get(`${API()}/api/docsign/envelopes`, {
    headers: authHeaders(),
    params
  })
  return data
}

export async function getEnvelope(id) {
  const { data } = await axios.get(`${API()}/api/docsign/envelopes/${id}`, {
    headers: authHeaders()
  })
  return data
}

export async function createEnvelope({ file, title, message, signers, signingOrder, reminder }) {
  const form = new FormData()
  form.append('file', file)
  form.append('title', title || file.name)
  form.append('message', message || '')
  form.append('signers', JSON.stringify(signers || []))
  form.append('signingOrder', String(signingOrder !== false))
  if (reminder) {
    form.append('reminderEnabled', String(reminder.enabled !== false))
    form.append('reminderIntervalDays', String(reminder.intervalDays || 3))
    form.append('maxReminders', String(reminder.maxReminders || 5))
  }
  const { data } = await axios.post(`${API()}/api/docsign/envelopes`, form, {
    headers: authHeaders()
  })
  return data
}

export async function updateEnvelope(id, payload) {
  const { data } = await axios.put(`${API()}/api/docsign/envelopes/${id}`, payload, {
    headers: authHeaders()
  })
  return data
}

export async function sendEnvelope(id) {
  const { data } = await axios.post(`${API()}/api/docsign/envelopes/${id}/send`, {}, {
    headers: authHeaders()
  })
  return data
}

export async function remindEnvelope(id) {
  const { data } = await axios.post(`${API()}/api/docsign/envelopes/${id}/remind`, {}, {
    headers: authHeaders()
  })
  return data
}

export async function voidEnvelope(id, reason = '') {
  const { data } = await axios.post(
    `${API()}/api/docsign/envelopes/${id}/void`,
    { reason },
    { headers: authHeaders() }
  )
  return data
}

export async function deleteEnvelope(id) {
  const { data } = await axios.delete(`${API()}/api/docsign/envelopes/${id}`, {
    headers: authHeaders()
  })
  return data
}

export async function getPublicEnvelope(token) {
  const { data } = await axios.get(`${API()}/api/docsign/public/${token}`)
  return data
}

export async function markPublicViewed(token) {
  const { data } = await axios.post(`${API()}/api/docsign/public/${token}/view`)
  return data
}

export async function signPublicEnvelope(token, fields) {
  const { data } = await axios.post(`${API()}/api/docsign/public/${token}/sign`, { fields })
  return data
}

export async function declinePublicEnvelope(token, reason) {
  const { data } = await axios.post(`${API()}/api/docsign/public/${token}/decline`, { reason })
  return data
}

export const STATUS_COLOR = {
  draft: 'default',
  sent: 'info',
  completed: 'success',
  declined: 'error',
  voided: 'warning',
  expired: 'warning'
}
