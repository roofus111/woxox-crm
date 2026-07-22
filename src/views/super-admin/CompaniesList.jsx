'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  bulkUpdateSuperAdminTenants,
  listSuperAdminTenants,
} from '@/libs/crmPlatformApi'
import SuperAdminShell, { useRequireSuperAdmin } from './SuperAdminShell'
import { MODULE_OPTIONS } from './constants'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '—'
  }
}

export default function CompaniesList() {
  const ok = useRequireSuperAdmin()
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'

  const [tenants, setTenants] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, expired: 0, suspended: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState('')
  const [module, setModule] = useState('')
  const [selected, setSelected] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const data = await listSuperAdminTenants({
        q: q || undefined,
        status: status || undefined,
        plan: plan || undefined,
        module: module || undefined,
        page,
        pageSize,
      })
      setTenants(data.tenants || [])
      setTotal(data.total || 0)
      if (data.stats) setStats(data.stats)
      setSelected([])
    } catch (err) {
      setError(err.message || 'Failed to load companies')
    } finally {
      setBusy(false)
    }
  }, [q, status, plan, module, page, pageSize])

  useEffect(() => {
    if (ok) load()
  }, [ok, load])

  const toggleAll = () => {
    if (selected.length === tenants.length) setSelected([])
    else setSelected(tenants.map(t => t.id))
  }

  const toggleOne = id => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const bulk = async action => {
    if (!selected.length) return
    setBusy(true)
    setError('')
    try {
      const data = await bulkUpdateSuperAdminTenants(selected, action)
      setNotice(`Updated ${data.updated} companies`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ok) return null

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <SuperAdminShell title='Companies'>
      {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
      {notice ? <div className='sa-alert sa-alert-ok'>{notice}</div> : null}

      <section className='sa-stats'>
        <div className='sa-stat'>
          <strong>{stats.total}</strong>
          <span>Total</span>
        </div>
        <div className='sa-stat'>
          <strong>{stats.active}</strong>
          <span>Active</span>
        </div>
        <div className='sa-stat'>
          <strong>{stats.trial}</strong>
          <span>Trial</span>
        </div>
        <div className='sa-stat'>
          <strong>{stats.expired}</strong>
          <span>Expired</span>
        </div>
        <div className='sa-stat'>
          <strong>{stats.suspended}</strong>
          <span>Suspended</span>
        </div>
      </section>

      <section className='sa-panel'>
        <div className='sa-filters'>
          <label>
            Search
            <input
              value={q}
              onChange={e => {
                setPage(1)
                setQ(e.target.value)
              }}
              placeholder='Name, code, slug, admin email'
            />
          </label>
          <label>
            Status
            <select
              value={status}
              onChange={e => {
                setPage(1)
                setStatus(e.target.value)
              }}
            >
              <option value=''>All</option>
              <option value='active'>Active</option>
              <option value='trial'>Trial</option>
              <option value='expired'>Expired</option>
              <option value='suspended'>Suspended</option>
              <option value='deleted'>Deleted</option>
            </select>
          </label>
          <label>
            Plan
            <select
              value={plan}
              onChange={e => {
                setPage(1)
                setPlan(e.target.value)
              }}
            >
              <option value=''>All</option>
              <option value='trial'>Trial</option>
              <option value='starter'>Starter</option>
              <option value='professional'>Professional</option>
              <option value='enterprise'>Enterprise</option>
            </select>
          </label>
          <label>
            Module
            <select
              value={module}
              onChange={e => {
                setPage(1)
                setModule(e.target.value)
              }}
            >
              <option value=''>All</option>
              {MODULE_OPTIONS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <button type='button' className='sa-btn sa-btn-ghost' onClick={load} disabled={busy}>
            {busy ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {selected.length ? (
          <div className='sa-actions'>
            <button type='button' onClick={() => bulk('suspend')} disabled={busy}>
              Suspend selected ({selected.length})
            </button>
            <button type='button' onClick={() => bulk('activate')} disabled={busy}>
              Activate selected
            </button>
          </div>
        ) : null}

        <div className='sa-table-wrap'>
          <table className='sa-table'>
            <thead>
              <tr>
                <th>
                  <input
                    type='checkbox'
                    checked={tenants.length > 0 && selected.length === tenants.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Code</th>
                <th>Company</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Trial</th>
                <th>Users</th>
                <th>Health</th>
                <th>Last login</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr
                  key={t.id}
                  className='sa-clickable'
                  onClick={() => router.push(`/${lang}/super-admin/companies/${t.id}`)}
                >
                  <td onClick={e => e.stopPropagation()}>
                    <input
                      type='checkbox'
                      checked={selected.includes(t.id)}
                      onChange={() => toggleOne(t.id)}
                    />
                  </td>
                  <td className='sa-mono'>{t.tenantCode || '—'}</td>
                  <td>
                    <strong>{t.name}</strong>
                    <div className='sa-muted'>{t.slug}</div>
                  </td>
                  <td>{t.plan}</td>
                  <td>
                    <span className={`sa-pill ${t.displayStatus || t.status}`}>
                      {t.displayStatus || t.status}
                    </span>
                  </td>
                  <td className='sa-muted'>{formatDate(t.trialEndsAt)}</td>
                  <td>{t.counts?.users ?? '—'}</td>
                  <td>
                    <span className={`sa-pill ${t.health?.label || ''}`}>
                      {t.health ? `${t.health.score} · ${t.health.label}` : '—'}
                    </span>
                  </td>
                  <td className='sa-muted'>{formatDate(t.lastLoginAt)}</td>
                </tr>
              ))}
              {!tenants.length ? (
                <tr>
                  <td colSpan={9} className='sa-empty'>
                    No companies match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className='sa-pagination'>
          <span className='sa-muted'>
            {total} companies · page {page} of {totalPages}
          </span>
          <div className='sa-row-actions'>
            <button type='button' disabled={page <= 1 || busy} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <button
              type='button'
              disabled={page >= totalPages || busy}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </SuperAdminShell>
  )
}
