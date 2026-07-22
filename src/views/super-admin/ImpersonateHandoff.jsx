'use client'

import { Suspense, useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

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
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b1220',
        color: '#fff',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        padding: 24,
      }}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          background: '#fff',
          color: '#0f172a',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        <p style={{ margin: 0, color: '#0f766e', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em' }}>
          WOXOX CONTROL CENTER
        </p>
        <h1 style={{ margin: '8px 0 12px', fontSize: 22 }}>Secure company login</h1>
        {error ? (
          <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
        ) : (
          <p style={{ color: '#64748b', margin: 0 }}>{status}</p>
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
