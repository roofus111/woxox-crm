'use client'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const base = () => `${process.env.NEXT_PUBLIC_API_URL}/api/personal-whatsapp`

export async function getPersonalWhatsAppStatus() {
  const res = await fetch(`${base()}/status`, { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to get WhatsApp status')
  return data
}

export async function connectPersonalWhatsApp({ refresh = false } = {}) {
  const res = await fetch(`${base()}/connect`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh: Boolean(refresh) }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to start WhatsApp connection')
  return data
}

export async function disconnectPersonalWhatsApp() {
  const res = await fetch(`${base()}/disconnect`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to disconnect WhatsApp')
  return data
}

export async function sendPersonalWhatsAppMessage({ phone, message, leadId }) {
  const res = await fetch(`${base()}/send`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ phone, message, leadId }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to send WhatsApp message')
  return data
}
