'use client'

import dynamic from 'next/dynamic'

const DocSignWorkspace = dynamic(() => import('@/views/apps/docsign/DocSignWorkspace'), {
  ssr: false
})

export default function DocSignEnvelopePage() {
  return <DocSignWorkspace />
}
