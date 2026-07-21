'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearCrmPlatformToken,
  createSuperAdminTenant,
  getCrmPlatformToken,
  listSuperAdminTenants,
  loginCrmPlatform,
  resetSuperAdminTenantPassword,
  updateSuperAdminTenant,
} from '@/libs/crmPlatformApi'

const MODULE_OPTIONS = [
  'crm',
  'finance',
  'hrms',
  'legalos',
  'projectsLite',
  'projectsMax',
  'academy',
  'ecommerce',
]

const emptyForm = {
  companyName: '',
  adminEmail: '',
  adminPassword: '',
  adminName: '',
  plan: 'trial',
  trialDays: 14,
  enabledModules: ['crm'],
}

export default function SuperAdminPage() {
  const [token, setToken] = useState(null)
  const [email, setEmail] = useState('admin@woxox.local')
  const [password, setPassword] = useState('admin123')
  const [tenants, setTenants] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [created, setCreated] = useState(null)

  const isAuthed = Boolean(token)

  const loadTenants = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const data = await listSuperAdminTenants()
      setTenants(data.tenants || [])
    } catch (err) {
      setError(err.message || 'Failed to load tenants')
      if (err.status === 401 || err.status === 403) {
        clearCrmPlatformToken()
        setToken(null)
      }
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    const existing = getCrmPlatformToken()
    if (existing) {
      setToken(existing)
    }
  }, [])

  useEffect(() => {
    if (token) loadTenants()
  }, [token, loadTenants])

  const activeCount = useMemo(
    () => tenants.filter(t => t.status === 'active').length,
    [tenants]
  )

  const onLogin = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await loginCrmPlatform(email, password)
      if (data.user?.role !== 'SUPER_ADMIN') {
        clearCrmPlatformToken()
        setToken(null)
        throw new Error('This account is not a Super Admin')
      }
      setToken(data.accessToken)
      setNotice('Logged in as Super Admin')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const onCreate = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    setCreated(null)
    try {
      const data = await createSuperAdminTenant({
        ...form,
        trialDays: Number(form.trialDays) || 0,
      })
      setCreated(data.tenant)
      setNotice(`Created ${data.tenant?.tenantCode} — ${data.tenant?.name}`)
      setForm(emptyForm)
      await loadTenants()
    } catch (err) {
      setError(err.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  const toggleModule = mod => {
    setForm(prev => {
      const has = prev.enabledModules.includes(mod)
      return {
        ...prev,
        enabledModules: has
          ? prev.enabledModules.filter(m => m !== mod)
          : [...prev.enabledModules, mod],
      }
    })
  }

  const suspendTenant = async id => {
    setBusy(true)
    setError('')
    try {
      await updateSuperAdminTenant(id, { status: 'suspended' })
      setNotice('Tenant suspended')
      await loadTenants()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const activateTenant = async id => {
    setBusy(true)
    setError('')
    try {
      await updateSuperAdminTenant(id, { status: 'active' })
      setNotice('Tenant activated')
      await loadTenants()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (id, adminEmail) => {
    const next = window.prompt(`New temporary password for ${adminEmail}`)
    if (!next || next.length < 6) return
    setBusy(true)
    setError('')
    try {
      await resetSuperAdminTenantPassword(id, next)
      setNotice(`Password reset for ${adminEmail}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    clearCrmPlatformToken()
    setToken(null)
    setTenants([])
    setNotice('Logged out')
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>WOXOX Control Center</p>
            <h1 style={styles.title}>Super Admin</h1>
            <p style={styles.sub}>Create and manage company tenants</p>
          </div>
          {isAuthed && (
            <button type='button' style={styles.ghostBtn} onClick={logout}>
              Log out
            </button>
          )}
        </header>

        {error ? <div style={styles.error}>{error}</div> : null}
        {notice ? <div style={styles.notice}>{notice}</div> : null}

        {!isAuthed ? (
          <form onSubmit={onLogin} style={styles.card}>
            <h2 style={styles.cardTitle}>Super Admin Login</h2>
            <label style={styles.label}>
              Email
              <input
                style={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                type='email'
                required
              />
            </label>
            <label style={styles.label}>
              Password
              <input
                style={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                type='password'
                required
              />
            </label>
            <button type='submit' style={styles.primaryBtn} disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <p style={styles.hint}>Use your platform SUPER_ADMIN account (seed: admin@woxox.local)</p>
          </form>
        ) : (
          <>
            <div style={styles.stats}>
              <div style={styles.stat}>
                <strong>{tenants.length}</strong>
                <span>Tenants</span>
              </div>
              <div style={styles.stat}>
                <strong>{activeCount}</strong>
                <span>Active</span>
              </div>
            </div>

            <form onSubmit={onCreate} style={styles.card}>
              <h2 style={styles.cardTitle}>Create Company Tenant</h2>
              <div style={styles.grid2}>
                <label style={styles.label}>
                  Company name
                  <input
                    style={styles.input}
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    required
                  />
                </label>
                <label style={styles.label}>
                  Admin name
                  <input
                    style={styles.input}
                    value={form.adminName}
                    onChange={e => setForm({ ...form, adminName: e.target.value })}
                  />
                </label>
                <label style={styles.label}>
                  Admin email
                  <input
                    style={styles.input}
                    type='email'
                    value={form.adminEmail}
                    onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                    required
                  />
                </label>
                <label style={styles.label}>
                  Temp password
                  <input
                    style={styles.input}
                    value={form.adminPassword}
                    onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </label>
                <label style={styles.label}>
                  Plan
                  <select
                    style={styles.input}
                    value={form.plan}
                    onChange={e => setForm({ ...form, plan: e.target.value })}
                  >
                    <option value='trial'>Trial</option>
                    <option value='starter'>Starter</option>
                    <option value='professional'>Professional</option>
                    <option value='enterprise'>Enterprise</option>
                  </select>
                </label>
                <label style={styles.label}>
                  Trial days
                  <input
                    style={styles.input}
                    type='number'
                    min={0}
                    value={form.trialDays}
                    onChange={e => setForm({ ...form, trialDays: e.target.value })}
                  />
                </label>
              </div>

              <p style={styles.labelText}>Modules</p>
              <div style={styles.modules}>
                {MODULE_OPTIONS.map(mod => (
                  <label key={mod} style={styles.check}>
                    <input
                      type='checkbox'
                      checked={form.enabledModules.includes(mod)}
                      onChange={() => toggleModule(mod)}
                    />
                    {mod}
                  </label>
                ))}
              </div>

              <button type='submit' style={styles.primaryBtn} disabled={busy}>
                {busy ? 'Creating…' : 'Create tenant'}
              </button>
            </form>

            {created ? (
              <div style={styles.successCard}>
                <h3 style={{ margin: 0 }}>Tenant ready</h3>
                <p style={styles.mono}>
                  {created.tenantCode} · {created.name}
                  <br />
                  Login: {created.loginUrl}
                  <br />
                  Admin: {created.admin?.email}
                  <br />
                  Legacy CRM: {created.legacyProvisioned ? 'Yes' : created.legacyMessage}
                </p>
              </div>
            ) : null}

            <div style={styles.card}>
              <div style={styles.rowBetween}>
                <h2 style={styles.cardTitle}>All tenants</h2>
                <button type='button' style={styles.ghostBtn} onClick={loadTenants} disabled={busy}>
                  Refresh
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Company</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Modules</th>
                      <th>Admins</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(t => (
                      <tr key={t.id}>
                        <td style={styles.mono}>{t.tenantCode || '—'}</td>
                        <td>
                          <strong>{t.name}</strong>
                          <div style={styles.muted}>{t.slug}</div>
                        </td>
                        <td>{t.plan}</td>
                        <td>
                          <span
                            style={{
                              ...styles.badge,
                              background: t.status === 'active' ? '#dcfce7' : '#fee2e2',
                              color: t.status === 'active' ? '#166534' : '#991b1b',
                            }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td>{(t.enabledModules || []).join(', ')}</td>
                        <td>
                          {(t.admins || []).map(a => (
                            <div key={a.id} style={styles.muted}>
                              {a.email}
                            </div>
                          ))}
                        </td>
                        <td>
                          <div style={styles.actions}>
                            {t.status === 'active' ? (
                              <button type='button' style={styles.smallBtn} onClick={() => suspendTenant(t.id)}>
                                Suspend
                              </button>
                            ) : (
                              <button type='button' style={styles.smallBtn} onClick={() => activateTenant(t.id)}>
                                Activate
                              </button>
                            )}
                            <button
                              type='button'
                              style={styles.smallBtn}
                              onClick={() => resetPassword(t.id, t.admins?.[0]?.email || 'admin')}
                            >
                              Reset PW
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!tenants.length ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 16, color: '#64748b' }}>
                          No tenants yet
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 45%, #0f766e 100%)',
    padding: '32px 16px 64px',
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    color: '#0f172a',
  },
  shell: { maxWidth: 1100, margin: '0 auto' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    color: '#f8fafc',
  },
  eyebrow: { margin: 0, opacity: 0.8, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 12 },
  title: { margin: '6px 0', fontSize: 36, fontWeight: 700 },
  sub: { margin: 0, opacity: 0.85 },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
  },
  cardTitle: { marginTop: 0, marginBottom: 16, fontSize: 20 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, fontSize: 14, fontWeight: 600 },
  labelText: { margin: '8px 0', fontSize: 14, fontWeight: 600 },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    fontWeight: 400,
  },
  primaryBtn: {
    marginTop: 8,
    background: '#0f766e',
    color: '#fff',
    border: 0,
    borderRadius: 10,
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  ghostBtn: {
    background: 'transparent',
    color: '#e2e8f0',
    border: '1px solid rgba(226,232,240,0.4)',
    borderRadius: 10,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  smallBtn: {
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 12,
  },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 },
  modules: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  check: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 13 },
  stats: { display: 'flex', gap: 12, marginBottom: 16 },
  stat: {
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: 12,
    padding: '14px 18px',
    minWidth: 120,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, lineHeight: 1.6 },
  muted: { color: '#64748b', fontSize: 12 },
  badge: { borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700 },
  actions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  rowBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 14px',
    borderRadius: 10,
    marginBottom: 12,
  },
  notice: {
    background: '#ecfdf5',
    color: '#065f46',
    padding: '12px 14px',
    borderRadius: 10,
    marginBottom: 12,
  },
  successCard: {
    background: '#ecfeff',
    border: '1px solid #a5f3fc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  hint: { color: '#64748b', fontSize: 12, marginTop: 12 },
}
