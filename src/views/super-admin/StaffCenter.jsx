'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  createPlatformStaff,
  listPlatformStaff,
  updatePlatformStaff,
} from '@/libs/crmPlatformApi'
import SuperAdminShell, { useRequireSuperAdmin } from './SuperAdminShell'

const emptyForm = {
  email: '',
  password: '',
  name: '',
  role: 'PLATFORM_SUPPORT',
}

export default function StaffCenter() {
  const ok = useRequireSuperAdmin()
  const [staff, setStaff] = useState([])
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const data = await listPlatformStaff()
      setStaff(data.staff || [])
      setRoles(data.roles || [])
    } catch (err) {
      setError(err.message || 'Failed to load staff')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (ok) load()
  }, [ok, load])

  const onCreate = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createPlatformStaff(form)
      setNotice(`Created ${form.email}`)
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const setRole = async (membershipId, role) => {
    setBusy(true)
    setError('')
    try {
      await updatePlatformStaff(membershipId, { role })
      setNotice('Role updated')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (membershipId, isActive) => {
    setBusy(true)
    setError('')
    try {
      await updatePlatformStaff(membershipId, { isActive: !isActive })
      setNotice(isActive ? 'Staff deactivated' : 'Staff activated')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ok) return null

  return (
    <SuperAdminShell title='Platform staff'>
      {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
      {notice ? <div className='sa-alert sa-alert-ok'>{notice}</div> : null}

      <div className='sa-cards'>
        <section className='sa-panel'>
          <h2>Team</h2>
          <p className='sa-help'>WOXOX employees with Control Center access (RBAC).</p>
          <div className='sa-table-wrap'>
            <table className='sa-table'>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Last login</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.membershipId}>
                    <td>
                      <strong>{s.user?.email}</strong>
                      <div className='sa-muted'>{s.user?.name}</div>
                    </td>
                    <td>
                      <select
                        value={s.role}
                        disabled={busy}
                        onChange={e => setRole(s.membershipId, e.target.value)}
                      >
                        {roles.map(r => (
                          <option key={r.code} value={r.code}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`sa-pill ${s.isActive ? 'ok' : 'bad'}`}>
                        {s.isActive ? 'active' : 'off'}
                      </span>
                    </td>
                    <td className='sa-muted'>
                      {s.user?.lastLoginAt
                        ? new Date(s.user.lastLoginAt).toLocaleString()
                        : '—'}
                    </td>
                    <td>
                      <button type='button' onClick={() => toggleActive(s.membershipId, s.isActive)}>
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!staff.length ? (
                  <tr>
                    <td colSpan={5} className='sa-empty'>
                      No staff yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className='sa-panel'>
          <h2>Add staff</h2>
          <form className='sa-form' onSubmit={onCreate}>
            <label>
              Name
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type='email'
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Temporary password
              <input
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </label>
            <label>
              Role
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                {roles.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
              Create staff user
            </button>
          </form>

          <h3 style={{ marginTop: 24 }}>Permission matrix</h3>
          <div className='sa-table-wrap'>
            <table className='sa-table'>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(r => (
                  <tr key={r.code}>
                    <td>{r.label}</td>
                    <td className='sa-muted'>{(r.permissions || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SuperAdminShell>
  )
}
