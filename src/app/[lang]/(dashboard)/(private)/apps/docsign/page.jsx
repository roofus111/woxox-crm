'use client'

import dynamic from 'next/dynamic'

const DocSignDashboard = dynamic(() => import('@/views/apps/docsign/DocSignDashboard'), {
  ssr: false
})

export default function DocSignPage() {
  return <DocSignDashboard />
}
