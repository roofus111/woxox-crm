'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  completeOnboarding,
  getCrmPlatformToken,
  getOnboardingStatus,
  loginCrmPlatform,
  updateOnboarding,
} from '@/libs/crmPlatformApi'
import { storeEnabledProducts } from '@/libs/tenantModules'
import BrandLogo from '@/views/super-admin/BrandLogo'
import { MODULE_OPTIONS, SUPER_ADMIN_CSS } from '@/views/super-admin/constants'

export default function OnboardingWizard() {
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('1-10')
  const [inviteEmail, setInviteEmail] = useState('')
  const [modules, setModules] = useState(['crm'])
  const [planModules, setPlanModules] = useState(['crm'])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!getCrmPlatformToken()) {
      setNeedsLogin(true)
      return
    }
    getOnboardingStatus()
      .then(data => {
        if (data.onboardingComplete) {
          router.replace(`/${lang}/dashboards/crm`)
          return
        }
        setCompanyName(data.workspace?.name || '')
        const paid = data.workspace?.planModules || data.workspace?.enabledModules || ['crm']
        setPlanModules(paid.includes('crm') ? paid : ['crm', ...paid])
        setModules(data.workspace?.enabledModules || ['crm'])
      })
      .catch(() => setNeedsLogin(true))
  }, [lang, router])

  const onGateLogin = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await loginCrmPlatform(email, password)
      setNeedsLogin(false)
      const data = await getOnboardingStatus()
      setCompanyName(data.workspace?.name || '')
      const paid = data.workspace?.planModules || data.workspace?.enabledModules || ['crm']
      setPlanModules(paid.includes('crm') ? paid : ['crm', ...paid])
      setModules(data.workspace?.enabledModules || ['crm'])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveStep = async () => {
    setBusy(true)
    setError('')
    try {
      if (step === 0) {
        await updateOnboarding({
          companyName,
          industry,
          teamSize,
          step: 'invite',
        })
        setStep(1)
      } else if (step === 1) {
        await updateOnboarding({
          inviteEmail: inviteEmail || undefined,
          step: 'modules',
        })
        setStep(2)
      } else {
        await updateOnboarding({ modules, step: 'done' })
        await completeOnboarding()
        storeEnabledProducts(modules)
        setNotice('Onboarding complete')
        router.replace(`/${lang}/dashboards/crm`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleModule = id => {
    if (id === 'crm') return
    if (!planModules.includes(id)) return
    setModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  return (
    <div className='sa-root sa-login-root'>
      <style>{SUPER_ADMIN_CSS}</style>
      <div className='sa-login-panel' style={{ width: 'min(520px, 100%)' }}>
        <div className='sa-brand'>
          <BrandLogo size='md' />
          <div>
            <p className='sa-kicker'>Onboarding</p>
            <h1>Set up your workspace</h1>
            <p className='sa-lead'>3 quick steps — about 2 minutes</p>
          </div>
        </div>

        {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
        {notice ? <div className='sa-alert sa-alert-ok'>{notice}</div> : null}

        {needsLogin ? (
          <form className='sa-form' onSubmit={onGateLogin}>
            <p className='sa-help'>Sign in with your company admin account to continue.</p>
            <label>
              Email
              <input type='email' value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
            <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
              Continue
            </button>
          </form>
        ) : (
          <div className='sa-form'>
            <div className='sa-tabs'>
              <span className={step === 0 ? 'sa-tab active' : 'sa-tab'}>1. Profile</span>
              <span className={step === 1 ? 'sa-tab active' : 'sa-tab'}>2. Invite</span>
              <span className={step === 2 ? 'sa-tab active' : 'sa-tab'}>3. Modules</span>
            </div>

            {step === 0 ? (
              <>
                <label>
                  Company name
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                </label>
                <label>
                  Industry
                  <input
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder='Manufacturing, SaaS, Retail…'
                  />
                </label>
                <label>
                  Team size
                  <select value={teamSize} onChange={e => setTeamSize(e.target.value)}>
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-200</option>
                    <option>200+</option>
                  </select>
                </label>
              </>
            ) : null}

            {step === 1 ? (
              <label>
                Invite a teammate (optional)
                <input
                  type='email'
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder='colleague@company.com'
                />
              </label>
            ) : null}

            {step === 2 ? (
              <>
                <p className='sa-label'>Enable modules included in your plan</p>
                <div className='sa-modules'>
                  {MODULE_OPTIONS.map(mod => {
                    const included = planModules.includes(mod.id)
                    const locked = mod.id === 'crm'
                    return (
                      <label
                        key={mod.id}
                        className='sa-chip'
                        style={{ opacity: included ? 1 : 0.45, cursor: included && !locked ? 'pointer' : 'not-allowed' }}
                      >
                        <input
                          type='checkbox'
                          checked={modules.includes(mod.id)}
                          disabled={locked || !included}
                          onChange={() => toggleModule(mod.id)}
                        />
                        {mod.label}
                        {!included ? ' (not in plan)' : ''}
                      </label>
                    )
                  })}
                </div>
              </>
            ) : null}

            <div className='sa-row-actions'>
              {step > 0 ? (
                <button type='button' className='sa-btn sa-btn-ghost' onClick={() => setStep(s => s - 1)}>
                  Back
                </button>
              ) : null}
              <button type='button' className='sa-btn sa-btn-primary' disabled={busy} onClick={saveStep}>
                {step === 2 ? (busy ? 'Finishing…' : 'Finish') : busy ? 'Saving…' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
