'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import { lg } from '@/views/apps/legalos/theme'

const LegalOsModulePage = dynamic(() => import('@/views/apps/legalos/LegalOsModulePage'), {
  ssr: false,
  loading: () => <Box sx={{ p: 3, color: lg.textMuted }}>Loading…</Box>
})

export default function Page() {
  return <LegalOsModulePage slug='matters' />
}
