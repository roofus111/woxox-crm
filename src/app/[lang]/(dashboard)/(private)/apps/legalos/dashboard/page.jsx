'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import { lg } from '@/views/apps/legalos/theme'

const LegalOsDashboard = dynamic(() => import('@/views/apps/legalos/LegalOsDashboard'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 3, color: lg.textMuted, bgcolor: lg.bg, minHeight: 320 }}>Loading LegalOS…</Box>
  )
})

export default function Page() {
  return <LegalOsDashboard />
}
