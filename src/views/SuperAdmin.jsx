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
  { id: 'crm', label: 'CRM' },
  { id: 'finance', label: 'Finance' },
  { id: 'hrms', label: 'HR' },
  { id: 'legalos', label: 'LegalOS' },
  { id: 'projectsLite', label: 'Projects Lite' },
  { id: 'projectsMax', label: 'Projects Max' },
  { id: 'academy', label: 'Academy' },
  { id: 'ecommerce', label: 'Ecommerce' },
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
  const [password, setPassword] = useState('')
  const [tenants, setTenants] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [created, setCreated] = useState(null)
  const [tab, setTab] = useState('tenants') // tenants | create

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
    if (existing) setToken(existing)
  }, [])

  useEffect(() => {
    if (token) loadTenants()
  }, [token, loadTenants])

  const stats = useMemo(() => {
    const active = tenants.filter(t => t.status === 'active').length
    const suspended = tenants.filter(t => t.status === 'suspended').length
    return { total: tenants.length, active, suspended }
  }, [tenants])

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
      setNotice('Welcome back')
      setTab('tenants')
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
      setTab('tenants')
      await loadTenants()
    } catch (err) {
      setError(err.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  const toggleModule = id => {
    setForm(prev => {
      const has = prev.enabledModules.includes(id)
      return {
        ...prev,
        enabledModules: has
          ? prev.enabledModules.filter(m => m !== id)
          : [...prev.enabledModules, id],
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
    const next = window.prompt(`New temporary password for ${adminEmail || 'admin'}`)
    if (!next || next.length < 6) return
    setBusy(true)
    setError('')
    try {
      await resetSuperAdminTenantPassword(id, next)
      setNotice(`Password updated for ${adminEmail}`)
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
    setCreated(null)
    setNotice('')
    setError('')
  }

  if (!isAuthed) {
    return (
      <div className='sa-root sa-login-root'>
        <style>{css}</style>
        <div className='sa-login-panel'>
          <div className='sa-brand'>
            <span className='sa-logo'>W</span>
            <div>
              <p className='sa-kicker'>WOXOX</p>
              <h1>Control Center</h1>
              <p className='sa-lead'>Super Admin access for company tenants</p>
            </div>
          </div>

          <form className='sa-form' onSubmit={onLogin}>
            {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
            <label>
              Email
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete='username'
                required
              />
            </label>
            <label>
              Password
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete='current-password'
                required
                placeholder='Enter password'
              />
            </label>
            <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className='sa-root'>
      <style>{css}</style>

      <header className='sa-topbar'>
        <div className='sa-topbar-left'>
          <span className='sa-logo sa-logo-sm'>W</span>
          <div>
            <p className='sa-kicker'>WOXOX Control Center</p>
            <h1>Super Admin</h1>
          </div>
        </div>
        <div className='sa-topbar-actions'>
          <button type='button' className='sa-btn sa-btn-ghost' onClick={loadTenants} disabled={busy}>
            Refresh
          </button>
          <button type='button' className='sa-btn sa-btn-ghost' onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className='sa-main'>
        {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
        {notice ? <div className='sa-alert sa-alert-ok'>{notice}</div> : null}

        {created ? (
          <section className='sa-banner'>
            <div>
              <h2>Tenant created</h2>
              <p>
                <strong>{created.tenantCode}</strong> · {created.name}
              </p>
              <p className='sa-mono'>
                Login: {created.loginUrl}
                <br />
                Admin: {created.admin?.email}
                <br />
                CRM provision: {created.legacyProvisioned ? 'Ready' : created.legacyMessage}
              </p>
            </div>
            <button type='button' className='sa-btn sa-btn-ghost' onClick={() => setCreated(null)}>
              Dismiss
            </button>
          </section>
        ) : null}

        <section className='sa-stats'>
          <div className='sa-stat'>
            <strong>{stats.total}</strong>
            <span>Total companies</span>
          </div>
          <div className='sa-stat'>
            <strong>{stats.active}</strong>
            <span>Active</span>
          </div>
          <div className='sa-stat'>
            <strong>{stats.suspended}</strong>
            <span>Suspended</span>
          </div>
        </section>

        <nav className='sa-tabs'>
          <button
            type='button'
            className={tab === 'tenants' ? 'sa-tab active' : 'sa-tab'}
            onClick={() => setTab('tenants')}
          >
            All companies
          </button>
          <button
            type='button'
            className={tab === 'create' ? 'sa-tab active' : 'sa-tab'}
            onClick={() => setTab('create')}
          >
            Create company
          </button>
        </nav>

        {tab === 'create' ? (
          <section className='sa-panel'>
            <h2>Create company tenant</h2>
            <p className='sa-help'>Creates workspace, admin user, modules, and CRM login.</p>
            <form className='sa-form' onSubmit={onCreate}>
              <div className='sa-grid'>
                <label>
                  Company name
                  <input
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    placeholder='ABC Industries'
                    required
                  />
                </label>
                <label>
                  Admin name
                  <input
                    value={form.adminName}
                    onChange={e => setForm({ ...form, adminName: e.target.value })}
                    placeholder='Rahul Sharma'
                  />
                </label>
                <label>
                  Admin email
                  <input
                    type='email'
                    value={form.adminEmail}
                    onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                    placeholder='admin@abc.com'
                    required
                  />
                </label>
                <label>
                  Temporary password
                  <input
                    value={form.adminPassword}
                    onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                    placeholder='Min 6 characters'
                    required
                    minLength={6}
                  />
                </label>
                <label>
                  Plan
                  <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
                    <option value='trial'>Free Trial</option>
                    <option value='starter'>Starter</option>
                    <option value='professional'>Professional</option>
                    <option value='enterprise'>Enterprise</option>
                  </select>
                </label>
                <label>
                  Trial days
                  <input
                    type='number'
                    min={0}
                    value={form.trialDays}
                    onChange={e => setForm({ ...form, trialDays: e.target.value })}
                  />
                </label>
              </div>

              <p className='sa-label'>Modules</p>
              <div className='sa-modules'>
                {MODULE_OPTIONS.map(mod => (
                  <label key={mod.id} className='sa-chip'>
                    <input
                      type='checkbox'
                      checked={form.enabledModules.includes(mod.id)}
                      onChange={() => toggleModule(mod.id)}
                    />
                    {mod.label}
                  </label>
                ))}
              </div>

              <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
                {busy ? 'Creating…' : 'Create tenant'}
              </button>
            </form>
          </section>
        ) : (
          <section className='sa-panel'>
            <h2>Companies</h2>
            <div className='sa-table-wrap'>
              <table className='sa-table'>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Company</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Modules</th>
                    <th>Admin</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id}>
                      <td className='sa-mono'>{t.tenantCode || '—'}</td>
                      <td>
                        <strong>{t.name}</strong>
                        <div className='sa-muted'>{t.slug}</div>
                      </td>
                      <td>{t.plan}</td>
                      <td>
                        <span className={t.status === 'active' ? 'sa-pill ok' : 'sa-pill bad'}>
                          {t.status}
                        </span>
                      </td>
                      <td className='sa-muted'>{(t.enabledModules || []).join(', ') || '—'}</td>
                      <td className='sa-muted'>
                        {(t.admins || []).map(a => (
                          <div key={a.id}>{a.email}</div>
                        ))}
                      </td>
                      <td>
                        <div className='sa-row-actions'>
                          {t.status === 'active' ? (
                            <button type='button' onClick={() => suspendTenant(t.id)} disabled={busy}>
                              Suspend
                            </button>
                          ) : (
                            <button type='button' onClick={() => activateTenant(t.id)} disabled={busy}>
                              Activate
                            </button>
                          )}
                          <button
                            type='button'
                            onClick={() => resetPassword(t.id, t.admins?.[0]?.email)}
                            disabled={busy}
                          >
                            Reset password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!tenants.length ? (
                    <tr>
                      <td colSpan={7} className='sa-empty'>
                        No companies yet. Use <strong>Create company</strong> to add the first tenant.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

const css = `
  .sa-root {
    min-height: 100vh;
    background: #f4f6f8;
    color: #0f172a;
    font-family: "Segoe UI", ui-sans-serif, system-ui, sans-serif;
  }
  .sa-login-root {
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(1200px 600px at 10% -10%, rgba(15, 118, 110, 0.18), transparent 60%),
      linear-gradient(180deg, #0b1220 0%, #122033 100%);
  }
  .sa-login-panel {
    width: min(440px, 100%);
    background: #fff;
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.28);
  }
  .sa-brand { display: flex; gap: 14px; align-items: center; margin-bottom: 22px; }
  .sa-brand h1 { margin: 0; font-size: 1.6rem; }
  .sa-lead { margin: 4px 0 0; color: #64748b; font-size: 0.92rem; }
  .sa-logo {
    width: 48px; height: 48px; border-radius: 14px;
    display: grid; place-items: center;
    background: #0f766e; color: #fff; font-weight: 800; font-size: 1.25rem;
  }
  .sa-logo-sm { width: 40px; height: 40px; border-radius: 12px; font-size: 1.05rem; }
  .sa-kicker {
    margin: 0; text-transform: uppercase; letter-spacing: 0.08em;
    font-size: 0.72rem; color: #0f766e; font-weight: 700;
  }
  .sa-topbar {
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
    padding: 18px 24px; background: #fff; border-bottom: 1px solid #e2e8f0;
    position: sticky; top: 0; z-index: 10;
  }
  .sa-topbar h1 { margin: 2px 0 0; font-size: 1.35rem; }
  .sa-topbar-left { display: flex; gap: 12px; align-items: center; }
  .sa-topbar-actions { display: flex; gap: 8px; }
  .sa-main { max-width: 1180px; margin: 0 auto; padding: 24px 16px 56px; }
  .sa-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
  .sa-stat {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .sa-stat strong { font-size: 1.6rem; }
  .sa-stat span { color: #64748b; font-size: 0.88rem; }
  .sa-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
  .sa-tab {
    border: 1px solid #cbd5e1; background: #fff; border-radius: 999px;
    padding: 8px 14px; cursor: pointer; font-weight: 600; color: #334155;
  }
  .sa-tab.active { background: #0f766e; border-color: #0f766e; color: #fff; }
  .sa-panel {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;
  }
  .sa-panel h2 { margin: 0 0 6px; font-size: 1.15rem; }
  .sa-help { margin: 0 0 16px; color: #64748b; font-size: 0.92rem; }
  .sa-form { display: flex; flex-direction: column; gap: 12px; }
  .sa-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem; font-weight: 600; }
  .sa-form input, .sa-form select {
    border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px;
    font: inherit; font-weight: 400; background: #fff;
  }
  .sa-form input:focus, .sa-form select:focus {
    outline: 2px solid rgba(15, 118, 110, 0.25); border-color: #0f766e;
  }
  .sa-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .sa-label { margin: 4px 0 0; font-size: 0.88rem; font-weight: 600; }
  .sa-modules { display: flex; flex-wrap: wrap; gap: 8px; }
  .sa-chip {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px;
    font-size: 0.85rem; font-weight: 500; background: #f8fafc;
  }
  .sa-btn {
    border: 0; border-radius: 10px; padding: 10px 14px; font-weight: 700; cursor: pointer;
  }
  .sa-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .sa-btn-primary { background: #0f766e; color: #fff; width: fit-content; }
  .sa-btn-ghost { background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; }
  .sa-alert { border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; font-size: 0.92rem; }
  .sa-alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .sa-alert-ok { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .sa-banner {
    display: flex; justify-content: space-between; gap: 16px; align-items: flex-start;
    background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 14px; padding: 16px; margin-bottom: 14px;
  }
  .sa-banner h2 { margin: 0 0 6px; font-size: 1rem; }
  .sa-table-wrap { overflow-x: auto; margin-top: 12px; }
  .sa-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .sa-table th {
    text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em;
    color: #64748b; padding: 10px 8px; border-bottom: 1px solid #e2e8f0;
  }
  .sa-table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .sa-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; }
  .sa-muted { color: #64748b; font-size: 0.8rem; }
  .sa-pill { border-radius: 999px; padding: 2px 8px; font-size: 0.75rem; font-weight: 700; }
  .sa-pill.ok { background: #dcfce7; color: #166534; }
  .sa-pill.bad { background: #fee2e2; color: #991b1b; }
  .sa-row-actions { display: flex; flex-wrap: wrap; gap: 6px; }
  .sa-row-actions button {
    border: 1px solid #cbd5e1; background: #fff; border-radius: 8px;
    padding: 6px 8px; font-size: 0.75rem; cursor: pointer;
  }
  .sa-empty { color: #64748b; padding: 20px 8px !important; }
  @media (max-width: 800px) {
    .sa-grid { grid-template-columns: 1fr; }
    .sa-stats { grid-template-columns: 1fr; }
    .sa-topbar { flex-direction: column; align-items: flex-start; }
  }
`
