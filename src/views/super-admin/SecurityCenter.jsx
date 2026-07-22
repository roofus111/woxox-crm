'use client'

import { useEffect, useState } from 'react'
import {
  disableCrmPlatformMfa,
  enableCrmPlatformMfa,
  getSuperAdminMe,
  setupCrmPlatformMfa,
} from '@/libs/crmPlatformApi'
import SuperAdminShell, { useRequireSuperAdmin } from './SuperAdminShell'

export default function SecurityCenter() {
  const ok = useRequireSuperAdmin()
  const [enabled, setEnabled] = useState(false)
  const [setup, setSetup] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!ok) return
    getSuperAdminMe()
      .then(data => setEnabled(Boolean(data.user?.twoFactorEnabled)))
      .catch(err => setError(err.message))
  }, [ok])

  const startSetup = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await setupCrmPlatformMfa()
      setSetup(data)
      setCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const confirmEnable = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await enableCrmPlatformMfa(code)
      setEnabled(true)
      setSetup(null)
      setCode('')
      setNotice('Authenticator enabled — required on next login')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onDisable = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await disableCrmPlatformMfa(code)
      setEnabled(false)
      setSetup(null)
      setCode('')
      setNotice('Authenticator disabled')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ok) return null

  return (
    <SuperAdminShell title='Security'>
      {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
      {notice ? <div className='sa-alert sa-alert-ok'>{notice}</div> : null}

      <section className='sa-panel sa-security-panel'>
        <h2>Authenticator (TOTP)</h2>
        <p className='sa-help'>
          Protect Control Center access with Google Authenticator, Authy, or 1Password. Recommended for
          all platform staff.
        </p>

        <div className='sa-status-row'>
          <span className={`sa-pill ${enabled ? 'ok' : 'trial'}`}>
            {enabled ? 'enabled' : 'not enabled'}
          </span>
        </div>

        {!enabled && !setup ? (
          <button type='button' className='sa-btn sa-btn-primary' disabled={busy} onClick={startSetup}>
            {busy ? 'Preparing…' : 'Set up authenticator'}
          </button>
        ) : null}

        {setup ? (
          <div className='sa-mfa-setup'>
            <div className='sa-mfa-qr'>
              {setup.qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={setup.qrUrl} alt='Scan QR with authenticator app' width={200} height={200} />
              ) : null}
              <p className='sa-muted'>
                Can&apos;t scan? Enter secret manually:{' '}
                <code className='sa-mono'>{setup.secret}</code>
              </p>
            </div>
            <form className='sa-form' onSubmit={confirmEnable}>
              <label>
                Enter 6-digit code to confirm
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode='numeric'
                  autoComplete='one-time-code'
                  required
                  placeholder='123456'
                />
              </label>
              <div className='sa-row-actions'>
                <button
                  type='submit'
                  className='sa-btn sa-btn-primary'
                  disabled={busy || code.length !== 6}
                >
                  Enable MFA
                </button>
                <button
                  type='button'
                  className='sa-btn sa-btn-ghost'
                  onClick={() => {
                    setSetup(null)
                    setCode('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {enabled ? (
          <form className='sa-form' onSubmit={onDisable} style={{ marginTop: 16, maxWidth: 360 }}>
            <label>
              Code to disable MFA
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode='numeric'
                required
                placeholder='123456'
              />
            </label>
            <button
              type='submit'
              className='sa-btn sa-btn-danger'
              disabled={busy || code.length !== 6}
            >
              Disable authenticator
            </button>
          </form>
        ) : null}
      </section>
    </SuperAdminShell>
  )
}
