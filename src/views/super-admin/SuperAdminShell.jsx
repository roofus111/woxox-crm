'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  clearCrmPlatformToken,
  clearImpersonationState,
  getCrmPlatformToken,
  getImpersonationState,
  stopSuperAdminImpersonation,
} from '@/libs/crmPlatformApi'
import { SUPER_ADMIN_CSS } from './constants'
import ImpersonationBanner from './ImpersonationBanner'

export default function SuperAdminShell({ children, title = 'Companies' }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const lang = params?.lang || 'en'
  const base = `/${lang}/super-admin`

  const [token, setToken] = useState(null)
  const [impersonation, setImpersonation] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setToken(getCrmPlatformToken())
    setImpersonation(getImpersonationState())
    setReady(true)

    const sync = () => setImpersonation(getImpersonationState())
    window.addEventListener('sa-impersonation', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('sa-impersonation', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const logout = useCallback(() => {
    clearCrmPlatformToken()
    clearImpersonationState()
    setToken(null)
    setImpersonation(null)
    router.replace(`${base}`)
  }, [base, router])

  const stopImpersonation = useCallback(async () => {
    const state = getImpersonationState()
    try {
      if (state?.sessionId) {
        // Prefer original SA token for stop
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
          <a
            href={`${base}/companies`}
            className={isCompanies && !isCreate ? 'sa-tab active' : 'sa-tab'}
          >
            All companies
          </a>
          <a href={`${base}/companies/create`} className={isCreate ? 'sa-tab active' : 'sa-tab'}>
            Create company
          </a>
          <a
            href={`${base}/billing`}
            className={pathname?.includes('/billing') ? 'sa-tab active' : 'sa-tab'}
          >
            Billing
          </a>
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
