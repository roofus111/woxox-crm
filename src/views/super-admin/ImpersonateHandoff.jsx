'use client'

import { Suspense, useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import BrandLogo from './BrandLogo'
import { SUPER_ADMIN_CSS } from './constants'

function ImpersonateInner() {
  const router = useRouter()
  const params = useParams()
  const search = useSearchParams()
  const lang = params?.lang || 'en'
  const token = search.get('token')

  const [error, setError] = useState('')
  const [status, setStatus] = useState('Opening customer CRM…')

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!token) {
        setError('Missing handoff token')
        return
      }
      try {
        const res = await signIn('credentials', {
          handoffToken: token,
          redirect: false,
        })
        if (cancelled) return
        if (res?.ok && !res.error) {
          setStatus('Signed in. Redirecting…')
          router.replace(`/${lang}/dashboards/crm`)
          return
        }
        setError(res?.error || 'Impersonation failed')
      } catch (err) {
        if (!cancelled) setError(err.message || 'Impersonation failed')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [token, lang, router])

  return (
    <div className='sa-root sa-login-root'>
      <style>{SUPER_ADMIN_CSS}</style>
      <div className='sa-login-panel'>
        <div className='sa-brand' style={{ marginBottom: 16 }}>
          <BrandLogo size='md' />
          <div>
            <p className='sa-kicker'>Control Center</p>
            <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Secure company login</h1>
          </div>
        </div>
        {error ? (
          <p className='sa-alert sa-alert-error' style={{ marginBottom: 0 }}>
            {error}
          </p>
        ) : (
          <p className='sa-lead' style={{ margin: 0 }}>
            {status}
          </p>
        )}
        {error ? (
          <a
            href={`/${lang}/super-admin/companies`}
            style={{ display: 'inline-block', marginTop: 16, color: '#0f766e', fontWeight: 700 }}
          >
            Back to Super Admin
          </a>
        ) : null}
      </div>
    </div>
  )
}

export default function ImpersonateHandoffPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ImpersonateInner />
    </Suspense>
  )
}
