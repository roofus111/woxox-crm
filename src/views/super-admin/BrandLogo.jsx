'use client'

const LOGO_SRC = '/images/woxoxlogo.png'

export default function BrandLogo({ size = 'md', className = '' }) {
  const isSm = size === 'sm'
  return (
    <span className={`sa-brand-logo-wrap ${isSm ? 'sa-brand-logo-wrap-sm' : ''} ${className}`.trim()}>
      <img
        src={LOGO_SRC}
        alt='WOXOX'
        className={isSm ? 'sa-brand-logo sa-brand-logo-sm' : 'sa-brand-logo'}
      />
    </span>
  )
}
