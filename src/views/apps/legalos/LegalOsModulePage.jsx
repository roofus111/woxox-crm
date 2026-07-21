'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { formatLegalField } from '@/libs/legalosClient'
import { useLegalosQuery } from '@/hooks/useLegalosQuery'
import { lg } from './theme'
import { LgCard, LgChip, LgDataTable, LgPageHeader, LgSection, LgStat } from './components'
import { getModule } from './modules'
import { getModuleActions, getModuleDemoRows, getModuleFilters, getModuleStats } from './moduleDemoData'

function mapRow(slug, row) {
  if (slug === 'matters' || slug === 'litigation' || slug === 'recovery') {
    return {
      id: row._id || row.id,
      primary: formatLegalField(row.caseNumber) || 'Matter',
      secondary: formatLegalField(row.title),
      status: formatLegalField(row.status) || 'ACTIVE',
      meta: formatLegalField(row.practiceArea) || formatLegalField(row.court),
      owner: formatLegalField(row.leadCounsel) || '—',
      due: row.nextHearingAt ? new Date(row.nextHearingAt).toLocaleDateString('en-IN') : '—'
    }
  }
  if (slug === 'complaints') {
    return {
      id: row._id,
      primary: formatLegalField(row.complaintNumber) || formatLegalField(row.title) || 'Complaint',
      secondary: formatLegalField(row.summary) || formatLegalField(row.policeStation),
      status: formatLegalField(row.status),
      meta: formatLegalField(row.policeStation) || '—',
      owner: '—',
      due: '—'
    }
  }
  if (slug === 'fir') {
    return {
      id: row._id,
      primary: formatLegalField(row.firNumber) || 'FIR',
      secondary: formatLegalField(row.policeStation),
      status: formatLegalField(row.status),
      meta: formatLegalField(row.sections) || '—',
      owner: '—',
      due: '—'
    }
  }
  if (slug === 'calendar' || slug === 'hearings') {
    return {
      id: row._id,
      primary: formatLegalField(row.title) || 'Hearing',
      secondary: [
        row.scheduledAt ? new Date(row.scheduledAt).toLocaleString('en-IN') : null,
        formatLegalField(row.court)
      ]
        .filter(Boolean)
        .join(' · '),
      status: formatLegalField(row.purpose) || formatLegalField(row.status),
      meta: formatLegalField(row.court) || '—',
      owner: '—',
      due: row.scheduledAt ? new Date(row.scheduledAt).toLocaleDateString('en-IN') : '—'
    }
  }
  if (slug === 'evidence') {
    return {
      id: row._id,
      primary: formatLegalField(row.title) || formatLegalField(row.fileName) || 'Evidence',
      secondary: formatLegalField(row.caseNumber),
      status: formatLegalField(row.status) || 'SEALED',
      meta: formatLegalField(row.hash) ? 'Hash verified' : '—',
      owner: '—',
      due: '—'
    }
  }
  if (slug === 'filing') {
    return {
      id: row._id,
      primary: formatLegalField(row.title) || formatLegalField(row.filingNumber) || 'Filing',
      secondary: formatLegalField(row.court),
      status: formatLegalField(row.status),
      meta: formatLegalField(row.court) || '—',
      owner: '—',
      due: '—'
    }
  }
  if (slug === 'knowledge' || slug === 'judgments' || slug === 'acts') {
    return {
      id: row._id,
      primary: formatLegalField(row.title) || 'Document',
      secondary: formatLegalField(row.category),
      status: formatLegalField(row.status) || 'DOC',
      meta: formatLegalField(row.category) || '—',
      owner: '—',
      due: '—'
    }
  }
  if (slug === 'clients' || slug === 'crm') {
    return {
      id: row._id,
      primary: formatLegalField(row.name) || 'Client',
      secondary: formatLegalField(row.city) || formatLegalField(row.type),
      status: formatLegalField(row.type) || 'PARTY',
      meta: formatLegalField(row.city) || '—',
      owner: '—',
      due: '—'
    }
  }
  return {
    id: row._id || row.id || Math.random(),
    primary: formatLegalField(row.title) || formatLegalField(row.name) || 'Record',
    secondary: formatLegalField(row.status) || '',
    status: formatLegalField(row.status) || 'READY',
    meta: '—',
    owner: '—',
    due: '—'
  }
}

function statusTone(status = '') {
  const s = String(status).toUpperCase()
  if (/(URGENT|OVERDUE|REJECT|DANGER|PENDING_FIR)/.test(s)) return 'danger'
  if (/(PENDING|DRAFT|WIP|REVIEW|PROCESSING|QUEUED|WATCH)/.test(s)) return 'warning'
  if (/(PAID|ACTIVE|SEALED|FILED|COMPLETE|GOOD|ON_TRACK|EXECUTED|PUBLISHED)/.test(s)) return 'success'
  return 'gold'
}

