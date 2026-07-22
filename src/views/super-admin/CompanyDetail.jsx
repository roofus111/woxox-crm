'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  changeSuperAdminOwner,
  extendSuperAdminTrial,
  getSuperAdminTenant,
  impersonateSuperAdminTenant,
  listSuperAdminTenantAudit,
  resetSuperAdminTenantPassword,
  restoreSuperAdminTenant,
  setImpersonationState,
  softDeleteSuperAdminTenant,
  updateSuperAdminTenant,
} from '@/libs/crmPlatformApi'
import SuperAdminShell, { useRequireSuperAdmin } from './SuperAdminShell'
import { MODULE_OPTIONS } from './constants'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '—'
  }
}

export default function CompanyDetail() {
  const ok = useRequireSuperAdmin()
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'
  const id = params?.id

  const [tenant, setTenant] = useState(null)
  const [audits, setAudits] = useState([])
  const [modules, setModules] = useState([])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setBusy(true)
    setError('')
    try {
      const data = await getSuperAdminTenant(id)
      setTenant(data.tenant)
      setModules(data.tenant?.enabledModules || [])
      setNote(data.tenant?.accountManagerNote || '')
      const auditData = await listSuperAdminTenantAudit(id, { page: 1, pageSize: 50 })
      setAudits(auditData.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load company')
    } finally {
      setBusy(false)
    }
  }, [id])

  useEffect(() => {
    if (ok) load()
  }, [ok, load])

  const run = async (fn, successMsg) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await fn()
      setNotice(successMsg)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleModule = modId => {
    setModules(prev =>
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    )
  }

  const saveModules = () =>
    run(() => updateSuperAdminTenant(id, { enabledModules: modules }), 'Modules updated')

  const saveNote = () =>
    run(() => updateSuperAdminTenant(id, { accountManagerNote: note }), 'Note saved')

  const suspend = () => run(() => updateSuperAdminTenant(id, { status: 'suspended' }), 'Suspended')
  const activate = () => run(() => updateSuperAdminTenant(id, { status: 'active' }), 'Activated')

  const extendTrial = () => {
    const days = Number(window.prompt('Extend trial by how many days?', '14'))
    if (!days || days < 1) return
    run(() => extendSuperAdminTrial(id, days), `Trial extended by ${days} days`)
  }

  const resetPassword = () => {
    const adminEmail = tenant?.admins?.[0]?.email || tenant?.owner?.email || 'admin'
    const next = window.prompt(`New temporary password for ${adminEmail}`)
    if (!next || next.length < 6) return
    run(() => resetSuperAdminTenantPassword(id, next), `Password updated for ${adminEmail}`)
  }

  const changeOwner = () => {
    const email = window.prompt('New owner email (must already be a member)')
    if (!email) return
    run(() => changeSuperAdminOwner(id, { email }), 'Owner updated')
  }

  const softDelete = () => {
    if (!window.confirm('Soft-delete this company? It can be restored later.')) return
    run(() => softDeleteSuperAdminTenant(id), 'Company soft-deleted')
  }

  const restore = () => run(() => restoreSuperAdminTenant(id), 'Company restored')

  const impersonate = async () => {
    if (
      !window.confirm(
        'You will act as this company admin for 15 minutes. All actions are audited. Continue?'
      )
    ) {
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await impersonateSuperAdminTenant(id)
      setImpersonationState({
        sessionId: data.sessionId,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
        targetEmail: data.targetUser?.email,
        tenantName: data.tenant?.name,
        tenantId: id,
      })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sa-impersonation'))
      }
      setNotice(
        `Impersonation started for ${data.targetUser?.email}. Token stored (platform session). Use Stop in the red banner.`
      )
      // Keep Super Admin token for control-plane actions; impersonation token is stored separately
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ok) return null

  return (
    <SuperAdminShell title={tenant?.name || 'Company profile'}>
      {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
      {notice ? <div className='sa-alert sa-alert-ok'>{notice}</div> : null}

      {!tenant && busy ? <p className='sa-muted'>Loading company…</p> : null}

      {tenant ? (
        <>
          <section className='sa-panel'>
            <div className='sa-header-row'>
              <div>
                <p className='sa-kicker'>{tenant.tenantCode}</p>
                <h2 style={{ margin: '4px 0' }}>{tenant.name}</h2>
                <p className='sa-muted'>{tenant.slug}</p>
                <div className='sa-row-actions' style={{ marginTop: 8 }}>
                  <span className={`sa-pill ${tenant.displayStatus}`}>{tenant.displayStatus}</span>
                  <span className={`sa-pill ${tenant.health?.label}`}>
                    Health {tenant.health?.score} · {tenant.health?.label}
                  </span>
                </div>
              </div>
              <a className='sa-btn sa-btn-ghost' href={`/${lang}/super-admin/companies`}>
                ← Back to list
              </a>
            </div>

            <div className='sa-actions'>
              {tenant.displayStatus === 'suspended' || tenant.status === 'suspended' ? (
                <button type='button' onClick={activate} disabled={busy}>
                  Activate
                </button>
              ) : (
                <button type='button' onClick={suspend} disabled={busy}>
                  Suspend
                </button>
              )}
              <button type='button' onClick={extendTrial} disabled={busy || Boolean(tenant.deletedAt)}>
                Extend trial
              </button>
              <button type='button' onClick={resetPassword} disabled={busy || Boolean(tenant.deletedAt)}>
                Reset password
              </button>
              <button type='button' onClick={changeOwner} disabled={busy || Boolean(tenant.deletedAt)}>
                Change owner
              </button>
              <button type='button' onClick={impersonate} disabled={busy || Boolean(tenant.deletedAt)}>
                Impersonate
              </button>
              {tenant.deletedAt ? (
                <button type='button' onClick={restore} disabled={busy}>
                  Restore
                </button>
              ) : (
                <button type='button' className='sa-btn-danger' onClick={softDelete} disabled={busy}>
                  Soft delete
                </button>
              )}
            </div>
          </section>

          <div className='sa-cards'>
            <div className='sa-card'>
              <h3>Subscription</h3>
              <dl className='sa-dl'>
                <div>
                  <dt>Plan</dt>
                  <dd>{tenant.plan}</dd>
                </div>
                <div>
                  <dt>Trial ends</dt>
                  <dd>{formatDate(tenant.trialEndsAt)}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(tenant.createdAt)}</dd>
                </div>
                <div>
                  <dt>Login URL</dt>
                  <dd className='sa-mono'>{tenant.loginUrl}</dd>
                </div>
              </dl>
            </div>

            <div className='sa-card'>
              <h3>Usage</h3>
              <dl className='sa-dl'>
                <div>
                  <dt>Users</dt>
                  <dd>{tenant.counts?.users ?? 0}</dd>
                </div>
                <div>
                  <dt>Leads</dt>
                  <dd>{tenant.counts?.leads ?? 0}</dd>
                </div>
                <div>
                  <dt>Contacts</dt>
                  <dd>{tenant.counts?.contacts ?? 0}</dd>
                </div>
                <div>
                  <dt>Deals</dt>
                  <dd>{tenant.counts?.deals ?? 0}</dd>
                </div>
                <div>
                  <dt>Activity (30d)</dt>
                  <dd>{tenant.counts?.recentActivity ?? 0}</dd>
                </div>
                <div>
                  <dt>Last login</dt>
                  <dd>{formatDate(tenant.lastLoginAt)}</dd>
                </div>
              </dl>
            </div>

            <div className='sa-card'>
              <h3>Owner & admins</h3>
              <p className='sa-muted' style={{ marginTop: 0 }}>
                Owner: {tenant.owner?.email || '—'}
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {(tenant.members || [])
                  .filter(m => m.role === 'ADMIN' || m.role === 'SUPER_ADMIN')
                  .map(m => (
                    <li key={m.membershipId}>
                      {m.user.email} <span className='sa-muted'>({m.role})</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className='sa-card'>
              <h3>CS note</h3>
              <textarea value={note} onChange={e => setNote(e.target.value)} />
              <button
                type='button'
                className='sa-btn sa-btn-ghost'
                style={{ marginTop: 10 }}
                onClick={saveNote}
                disabled={busy}
              >
                Save note
              </button>
            </div>
          </div>

          <section className='sa-panel' style={{ marginTop: 14 }}>
            <h2>Modules</h2>
            <div className='sa-modules'>
              {MODULE_OPTIONS.map(mod => (
                <label key={mod.id} className='sa-chip'>
                  <input
                    type='checkbox'
                    checked={modules.includes(mod.id)}
                    onChange={() => toggleModule(mod.id)}
                  />
                  {mod.label}
                </label>
              ))}
            </div>
            <button
              type='button'
              className='sa-btn sa-btn-primary'
              style={{ marginTop: 12 }}
              onClick={saveModules}
              disabled={busy}
            >
              Save modules
            </button>
          </section>

          <section className='sa-panel' style={{ marginTop: 14 }}>
            <h2>Audit timeline</h2>
            <ul className='sa-audit'>
              {audits.map(a => (
                <li key={a.id}>
                  <strong>{a.action}</strong>
                  <div className='sa-muted'>
                    {a.actorEmail || 'system'} · {formatDate(a.createdAt)}
                  </div>
                </li>
              ))}
              {!audits.length ? <li className='sa-muted'>No audit events yet.</li> : null}
            </ul>
          </section>
        </>
      ) : null}
    </SuperAdminShell>
  )
}
