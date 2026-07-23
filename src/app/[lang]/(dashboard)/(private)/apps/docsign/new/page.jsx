'use client'

import dynamic from 'next/dynamic'

const DocSignCreate = dynamic(() => import('@/views/apps/docsign/DocSignCreate'), {
  ssr: false
})

export default function DocSignNewPage() {
  return <DocSignCreate />
}
