'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  clearCrmPlatformToken,
  getCrmPlatformToken,
  loginCrmPlatform,
  setCrmPlatformToken,
} from '@/libs/crmPlatformApi'
import { SUPER_ADMIN_CSS } from './constants'
import BrandLogo from './BrandLogo'

export default function SuperAdminLogin() {
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'

  const [email, setEmail] = useState('admin@woxox.local')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (getCrmPlatformToken()) {
      router.replace(`/${lang}/super-admin/companies`)
    }
  }, [lang, router])

  const onLogin = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await loginCrmPlatform(email, password)
      if (!data.user?.isPlatformStaff && data.user?.role !== 'SUPER_ADMIN') {
        clearCrmPlatformToken()
        throw new Error('This account is not platform staff')
      }
      setCrmPlatformToken(data.accessToken)
      try {
        window.localStorage.setItem(
          'crmPlatformStaff',
          JSON.stringify({
            role: data.user.role,
            permissions: data.user.permissions || [],
            email: data.user.email,
          })
        )
      } catch {
        /* ignore */
      }
      router.replace(`/${lang}/super-admin/companies`)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='sa-root sa-login-root'>
      <style>{SUPER_ADMIN_CSS}</style>
      <div className='sa-login-panel'>
        <div className='sa-brand'>
          <BrandLogo size='md' />
          <div>
            <p className='sa-kicker'>Control Center</p>
            <h1>Sign in</h1>
            <p className='sa-lead'>Manage companies, billing, and platform staff</p>
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
