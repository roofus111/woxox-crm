'use client'

export default function ImpersonationBanner({ state, onStop }) {
  if (!state) return null
  return (
    <div className='sa-impersonation'>
      <div>
        Impersonating <strong>{state.targetEmail}</strong>
        {state.tenantName ? ` · ${state.tenantName}` : ''}
        {state.expiresAt ? ` · until ${new Date(state.expiresAt).toLocaleString()}` : ''}
      </div>
      <button type='button' onClick={onStop}>
        Stop impersonation
      </button>
    </div>
  )
}