export default function LegalOsModulePage({ slug }) {
  const mod = getModule(slug) || { title: slug, api: null, section: 'Practice' }
  const params = useParams()
  const locale = params?.lang || 'en'
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')

  const stats = getModuleStats(slug)
  const actions = getModuleActions(slug, mod.title)
  const filters = getModuleFilters(slug)
  const demoRows = useMemo(() => getModuleDemoRows(slug, mod.section), [slug, mod.section])

  const { data, loading, error, reload } = useLegalosQuery(async fetchApi => {
    if (!mod.api) return null
    try {
      const { data: rows } = await fetchApi(mod.api)
      return Array.isArray(rows) ? rows : rows?.items || []
    } catch {
      return null
    }
  }, [mod.api])

  const rows = useMemo(() => {
    const live = data && data.length ? data.map(r => mapRow(slug, r)) : demoRows
    let source = live
    if (filter && filter !== 'All') {
      const f = filter.toLowerCase().replace(/\s+/g, '_')
      source = source.filter(r => String(r.status || '').toLowerCase().includes(f.replace('_', '')) || String(r.status || '').toLowerCase().includes(filter.toLowerCase()))
    }
    if (!q.trim()) return source
    const n = q.toLowerCase()
    return source.filter(r => `${r.primary} ${r.secondary} ${r.status} ${r.meta} ${r.owner}`.toLowerCase().includes(n))
  }, [data, demoRows, q, slug, filter])

  const columns = [
    {
      key: 'primary',
      label: 'Record',
      render: row => (
        <Box>
          {slug === 'matters' && row.id && String(row.id).length > 8 ? (
            <Typography
              component={Link}
              href={`/${locale}/apps/legalos/matters/${row.id}`}
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { color: lg.gold }
              }}
            >
              {row.primary}
            </Typography>
          ) : (
            <Typography fontWeight={700} color='text.primary'>
              {row.primary}
            </Typography>
          )}
          {row.secondary ? (
            <Typography color='text.secondary' sx={{ fontSize: 12 }}>
              {row.secondary}
            </Typography>
          ) : null}
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: row => (row.status ? <LgChip label={row.status} tone={statusTone(row.status)} /> : null)
    },
    {
      key: 'meta',
      label: 'Context',
      render: row => (
        <Typography color='text.secondary' sx={{ fontSize: 13 }}>
          {row.meta || '—'}
        </Typography>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      render: row => (
        <Typography color='text.secondary' sx={{ fontSize: 13 }}>
          {row.owner || '—'}
        </Typography>
      )
    },
    {
      key: 'due',
      label: 'Due',
      render: row => (
        <Typography color='text.secondary' sx={{ fontSize: 13 }}>
          {row.due || '—'}
        </Typography>
      )
    }
  ]

  const usingDemo = !(data && data.length)

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', bgcolor: 'background.default', color: 'text.primary' }}>
      <LgPageHeader
        title={mod.title}
        subtitle={`${mod.section || 'LegalOS'} · Live workflow desk for counsel & ops`}
        crumbs={[{ label: mod.section || 'LegalOS' }, { label: mod.title }]}
        action={
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            {actions.slice(1).map(label => (
              <Button
                key={label}
                variant='outlined'
                size='small'
                sx={{ borderColor: 'divider', color: 'text.primary', borderRadius: '10px' }}
              >
                {label}
              </Button>
            ))}
            <Button
              variant='contained'
              sx={{
                bgcolor: lg.gold,
                color: '#0B0B0C',
                fontWeight: 700,
                borderRadius: '12px',
                '&:hover': { bgcolor: lg.goldDark }
              }}
            >
              {actions[0]}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <LgStat label={s.label} value={s.value} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <LgCard noHover sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                {filters.map(f => (
                  <Chip
                    key={f}
                    label={f}
                    size='small'
                    onClick={() => setFilter(f)}
                    sx={{
                      fontWeight: 600,
                      bgcolor: filter === f ? 'rgba(154,114,9,0.15)' : 'action.hover',
                      color: filter === f ? lg.gold : 'text.secondary',
                      border: filter === f ? `1px solid ${lg.gold}` : '1px solid transparent'
                    }}
                  />
                ))}
              </Stack>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {usingDemo ? 'Demo workspace data' : 'Live API data'} · {rows.length} shown
              </Typography>
            </Box>

            {error ? (
              <Typography color='error' sx={{ mb: 2 }}>
                {error}{' '}
                <Button onClick={reload} sx={{ color: lg.gold }}>
                  Retry
                </Button>
              </Typography>
            ) : null}

            {loading ? (
              <Typography color='text.secondary'>Loading…</Typography>
            ) : (
              <LgDataTable columns={columns} rows={rows} onSearch={setQ} searchPlaceholder={`Search ${mod.title}…`} />
            )}
          </LgCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            <LgSection title='Workspace'>
              <Typography color='text.secondary' sx={{ fontSize: 13, mb: 1.5 }}>
                {mod.title} is ready for intake, assignment, and review. Use filters and actions to run the desk like a
                partner operating view.
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                {['Assign owner', 'Attach to matter', 'Add to hearing prep', 'Export audit pack'].map(t => (
                  <Button
                    key={t}
                    fullWidth
                    variant='outlined'
                    size='small'
                    sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary', borderRadius: '10px' }}
                  >
                    {t}
                  </Button>
                ))}
              </Stack>
            </LgSection>

            <LgSection title='Recent activity'>
              {[
                'Counsel updated status',
                'Document packaged for filing',
                'Reminder sent to client',
                'AI note attached'
              ].map(t => (
                <Box key={t} sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
                  <Typography fontWeight={600} fontSize={13}>
                    {t}
                  </Typography>
                  <Typography color='text.secondary' fontSize={12}>
                    {mod.title} · moments ago
                  </Typography>
                </Box>
              ))}
            </LgSection>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
