'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSuperAdminTenant } from '@/libs/crmPlatformApi'
import SuperAdminShell, { useRequireSuperAdmin } from './SuperAdminShell'
import { MODULE_OPTIONS, emptyCreateForm } from './constants'

export default function CreateCompany() {
  const ok = useRequireSuperAdmin()
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'

  const [form, setForm] = useState(emptyCreateForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)

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

  const onCreate = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setCreated(null)
    try {
      const data = await createSuperAdminTenant({
        ...form,
        trialDays: Number(form.trialDays) || 0,
      })
      setCreated(data.tenant)
      setForm(emptyCreateForm)
    } catch (err) {
      setError(err.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  if (!ok) return null

  return (
    <SuperAdminShell title='Create company'>
      {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}

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
          <div className='sa-row-actions'>
            <button
              type='button'
              className='sa-btn sa-btn-primary'
              onClick={() => router.push(`/${lang}/super-admin/companies/${created.id}`)}
            >
              Open profile
            </button>
            <button type='button' className='sa-btn sa-btn-ghost' onClick={() => setCreated(null)}>
              Dismiss
            </button>
          </div>
        </section>
      ) : null}

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
    </SuperAdminShell>
  )
}
