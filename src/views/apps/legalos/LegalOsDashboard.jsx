'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import { useTheme } from '@mui/material/styles'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts'
import {
  Scale,
  Gavel,
  FileText,
  AlertTriangle,
  Users,
  Briefcase,
  Bot,
  Bell,
  CalendarDays,
  TrendingUp
} from 'lucide-react'
import { formatLegalField } from '@/libs/legalosClient'
import { useLegalosQuery } from '@/hooks/useLegalosQuery'
import { lg, lgSurfaces } from './theme'
import { LgCard, LgChip, LgPageHeader, LgSection, LgStat } from './components'

const revenueData = [
  { m: 'Jan', v: 18 },
  { m: 'Feb', v: 22 },
  { m: 'Mar', v: 19 },
  { m: 'Apr', v: 28 },
  { m: 'May', v: 31 },
  { m: 'Jun', v: 36 }
]

const practiceData = [
  { name: 'Civil', v: 42 },
  { name: 'Criminal', v: 28 },
  { name: 'Corporate', v: 22 },
  { name: 'Tax', v: 14 }
]

function ListItem({ title, meta, right, border }) {
  return (
    <Box
      sx={{
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        borderBottom: `1px solid ${border}`
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={600} noWrap color='text.primary'>
          {title}
        </Typography>
        {meta ? (
          <Typography color='text.secondary' sx={{ fontSize: 12 }} noWrap>
            {meta}
          </Typography>
        ) : null}
      </Box>
      {right}
    </Box>
  )
}

function QuickAction({ href, icon: Icon, label, surface }) {
  return (
    <Button
      component={Link}
      href={href}
      startIcon={<Icon size={16} color={lg.gold} />}
      sx={{
        justifyContent: 'flex-start',
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: `1px solid ${surface.border}`,
        borderRadius: '12px',
        px: 2,
        py: 1.25,
        textTransform: 'none',
        fontWeight: 600,
        '&:hover': { borderColor: lg.gold, bgcolor: surface.hover }
      }}
    >
      {label}
    </Button>
  )
}

export default function LegalOsDashboard() {
  const theme = useTheme()
  const s = lgSurfaces(theme)
  const params = useParams()
  const locale = params?.lang || 'en'
  const base = `/${locale}/apps/legalos`
  const dark = theme.palette.mode === 'dark'

  const { data, loading } = useLegalosQuery(async fetchApi => {
    try {
      const { data: portfolio } = await fetchApi('/dashboard')
      return portfolio
    } catch {
      return null
    }
  }, [])

  const hearingsToday = data?.todaysHearings || []
  const upcoming = data?.upcomingHearings || []
  const recentCases = data?.recentCases || []
  const totals = data?.totals || {}
  const statusBreakdown = data?.caseStatusBreakdown || []
  const active =
    statusBreakdown.find(r => r._id === 'ACTIVE')?.count ?? totals.cases ?? (loading ? '—' : 0)

  const chartTip = {
    background: theme.palette.background.paper,
    border: `1px solid ${s.border}`,
    borderRadius: 12,
    color: theme.palette.text.primary
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', bgcolor: 'background.default', color: 'text.primary' }}>
      <LgPageHeader
        title='Legal Practice OS'
        subtitle='Executive command center for Indian legal practice'
        crumbs={[{ label: 'Dashboard' }]}
        action={
          <Button
            component={Link}
            href={`${base}/matters`}
            variant='contained'
            sx={{
              bgcolor: lg.gold,
              color: '#0B0B0C',
              fontWeight: 700,
              borderRadius: '12px',
              px: 2.5,
              '&:hover': { bgcolor: lg.goldDark }
            }}
          >
            Open Matters
          </Button>
        }
      />

      <LgCard
        noHover
        sx={{
          mb: 3,
          background: dark
            ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, #1c1808 55%, ${theme.palette.background.default} 100%)`
            : `linear-gradient(135deg, #ffffff 0%, #faf6eb 55%, ${theme.palette.background.default} 100%)`,
          borderColor: s.border
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Typography sx={{ color: lg.gold, fontWeight: 700, fontSize: 12, letterSpacing: 2, mb: 1 }}>
            WOXOX LEGALOS
          </Typography>
          <Typography variant='h4' fontWeight={700} sx={{ maxWidth: 640, lineHeight: 1.25, color: 'text.primary' }}>
            Premium counsel workspace — matters, courts, evidence & AI in one executive view.
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'text.secondary', maxWidth: 520 }}>
            Today’s hearings, compliance, revenue, filings and high-priority litigation — designed for partners and
            case teams.
          </Typography>
          <Stack direction='row' spacing={1.5} sx={{ mt: 3 }} flexWrap='wrap' useFlexGap>
            <QuickAction href={`${base}/calendar`} icon={CalendarDays} label='Court Calendar' surface={s} />
            <QuickAction href={`${base}/filing`} icon={FileText} label='Filing Queue' surface={s} />
            <QuickAction href={`${base}/ai`} icon={Bot} label='Legal AI' surface={s} />
            <QuickAction href={`${base}/analytics`} icon={TrendingUp} label='Analytics' surface={s} />
          </Stack>
        </Box>
      </LgCard>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3} lg={2}>
          <LgStat label='Active Matters' value={active} hint='Live portfolio' />
        </Grid>
        <Grid item xs={6} md={3} lg={2}>
          <LgStat label='Hearings Today' value={hearingsToday.length || 0} />
        </Grid>
        <Grid item xs={6} md={3} lg={2}>
          <LgStat label='Complaints' value={data?.pendingComplaints ?? totals.complaints ?? 0} />
        </Grid>
        <Grid item xs={6} md={3} lg={2}>
          <LgStat label='FIR Pending' value={data?.pendingFirs ?? totals.firs ?? 0} />
        </Grid>
        <Grid item xs={6} md={3} lg={2}>
          <LgStat label='Compliance' value={4} hint='Overdue items' />
        </Grid>
        <Grid item xs={6} md={3} lg={2}>
          <LgStat label='Revenue' value='₹36L' hint='YTD billed' />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <LgSection
            title="Today's Hearings"
            action={
              <Button component={Link} href={`${base}/calendar`} size='small' sx={{ color: lg.gold }}>
                View all
              </Button>
            }
          >
            {hearingsToday.length === 0 ? (
              <Typography color='text.secondary'>No hearings listed for today.</Typography>
            ) : (
              hearingsToday.slice(0, 5).map((h, i) => (
                <ListItem
                  key={h._id || i}
                  border={theme.palette.divider}
                  title={formatLegalField(h.title) || 'Hearing'}
                  meta={[formatLegalField(h.court), formatLegalField(h.purpose)].filter(Boolean).join(' · ')}
                  right={<LgChip label={formatLegalField(h.status) || 'LISTED'} />}
                />
              ))
            )}
          </LgSection>
        </Grid>

        <Grid item xs={12} lg={6}>
          <LgSection
            title='Upcoming Court Calendar'
            action={
              <Button component={Link} href={`${base}/calendar`} size='small' sx={{ color: lg.gold }}>
                Calendar
              </Button>
            }
          >
            {upcoming.length === 0 ? (
              <Typography color='text.secondary'>No upcoming hearings.</Typography>
            ) : (
              upcoming.slice(0, 5).map((h, i) => (
                <ListItem
                  key={h._id || i}
                  border={theme.palette.divider}
                  title={formatLegalField(h.title) || 'Hearing'}
                  meta={[
                    h.scheduledAt ? new Date(h.scheduledAt).toLocaleString('en-IN') : null,
                    formatLegalField(h.court)
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  right={<Gavel size={16} color={lg.gold} />}
                />
              ))
            )}
          </LgSection>
        </Grid>

        <Grid item xs={12} lg={8}>
          <LgSection title='Revenue Analytics'>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id='goldFill' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor={lg.gold} stopOpacity={0.45} />
                      <stop offset='100%' stopColor={lg.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey='m' stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                  <Tooltip contentStyle={chartTip} />
                  <Area type='monotone' dataKey='v' stroke={lg.gold} fill='url(#goldFill)' strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </LgSection>
        </Grid>

        <Grid item xs={12} lg={4}>
          <LgSection title='Practice Analytics'>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={practiceData}>
                  <XAxis dataKey='name' stroke={theme.palette.text.secondary} fontSize={11} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={11} />
                  <Tooltip contentStyle={chartTip} />
                  <Bar dataKey='v' fill={lg.gold} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <LgSection
            title='Recent Matters'
            action={
              <Button component={Link} href={`${base}/matters`} size='small' sx={{ color: lg.gold }}>
                Matters
              </Button>
            }
          >
            {(recentCases.length
              ? recentCases
              : [{ caseNumber: 'WP(C) 482/2024', title: 'Sharma vs State', status: 'ACTIVE' }]
            )
              .slice(0, 5)
              .map((c, i) => (
                <ListItem
                  key={c._id || i}
                  border={theme.palette.divider}
                  title={formatLegalField(c.caseNumber) || 'Matter'}
                  meta={formatLegalField(c.title)}
                  right={<LgChip label={formatLegalField(c.status) || 'ACTIVE'} />}
                />
              ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <LgSection title='High Priority Cases'>
            {[
              { t: 'Bail — Mehta', m: 'Sessions · Saket', tone: 'danger' },
              { t: 'Injunction — Meridian', m: 'DHC · Urgent', tone: 'warning' },
              { t: 'Arbitration — Axis', m: 'SIAC seat', tone: 'gold' }
            ].map(item => (
              <ListItem
                key={item.t}
                border={theme.palette.divider}
                title={item.t}
                meta={item.m}
                right={<LgChip label='PRIORITY' tone={item.tone} />}
              />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <LgSection title='Pending Compliance'>
            {[
              { t: 'GST notice response', p: 70 },
              { t: 'Board resolution filing', p: 40 },
              { t: 'KYC refresh — 2 clients', p: 25 }
            ].map(item => (
              <Box key={item.t} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography fontSize={13} color='text.primary'>
                    {item.t}
                  </Typography>
                  <Typography fontSize={12} sx={{ color: lg.gold }}>
                    {item.p}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={item.p}
                  sx={{
                    height: 6,
                    borderRadius: 99,
                    bgcolor: theme.palette.action.hover,
                    '& .MuiLinearProgress-bar': { bgcolor: lg.gold }
                  }}
                />
              </Box>
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <LgSection title="Today's Tasks">
            {['Brief for WP(C) 482', 'File vakalatnama', 'Client call — Meridian', 'Review evidence pack'].map(t => (
              <ListItem key={t} border={theme.palette.divider} title={t} right={<Scale size={14} color={lg.gold} />} />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <LgSection title='Team Activity'>
            {['Ananya filed reply', 'Rohan updated timeline', 'Priya sealed exhibit B', 'Admin synced eCourts'].map(
              t => (
                <ListItem key={t} border={theme.palette.divider} title={t} right={<Users size={14} color={lg.gold} />} />
              )
            )}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <LgSection title='Court Filing Queue'>
            {['Writ petition — DHC', 'Bail application', 'Caveat — Saket'].map(t => (
              <ListItem key={t} border={theme.palette.divider} title={t} right={<LgChip label='QUEUE' />} />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <LgSection title='Notifications'>
            {[
              'Hearing reminder · 10:30',
              'New judgment tagged',
              'Client message · Sharma',
              'Payment received ₹2.4L'
            ].map(t => (
              <ListItem key={t} border={theme.palette.divider} title={t} right={<Bell size={14} color={lg.gold} />} />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <LgSection title='Recent Documents'>
            {['Draft petition v3.docx', 'Power of attorney.pdf', 'Evidence index.xlsx'].map(t => (
              <ListItem key={t} border={theme.palette.divider} title={t} right={<FileText size={14} color={lg.gold} />} />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <LgSection title='Recent Judgments'>
            {['(2024) 3 SCC 112', 'Delhi HC — Stay order', 'NCLT — CIRP admission'].map(t => (
              <ListItem
                key={t}
                border={theme.palette.divider}
                title={t}
                right={<Briefcase size={14} color={lg.gold} />}
              />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <LgSection title='Client Messages'>
            {['Sharma — hearing prep?', 'Meridian — invoice query', 'Axis — settlement draft'].map(t => (
              <ListItem
                key={t}
                border={theme.palette.divider}
                title={t}
                right={<LgChip label='NEW' tone='success' />}
              />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6}>
          <LgSection title='Case Status'>
            {(statusBreakdown.length
              ? statusBreakdown
              : [
                  { _id: 'ACTIVE', count: 24 },
                  { _id: 'PENDING', count: 8 },
                  { _id: 'DISPOSED', count: 5 }
                ]
            ).map(row => (
              <ListItem
                key={row._id}
                border={theme.palette.divider}
                title={row._id}
                meta={`${row.count} matters`}
                right={<LgChip label={String(row.count)} />}
              />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12} md={6}>
          <LgSection title='Court Deadlines'>
            {[
              { t: 'Reply affidavit', m: '22 Jul 2026' },
              { t: 'Compliance affidavit', m: '25 Jul 2026' },
              { t: 'Arbitration statement', m: '01 Aug 2026' }
            ].map(item => (
              <ListItem
                key={item.t}
                border={theme.palette.divider}
                title={item.t}
                meta={item.m}
                right={<AlertTriangle size={14} color='#b26a00' />}
              />
            ))}
          </LgSection>
        </Grid>

        <Grid item xs={12}>
          <LgSection title='Case Timeline · Snapshot'>
            {[
              'FIR registered → Complaint converted',
              'Bail granted with conditions',
              'Evidence sealed · hash verified',
              'Next listing · Final arguments'
            ].map((t, i) => (
              <Box
                key={t}
                sx={{ display: 'flex', gap: 2, py: 1.25, borderBottom: `1px solid ${theme.palette.divider}` }}
              >
                <Typography sx={{ color: lg.gold, fontWeight: 700, minWidth: 28 }}>{i + 1}</Typography>
                <Typography color='text.primary'>{t}</Typography>
              </Box>
            ))}
          </LgSection>
        </Grid>
      </Grid>
    </Box>
  )
}
