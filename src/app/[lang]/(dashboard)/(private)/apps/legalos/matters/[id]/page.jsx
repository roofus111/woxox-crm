'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import { lg } from '@/views/apps/legalos/theme'

const LegalOsCaseDetail = dynamic(() => import('@/views/apps/legalos/LegalOsCaseDetail'), {
  ssr: false,
  loading: () => <Box sx={{ p: 3, color: lg.textMuted }}>Loading matter…</Box>
})

export default function Page() {
  return <LegalOsCaseDetail />
}
