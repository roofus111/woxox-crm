'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  assignBillingSubscription,
  createRazorpayPaymentLink,
  getBillingRevenue,
  listBillingCoupons,
  listBillingInvoices,
  listBillingPlans,
  listBillingSubscriptions,
  upsertBillingCoupon,
  upsertBillingPlan,
} from '@/libs/crmPlatformApi'
import SuperAdminShell, { useRequireSuperAdmin } from './SuperAdminShell'

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

const emptyPlan = {
  code: '',
  name: '',
  description: '',
  currency: 'INR',
  amountMonthly: 0,
  amountYearly: 0,
  enabledModules: ['crm'],
  trialDays: 14,
  sortOrder: 0,
  isActive: true,
}

const emptyCoupon = {
  code: '',
  name: '',
  percentOff: 10,
  amountOff: '',
  currency: 'INR',
  maxRedemptions: '',
  isActive: true,
}

export default function BillingCenter() {
  const ok = useRequireSuperAdmin()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [plans, setPlans] = useState([])
  const [subs, setSubs] = useState([])
  const [coupons, setCoupons] = useState([])
  const [invoices, setInvoices] = useState([])
  const [planForm, setPlanForm] = useState(emptyPlan)
  const [couponForm, setCouponForm] = useState(emptyCoupon)
  const [assign, setAssign] = useState({ workspaceId: '', plan: 'starter', billingCycle: 'monthly' })
  const [rzLink, setRzLink] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const [rev, p, s, c, inv] = await Promise.all([
        getBillingRevenue(),
        listBillingPlans(),
        listBillingSubscriptions({ page: 1, pageSize: 50 }),
        listBillingCoupons(),
        listBillingInvoices({ page: 1, pageSize: 25 }),
      ])
      setStats(rev.stats || null)
      setPlans(p.plans || [])
      setSubs(s.subscriptions || [])
      setCoupons(c.coupons || [])
      setInvoices(inv.invoices || [])
    } catch (err) {
      setError(err.message || 'Failed to load billing')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (ok) load()
  }, [ok, load])

  const savePlan = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await upsertBillingPlan({
        ...planForm,
        amountMonthly: Number(planForm.amountMonthly) || 0,
        amountYearly: Number(planForm.amountYearly) || 0,
        trialDays: Number(planForm.trialDays) || 0,
        sortOrder: Number(planForm.sortOrder) || 0,
        enabledModules: String(planForm.enabledModules)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      })
      setNotice(`Plan ${planForm.code} saved`)
      setPlanForm(emptyPlan)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveCoupon = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await upsertBillingCoupon({
        code: couponForm.code,
        name: couponForm.name || undefined,
        percentOff: couponForm.percentOff ? Number(couponForm.percentOff) : undefined,
        amountOff: couponForm.amountOff ? Number(couponForm.amountOff) : undefined,
        currency: couponForm.currency,
        maxRedemptions: couponForm.maxRedemptions
          ? Number(couponForm.maxRedemptions)
          : undefined,
        isActive: couponForm.isActive,
      })
      setNotice(`Coupon ${couponForm.code} saved`)
      setCouponForm(emptyCoupon)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const assignSub = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await assignBillingSubscription(assign)
      setNotice('Subscription assigned')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ok) return null

  return (
    <SuperAdminShell title='Billing'>
      {error ? <div className='sa-alert sa-alert-error'>{error}</div> : null}
      {notice ? <div className='sa-alert sa-alert-ok'>{notice}</div> : null}

      <nav className='sa-tabs'>
        {['overview', 'plans', 'subscriptions', 'coupons', 'invoices', 'razorpay'].map(t => (
          <button
            key={t}
            type='button'
            className={tab === t ? 'sa-tab active' : 'sa-tab'}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        <button type='button' className='sa-btn sa-btn-ghost' onClick={load} disabled={busy}>
          Refresh
        </button>
      </nav>

      {tab === 'overview' && stats ? (
        <section className='sa-stats' style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          <div className='sa-stat'>
            <strong>{formatMoney(stats.mrr, stats.currency)}</strong>
            <span>MRR</span>
          </div>
          <div className='sa-stat'>
            <strong>{formatMoney(stats.arr, stats.currency)}</strong>
            <span>ARR</span>
          </div>
          <div className='sa-stat'>
            <strong>{formatMoney(stats.revenueThisMonth, stats.currency)}</strong>
            <span>Revenue this month</span>
          </div>
          <div className='sa-stat'>
            <strong>
              {stats.activePaidSubscriptions} / {stats.trialingSubscriptions}
            </strong>
            <span>Paid / Trialing</span>
          </div>
          <div className='sa-stat'>
            <strong>{stats.openOrFailedInvoices}</strong>
            <span>Open / failed invoices</span>
          </div>
          <div className='sa-stat'>
            <strong>{stats.stripeConfigured ? 'Yes' : 'No'}</strong>
            <span>Stripe configured</span>
          </div>
          <div className='sa-stat'>
            <strong>{stats.razorpayConfigured ? 'Yes' : 'No'}</strong>
            <span>Razorpay configured</span>
          </div>
        </section>
      ) : null}

      {tab === 'plans' ? (
        <div className='sa-cards'>
          <section className='sa-panel'>
            <h2>Plans</h2>
            <div className='sa-table-wrap'>
              <table className='sa-table'>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Monthly</th>
                    <th>Yearly</th>
                    <th>Modules</th>
                    <th>Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p.id}>
                      <td className='sa-mono'>{p.code}</td>
                      <td>{p.name}</td>
                      <td>{formatMoney(p.amountMonthly, p.currency)}</td>
                      <td>{formatMoney(p.amountYearly, p.currency)}</td>
                      <td className='sa-muted'>{(p.enabledModules || []).join(', ')}</td>
                      <td>{p.isActive ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          type='button'
                          onClick={() =>
                            setPlanForm({
                              code: p.code,
                              name: p.name,
                              description: p.description || '',
                              currency: p.currency,
                              amountMonthly: p.amountMonthly,
                              amountYearly: p.amountYearly,
                              enabledModules: (p.enabledModules || []).join(','),
                              trialDays: p.trialDays,
                              sortOrder: p.sortOrder,
                              isActive: p.isActive,
                            })
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className='sa-panel'>
            <h2>Upsert plan</h2>
            <form className='sa-form' onSubmit={savePlan}>
              <div className='sa-grid'>
                <label>
                  Code
                  <input
                    value={planForm.code}
                    onChange={e => setPlanForm({ ...planForm, code: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Name
                  <input
                    value={planForm.name}
                    onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Monthly (paise)
                  <input
                    type='number'
                    value={planForm.amountMonthly}
                    onChange={e => setPlanForm({ ...planForm, amountMonthly: e.target.value })}
                  />
                </label>
                <label>
                  Yearly (paise)
                  <input
                    type='number'
                    value={planForm.amountYearly}
                    onChange={e => setPlanForm({ ...planForm, amountYearly: e.target.value })}
                  />
                </label>
                <label>
                  Modules (comma)
                  <input
                    value={planForm.enabledModules}
                    onChange={e => setPlanForm({ ...planForm, enabledModules: e.target.value })}
                  />
                </label>
                <label>
                  Trial days
                  <input
                    type='number'
                    value={planForm.trialDays}
                    onChange={e => setPlanForm({ ...planForm, trialDays: e.target.value })}
                  />
                </label>
              </div>
              <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
                Save plan
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {tab === 'subscriptions' ? (
        <>
          <section className='sa-panel' style={{ marginBottom: 14 }}>
            <h2>Assign / change plan</h2>
            <form className='sa-form' onSubmit={assignSub}>
              <div className='sa-grid-3'>
                <label>
                  Workspace ID
                  <input
                    value={assign.workspaceId}
                    onChange={e => setAssign({ ...assign, workspaceId: e.target.value })}
                    placeholder='cuid from company profile URL'
                    required
                  />
                </label>
                <label>
                  Plan
                  <select
                    value={assign.plan}
                    onChange={e => setAssign({ ...assign, plan: e.target.value })}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Cycle
                  <select
                    value={assign.billingCycle}
                    onChange={e => setAssign({ ...assign, billingCycle: e.target.value })}
                  >
                    <option value='monthly'>Monthly</option>
                    <option value='yearly'>Yearly</option>
                  </select>
                </label>
              </div>
              <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
                Assign subscription
              </button>
            </form>
          </section>
          <section className='sa-panel'>
            <h2>Subscriptions</h2>
            <div className='sa-table-wrap'>
              <table className='sa-table'>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Cycle</th>
                    <th>Period end</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.workspace?.name}</strong>
                        <div className='sa-mono sa-muted'>{s.workspace?.tenantCode}</div>
                      </td>
                      <td>{s.plan?.name}</td>
                      <td>
                        <span className={`sa-pill ${s.status}`}>{s.status}</span>
                      </td>
                      <td>{s.billingCycle}</td>
                      <td className='sa-muted'>
                        {s.currentPeriodEnd
                          ? new Date(s.currentPeriodEnd).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                  {!subs.length ? (
                    <tr>
                      <td colSpan={5} className='sa-empty'>
                        No subscriptions yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {tab === 'coupons' ? (
        <div className='sa-cards'>
          <section className='sa-panel'>
            <h2>Coupons</h2>
            <div className='sa-table-wrap'>
              <table className='sa-table'>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Redeemed</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td className='sa-mono'>{c.code}</td>
                      <td>
                        {c.percentOff
                          ? `${c.percentOff}%`
                          : formatMoney(c.amountOff, c.currency)}
                      </td>
                      <td>
                        {c.timesRedeemed}
                        {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}
                      </td>
                      <td>{c.isActive ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className='sa-panel'>
            <h2>Upsert coupon</h2>
            <form className='sa-form' onSubmit={saveCoupon}>
              <div className='sa-grid'>
                <label>
                  Code
                  <input
                    value={couponForm.code}
                    onChange={e => setCouponForm({ ...couponForm, code: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Name
                  <input
                    value={couponForm.name}
                    onChange={e => setCouponForm({ ...couponForm, name: e.target.value })}
                  />
                </label>
                <label>
                  Percent off
                  <input
                    type='number'
                    value={couponForm.percentOff}
                    onChange={e => setCouponForm({ ...couponForm, percentOff: e.target.value })}
                  />
                </label>
                <label>
                  Amount off (paise)
                  <input
                    type='number'
                    value={couponForm.amountOff}
                    onChange={e => setCouponForm({ ...couponForm, amountOff: e.target.value })}
                  />
                </label>
              </div>
              <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
                Save coupon
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {tab === 'invoices' ? (
        <section className='sa-panel'>
          <h2>Invoices</h2>
          <div className='sa-table-wrap'>
            <table className='sa-table'>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.workspace?.name}</td>
                    <td>{formatMoney(inv.amountPaid || inv.amountDue, inv.currency)}</td>
                    <td>
                      <span className={`sa-pill ${inv.status}`}>{inv.status}</span>
                    </td>
                    <td className='sa-muted'>
                      {inv.paidAt ? new Date(inv.paidAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
                {!invoices.length ? (
                  <tr>
                    <td colSpan={4} className='sa-empty'>
                      No invoices yet. Razorpay / Stripe webhooks will populate this.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === 'razorpay' ? (
        <section className='sa-panel'>
          <h2>Razorpay payment link</h2>
          <p className='sa-help'>
            Creates a hosted Razorpay link for a company plan payment. On success, webhook activates
            the subscription. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
          </p>
          <form
            className='sa-form'
            onSubmit={async e => {
              e.preventDefault()
              setBusy(true)
              setError('')
              setRzLink(null)
              try {
                const data = await createRazorpayPaymentLink(assign)
                setRzLink(data.paymentLink)
                setNotice('Payment link created')
                await load()
              } catch (err) {
                setError(err.message)
              } finally {
                setBusy(false)
              }
            }}
          >
            <div className='sa-grid-3'>
              <label>
                Workspace ID
                <input
                  value={assign.workspaceId}
                  onChange={e => setAssign({ ...assign, workspaceId: e.target.value })}
                  required
                />
              </label>
              <label>
                Plan
                <select
                  value={assign.plan}
                  onChange={e => setAssign({ ...assign, plan: e.target.value })}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Cycle
                <select
                  value={assign.billingCycle}
                  onChange={e => setAssign({ ...assign, billingCycle: e.target.value })}
                >
                  <option value='monthly'>Monthly</option>
                  <option value='yearly'>Yearly</option>
                </select>
              </label>
            </div>
            <button type='submit' className='sa-btn sa-btn-primary' disabled={busy}>
              Create Razorpay link
            </button>
          </form>
          {rzLink?.shortUrl ? (
            <div className='sa-banner' style={{ marginTop: 16 }}>
              <div>
                <h2>Payment link ready</h2>
                <p className='sa-mono'>
                  <a href={rzLink.shortUrl} target='_blank' rel='noreferrer'>
                    {rzLink.shortUrl}
                  </a>
                </p>
              </div>
              <button
                type='button'
                className='sa-btn sa-btn-ghost'
                onClick={() => navigator.clipboard?.writeText(rzLink.shortUrl)}
              >
                Copy
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </SuperAdminShell>
  )
}
