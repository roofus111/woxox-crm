'use client'

import { notFound, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import { getModule } from '@/views/apps/legalos/modules'

const LegalOsModulePage = dynamic(() => import('@/views/apps/legalos/LegalOsModulePage'), {
  ssr: false,
  loading: () => <Box sx={{ p: 3, color: 'text.secondary' }}>Loading…</Box>
})

const RESERVED = new Set(['dashboard', 'matters'])

export default function Page() {
  const params = useParams()
  const slug = params?.slug
  if (!slug || RESERVED.has(slug)) notFound()
  const mod = getModule(slug)
  if (!mod) notFound()
  return <LegalOsModulePage slug={slug} />
}
