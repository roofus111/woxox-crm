'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchDashboardSummary, isCrmPlatformEnabled, ensureCrmPlatformSession, clearCrmPlatformToken } from '@/libs/crmPlatformApi'
import { useSession } from 'next-auth/react'

const COLORS = ['#0288d1', '#00897b', '#ef6c00', '#7b1fa2', '#c62828', '#455a64', '#2e7d32']

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    value ?? 0
  )

const KPI = ({ label, value, sub, color = '#0288d1', icon, href }) => {
  const content = (
    <Card
      elevation={0}
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        height: '100%',
        borderRadius: 3,
        cursor: href ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        '&:hover': href ? { boxShadow: 3 } : undefined,
      }}
    >
      <CardContent>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: `${color}18`,
              color,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <i className={icon} style={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={700} lineHeight={1.1}>
              {value}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {label}
            </Typography>
            {sub ? (
              <Typography variant='caption' color='text.secondary'>
                {sub}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )

  if (!href) return content
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      {content}
    </Link>
  )
}

export default function CrmPlatformDashboard() {
  const params = useParams()
  const locale = params?.lang || 'en'
  const { data: session } = useSession()
  const legacyRole = session?.user?.role
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isCrmPlatformEnabled()) {
      setLoading(false)
      return undefined
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const legacy =
          session?.accessToken ||
          (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

        let summary
        try {
          summary = await fetchDashboardSummary(legacy)
        } catch (e) {
          if (e.status === 401 && legacy) {
            clearCrmPlatformToken()
            await ensureCrmPlatformSession(legacy, { force: true })
            summary = await fetchDashboardSummary(legacy)
          } else {
            throw e
          }
        }
        if (!cancelled) setData(summary)
      } catch (e) {
        if (!cancelled) {
          const msg = e.message || ''
          const missingToken = /missing bearer token/i.test(msg)
          setError(
            e.status === 401 || missingToken
              ? 'Session expired. Log out and sign in again.'
              : msg || 'Could not load CRM dashboard.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [legacyRole, session?.accessToken])

  if (!isCrmPlatformEnabled()) {
    return null
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity='warning'>
          <AlertTitle>CRM Platform API</AlertTitle>
          {error}
        </Alert>
      </Box>
    )
  }

  const kpis = data?.kpis || {}
  const funnel = data?.funnel || []
  const activities = data?.recentActivities || []
  const isMine = legacyRole === 'user' || data?.scope === 'mine'
  const leadsHref = isMine ? `/${locale}/home` : `/${locale}/manager/leads`
  const followHref = isMine ? `/${locale}/followup` : `/${locale}/manager/followups`
  const activityHref = isMine ? `/${locale}/home` : `/${locale}/manager/activitylog`

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems='flex-start' sx={{ mb: 3 }}>
        <Box>
          <Chip
            label={isMine ? 'MY WORK' : 'WOXOX CRM'}
            size='small'
            color='primary'
            sx={{ mb: 1, fontWeight: 700 }}
          />
          <Typography variant='h4' fontWeight={700} gutterBottom>
            {isMine ? 'My sales dashboard' : 'Sales operating dashboard'}
          </Typography>
          <Typography color='text.secondary'>
            {isMine
              ? 'Only your assigned leads, follow-ups, and activity — not other team members.'
              : 'Live KPIs from your CRM data (leads, deals, follow-ups, activities).'}
          </Typography>
        </Box>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mt: { xs: 2, sm: 0 } }}>
          <Button component={Link} href={leadsHref} variant='outlined' size='small'>
            {isMine ? 'My leads' : 'Leads'}
          </Button>
          {!isMine ? (
            <>
              <Button component={Link} href={`/${locale}/manager/customer`} variant='outlined' size='small'>
                Contacts
              </Button>
              <Button component={Link} href={`/${locale}/manager/pipeline`} variant='outlined' size='small'>
                Pipelines
              </Button>
              <Button component={Link} href={`/${locale}/manager/notes`} variant='outlined' size='small'>
                Notes
              </Button>
              <Button component={Link} href={`/${locale}/apps/projects/max`} variant='outlined' size='small'>
                PM Max
              </Button>
            </>
          ) : (
            <Button component={Link} href={followHref} variant='outlined' size='small'>
              My follow-ups
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPI label={isMine ? 'My leads' : 'Total leads'} value={kpis.totalLeads ?? 0} sub={`${kpis.qualifiedLeads ?? 0} qualified`} icon='ri-user-star-line' href={leadsHref} />
        </Grid>
        {!isMine ? (
          <Grid item xs={6} md={3}>
            <KPI label='Contacts' value={kpis.totalContacts ?? 0} sub={`${kpis.totalCompanies ?? 0} companies`} color='#00897b' icon='ri-contacts-book-line' href={`/${locale}/manager/customer`} />
          </Grid>
        ) : null}
        <Grid item xs={6} md={3}>
          <KPI label={isMine ? 'My open deals' : 'Open deals'} value={kpis.openDeals ?? 0} sub={formatInr(kpis.pipelineValue)} color='#ef6c00' icon='ri-handshake-line' href={isMine ? leadsHref : `/${locale}/manager/saleRequest`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPI label='Win rate' value={`${kpis.winRate ?? 0}%`} sub={`${kpis.wonDeals ?? 0} won · ${kpis.lostDeals ?? 0} lost`} color='#7b1fa2' icon='ri-trophy-line' href={isMine ? leadsHref : `/${locale}/dashboards/leads`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPI label={isMine ? 'My won revenue' : 'Won revenue'} value={formatInr(kpis.wonValue)} color='#2e7d32' icon='ri-money-rupee-circle-line' href={isMine ? leadsHref : `/${locale}/manager/saleRequest`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPI label='Tasks due today' value={kpis.tasksDueToday ?? 0} sub={`${kpis.openTasks ?? 0} open`} color='#c62828' icon='ri-list-check-3' href={followHref} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPI label='Activities today' value={kpis.activitiesToday ?? 0} color='#455a64' icon='ri-pulse-line' href={activityHref} />
        </Grid>
        {!isMine ? (
          <Grid item xs={6} md={3}>
            <KPI label='Pipeline health' value={kpis.openDeals ? 'Active' : 'Empty'} sub='Default sales pipeline' color='#0288d1' icon='ri-flow-chart' href={`/${locale}/manager/pipeline`} />
          </Grid>
        ) : null}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
            <CardHeader title='Lead funnel' subheader='Leads by status' />
            <CardContent>
              {funnel.length === 0 ? (
                <Typography color='text.secondary'>No leads yet.</Typography>
              ) : (
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie data={funnel} dataKey='count' nameKey='status' cx='50%' cy='50%' outerRadius={90} label={({ status, count }) => `${status}: ${count}`}>
                        {funnel.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
            <CardHeader title='Lead volume' subheader='Count by status' />
            <CardContent>
              {funnel.length === 0 ? (
                <Typography color='text.secondary'>No data.</Typography>
              ) : (
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={funnel} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='status' tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey='count' fill='#0288d1' name='Leads' radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
            <CardHeader title='Recent activity' subheader='Latest CRM events' />
            <CardContent>
              {activities.length === 0 ? (
                <Typography color='text.secondary'>No activities logged yet.</Typography>
              ) : (
                <List dense>
                  {activities.map((a) => (
                    <ListItem key={a.id} divider>
                      <ListItemText
                        primary={
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Chip size='small' label={a.type} variant='outlined' />
                            <Typography fontWeight={600}>{a.subject}</Typography>
                          </Stack>
                        }
                        secondary={new Date(a.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
