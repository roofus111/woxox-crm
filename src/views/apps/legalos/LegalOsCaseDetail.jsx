'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { formatLegalField } from '@/libs/legalosClient'
import { useLegalosQuery } from '@/hooks/useLegalosQuery'
import { lg, lgSurfaces } from './theme'
import { LgCard, LgChip, LgPageHeader, LgSection } from './components'

const TABS = [
  'Timeline',
  'Evidence',
  'Documents',
  'Notes',
  'Tasks',
  'Hearings',
  'Payments',
  'Communications',
  'History'
]

export default function LegalOsCaseDetail() {
  const theme = useTheme()
  const s = lgSurfaces(theme)
  const params = useParams()
  const locale = params?.lang || 'en'
  const caseId = params?.id
  const [tab, setTab] = useState(0)

  const { data, loading } = useLegalosQuery(async fetchApi => {
    try {
      const { data: c } = await fetchApi(`/cases/${caseId}`)
      return c
    } catch {
      return {
        caseNumber: 'WP(C) 482/2024',
        title: 'Sharma vs State of Delhi',
        status: 'ACTIVE',
        practiceArea: 'Constitutional',
        court: 'Delhi High Court'
      }
    }
  }, [caseId])

  if (loading && !data) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography color='text.secondary'>Loading matter…</Typography>
      </Box>
    )
  }

  const c = data || {}

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', bgcolor: 'background.default', color: 'text.primary' }}>
      <LgPageHeader
        title={formatLegalField(c.caseNumber) || 'Matter'}
        subtitle={formatLegalField(c.title)}
        crumbs={[{ label: 'Matters' }, { label: formatLegalField(c.caseNumber) || 'Detail' }]}
        action={
          <Button
            component={Link}
            href={`/${locale}/apps/legalos/matters`}
            sx={{ color: lg.gold, borderColor: s.border, border: '1px solid', borderRadius: '12px' }}
          >
            Back to Matters
          </Button>
        }
      />

      <LgCard noHover sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ color: lg.gold, fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>
              CASE FILE
            </Typography>
            <Typography variant='h4' fontWeight={700} sx={{ mt: 0.5, color: 'text.primary' }}>
              {formatLegalField(c.caseNumber)}
            </Typography>
            <Typography color='text.secondary' sx={{ mt: 0.5 }}>
              {formatLegalField(c.title)}
            </Typography>
          </Box>
          <LgChip label={formatLegalField(c.status) || 'ACTIVE'} />
        </Box>
      </LgCard>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <LgSection title='Client Card'>
            <Typography fontWeight={700} color='text.primary'>
              Sharma Holdings
            </Typography>
            <Typography color='text.secondary' sx={{ fontSize: 13 }}>
              Corporate · Delhi · KYC verified
            </Typography>
          </LgSection>
        </Grid>
        <Grid item xs={12} md={6}>
          <LgSection title='Advocate Card'>
            <Typography fontWeight={700} color='text.primary'>
              Adv. Ananya Rao
            </Typography>
            <Typography color='text.secondary' sx={{ fontSize: 13 }}>
              Lead counsel · DHC roster
            </Typography>
          </LgSection>
        </Grid>
      </Grid>

      <LgCard noHover>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            px: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': { color: 'text.secondary', fontWeight: 600, textTransform: 'none' },
            '& .Mui-selected': { color: `${lg.gold} !important` },
            '& .MuiTabs-indicator': { bgcolor: lg.gold }
          }}
        >
          {TABS.map(t => (
            <Tab key={t} label={t} />
          ))}
        </Tabs>
        <Box sx={{ p: 3 }}>
          <Typography color='text.secondary' sx={{ mb: 2 }}>
            {TABS[tab]} workspace
          </Typography>
          {[1, 2, 3].map(i => (
            <Box key={i} sx={{ py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography fontWeight={600} color='text.primary'>
                {TABS[tab]} item {i}
              </Typography>
              <Typography color='text.secondary' sx={{ fontSize: 13 }}>
                Premium matter detail · {formatLegalField(c.practiceArea) || 'Practice'} ·{' '}
                {formatLegalField(c.court) || 'Court'}
              </Typography>
            </Box>
          ))}
        </Box>
      </LgCard>
    </Box>
  )
}
