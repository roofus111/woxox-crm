'use client'

import dynamic from 'next/dynamic'

const GuestSignPage = dynamic(() => import('@/views/apps/docsign/GuestSignPage'), {
  ssr: false
})

export default function SignTokenPage() {
  return <GuestSignPage />
}
