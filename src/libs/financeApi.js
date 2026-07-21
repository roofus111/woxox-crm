const API = process.env.NEXT_PUBLIC_API_URL

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.message || `Finance API error (${res.status})`)
  }
  return json
}

export const financeApi = {
  getDashboard: (year) => request(`/api/ledger/dashboard${year ? `?year=${year}` : ''}`),
  getBalanceSheet: () => request('/api/ledger/balance-sheet'),
  listLedgers: () => request('/api/ledger/list'),
  createLedger: body => request('/api/ledger/create', { method: 'POST', body: JSON.stringify(body) }),
  getLedger: id => request(`/api/ledger/${id}`),
  updateLedger: (id, body) => request(`/api/ledger/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  listJournals: params => {
    const q = new URLSearchParams(params || {}).toString()
    return request(`/api/ledger/journals${q ? `?${q}` : ''}`)
  },
  createJournal: body => request('/api/ledger/journals', { method: 'POST', body: JSON.stringify(body) }),
  voidJournal: (id, reason) =>
    request(`/api/ledger/journals/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) }),
  seedHistory: () => request('/api/ledger/seed-history', { method: 'POST' })
}

export function formatINR(value) {
  const n = Number(value) || 0
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
