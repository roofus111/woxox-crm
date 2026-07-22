'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  clearCrmPlatformToken,
  clearImpersonationState,
  getCrmPlatformToken,
  getImpersonationState,
  getSuperAdminMe,
  stopSuperAdminImpersonation,
} from '@/libs/crmPlatformApi'
import { SUPER_ADMIN_CSS } from './constants'
import ImpersonationBanner from './ImpersonationBanner'

function readStaffCache() {
  try {
    const raw = window.localStorage.getItem('crmPlatformStaff')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function SuperAdminShell({ children, title = 'Companies' }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const lang = params?.lang || 'en'
  const base = `/${lang}/super-admin`

  const [token, setToken] = useState(null)
  const [impersonation, setImpersonation] = useState(null)
  const [staff, setStaff] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setToken(getCrmPlatformToken())
    setImpersonation(getImpersonationState())
    setStaff(readStaffCache())
    setReady(true)

    const sync = () => setImpersonation(getImpersonationState())
    window.addEventListener('sa-impersonation', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('sa-impersonation', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    getSuperAdminMe()
      .then(data => {
        const next = {
          role: data.user?.role,
          roleLabel: data.user?.roleLabel,
          permissions: data.user?.permissions || [],
          email: data.user?.email,
        }
        setStaff(next)
        try {
          window.localStorage.setItem('crmPlatformStaff', JSON.stringify(next))
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* keep cache */
      })
  }, [token])

  const can = perm => Boolean(staff?.permissions?.includes(perm))

  const logout = useCallback(() => {
    clearCrmPlatformToken()
    clearImpersonationState()
    try {
      window.localStorage.removeItem('crmPlatformStaff')
    } catch {
      /* ignore */
    }
    setToken(null)
    setImpersonation(null)
    setStaff(null)
    router.replace(`${base}`)
  }, [base, router])

  const stopImpersonation = useCallback(async () => {
    const state = getImpersonationState()
    try {
      if (state?.sessionId) {
        await stopSuperAdminImpersonation(state.sessionId)
      }
    } catch {
      /* still clear local state */
    }
    clearImpersonationState()
    setImpersonation(null)
    router.replace(`${base}/companies`)
  }, [base, router])

  if (!ready) {
    return (
      <div className='sa-root'>
        <style>{SUPER_ADMIN_CSS}</style>
        <div className='sa-main'>Loading…</div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  const isCompanies = pathname?.includes('/companies') && !pathname?.match(/\/companies\/[^/]+/)
  const isCreate = pathname?.endsWith('/create')
  const isDetail = pathname?.match(/\/companies\/[^/]+/) && !isCreate

  return (
    <div className='sa-root'>
      <style>{SUPER_ADMIN_CSS}</style>
      {impersonation ? (
        <ImpersonationBanner state={impersonation} onStop={stopImpersonation} />
      ) : null}

      <header className='sa-topbar'>
        <div className='sa-topbar-left'>
          <span className='sa-logo sa-logo-sm'>W</span>
          <div>
            <p className='sa-kicker'>WOXOX Control Center</p>
            <h1>{title}</h1>
            {staff?.roleLabel ? (
              <p className='sa-muted' style={{ margin: 0 }}>
                {staff.roleLabel}
                {staff.email ? ` · ${staff.email}` : ''}
              </p>
            ) : null}
          </div>
        </div>
        <div className='sa-topbar-actions'>
          <button type='button' className='sa-btn sa-btn-ghost' onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className='sa-main'>
        <nav className='sa-tabs'>
          {can('tenants:read') ? (
            <a
              href={`${base}/companies`}
              className={isCompanies && !isCreate ? 'sa-tab active' : 'sa-tab'}
            >
              All companies
            </a>
          ) : null}
          {can('tenants:write') ? (
            <a href={`${base}/companies/create`} className={isCreate ? 'sa-tab active' : 'sa-tab'}>
              Create company
            </a>
          ) : null}
          {can('billing:read') ? (
            <a
              href={`${base}/billing`}
              className={pathname?.includes('/billing') ? 'sa-tab active' : 'sa-tab'}
            >
              Billing
            </a>
          ) : null}
          {can('staff:manage') ? (
            <a
              href={`${base}/staff`}
              className={pathname?.includes('/staff') ? 'sa-tab active' : 'sa-tab'}
            >
              Staff
            </a>
          ) : null}
          {isDetail ? <span className='sa-tab active'>Company profile</span> : null}
        </nav>
        {children}
      </main>
    </div>
  )
}

export function useRequireSuperAdmin() {
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = getCrmPlatformToken()
    if (!token) {
      router.replace(`/${lang}/super-admin`)
      return
    }
    setOk(true)
  }, [lang, router])

  return ok
}
