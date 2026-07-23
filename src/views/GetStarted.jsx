'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  listPublicPlans,
  publicSignup,
  publicVerifyPayment,
} from '@/libs/crmPlatformApi'
import BrandLogo from '@/views/super-admin/BrandLogo'
import { SUPER_ADMIN_CSS } from '@/views/super-admin/constants'

function formatMoney(amount, currency = 'INR') {
  const value = (Number(amount) || 0) / 100
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value}`
  }
}

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.Razorpay) return resolve(window.Razorpay)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

export default function GetStartedPage() {
  const params = useParams()
  const lang = params?.lang || 'en'

  const [plans, setPlans] = useState([])
  const [cycle, setCycle] = useState('monthly')
  const [selected, setSelected] = useState('starter')
  const [form, setForm] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  useEffect(() => {
    listPublicPlans()
      .then(data => {
        setPlans(data.plans || [])
        if (data.plans?.length) {
          const firstPaid = data.plans.find(p => p.code !== 'trial') || data.plans[0]
          setSelected(firstPaid.code)
        }
      })
      .catch(err => setError(err.message))
  }, [])

  const selectedPlan = useMemo(
    () => plans.find(p => p.code === selected) || null,
    [plans, selected]
  )

  const onSubmit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await publicSignup({
        ...form,
        plan: selected,
        billingCycle: cycle,
      })

      if (!data.paymentRequired) {
        setDone({
          loginUrl: data.loginUrl,
          onboardingUrl: data.onboardingUrl,
          tenantCode: data.tenantCode,
          welcomeEmailSent: data.welcomeEmailSent,
        })
        return
      }

      const Razorpay = await loadRazorpay()
      const rzp = new Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'WOXOX',
        description: `${data.plan?.name || selected} plan`,
        order_id: data.order.id,
        prefill: {
          name: data.customer?.name || form.adminName,
          email: data.customer?.email || form.adminEmail,
        },
        handler: async response => {
          try {
            const verified = await publicVerifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              workspaceId: data.workspaceId,
            })
            setDone({
              loginUrl: verified.loginUrl,
              onboardingUrl: verified.onboardingUrl,
              tenantCode: data.tenantCode,
              welcomeEmailSent: verified.welcomeEmailSent,
            })
          } catch (err) {
            setError(err.message || 'Payment verification failed')
          }
        },
      })
      rzp.open()
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='sa-root'>
      <style>{SUPER_ADMIN_CSS}</style>
      <header className='sa-topbar'>
        <div className='sa-topbar-left'>
          <BrandLogo size='sm' />
          <div>
            <p className='sa-kicker'>Get started</p>
            <h1>Choose your WOXOX plan</h1>
          </div>
        </div>
        <a className='sa-btn sa-btn-ghost' href={`/${lang}/login`}>
          Sign in
        </a>
      </header>

      <main className='sa-main'>
        {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}

        {done ? (
          <section className='sa-panel sa-banner'>
            <div>
              <h2>You&apos;re ready</h2>
              <p>
                Workspace <strong>{done.tenantCode}</strong> is set up.
                {done.welcomeEmailSent
                  ? ' Check your email for login and onboarding links, then continue below.'
                  : ' Sign in below to continue onboarding (welcome email was not sent — check SMTP settings).'}
              </p>
            </div>
            <div className='sa-row-actions'>
              <a className='sa-btn sa-btn-primary' href={done.onboardingUrl || done.loginUrl}>
                Continue to onboarding
              </a>
              <a className='sa-btn sa-btn-ghost' href={done.loginUrl}>
                Sign in
              </a>
            </div>
          </section>
        ) : (
          <>
            <div className='sa-tabs' style={{ marginBottom: 18 }}>
              <button
                type='button'
                className={cycle === 'monthly' ? 'sa-tab active' : 'sa-tab'}
                onClick={() => setCycle('monthly')}
              >
                Monthly
              </button>
              <button
                type='button'
                className={cycle === 'yearly' ? 'sa-tab active' : 'sa-tab'}
                onClick={() => setCycle('yearly')}
              >
                Yearly
              </button>
            </div>

            <div className='sa-pricing-grid'>
              {plans.map(p => {
                const price = cycle === 'yearly' ? p.amountYearly : p.amountMonthly
                const active = selected === p.code
                return (
                  <button
                    key={p.code}
                    type='button'
                    className={active ? 'sa-price-card active' : 'sa-price-card'}
                    onClick={() => setSelected(p.code)}
                  >
                    <strong>{p.name}</strong>
                    <span className='sa-price'>
                      {p.code === 'trial' ? 'Free' : formatMoney(price, p.currency)}
                      {p.code !== 'trial' ? (
                        <small>/{cycle === 'yearly' ? 'yr' : 'mo'}</small>
                      ) : null}
                    </span>
                    <p className='sa-muted'>{p.description || (p.enabledModules || []).join(', ')}</p>
                  </button>
                )
              })}
            </div>

            <section className='sa-panel' style={{ marginTop: 18 }}>
              <h2>Create your company</h2>
              <p className='sa-help'>
                {selectedPlan
                  ? `Selected: ${selectedPlan.name}`
                  : 'Select a plan above'}
              </p>
              <form className='sa-form' onSubmit={onSubmit}>
                <div className='sa-grid'>
                  <label>
                    Company name
                    <input
                      value={form.companyName}
                      onChange={e => setForm({ ...form, companyName: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Your name
                    <input
                      value={form.adminName}
                      onChange={e => setForm({ ...form, adminName: e.target.value })}
                    />
                  </label>
                  <label>
                    Work email
                    <input
                      type='email'
                      value={form.adminEmail}
                      onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type='password'
                      value={form.adminPassword}
                      onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </label>
                </div>
                <button type='submit' className='sa-btn sa-btn-primary' disabled={busy || !selected}>
                  {busy
                    ? 'Working…'
                    : selected === 'trial'
                      ? 'Start free trial'
                      : 'Continue to payment'}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
