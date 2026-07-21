'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import { useSession } from 'next-auth/react'
import { createProject, fetchWorkspaceSummary, listProjects, prepareProjectsAuth } from '@/libs/projectsApi'

const FEATURE_LINKS = [
  { title: 'Kanban', href: '/apps/kanban', icon: 'ri-kanban-view', color: '#1565c0' },
  { title: 'Doc Board', href: '/manager/documentation', icon: 'ri-file-list-3-line', color: '#6a1b9a' },
  { title: 'Task Desk', href: '/apps/projects/max/tasks', icon: 'ri-list-check-3', color: '#2e7d32' },
  { title: 'Pipelines', href: '/manager/pipeline', icon: 'ri-route-line', color: '#00838f' },
  { title: 'Doc Editor', href: '/manager/doceditor', icon: 'ri-file-edit-line', color: '#283593' },
  { title: 'Templates', href: '/manager/doctemplate', icon: 'ri-file-copy-2-line', color: '#4527a0' },
  { title: 'Lead Docs', href: '/manager/leaddoceditor', icon: 'ri-article-line', color: '#1a237e' },
  { title: 'Files', href: '/manager/myfiles', icon: 'ri-folder-3-line', color: '#f9a825' },
  { title: 'Tags', href: '/manager/tagSection', icon: 'ri-price-tag-3-line', color: '#ad1457' },
  { title: 'Team', href: '/manager/team', icon: 'ri-group-line', color: '#455a64' },
  { title: 'Chat', href: '/apps/chat', icon: 'ri-wechat-line', color: '#00897b' },
  { title: 'Follow-ups', href: '/manager/followup', icon: 'ri-calendar-schedule-line', color: '#ef6c00' },
  { title: 'Roles', href: '/apps/roles', icon: 'ri-lock-2-line', color: '#5d4037' },
  { title: 'Analytics', href: '/dashboards/analytics', icon: 'ri-line-chart-line', color: '#37474f' },
  { title: 'Calendar', href: '/apps/calendar', icon: 'ri-calendar-line', color: '#00695c' },
  { title: 'Activity', href: '/manager/activitylog', icon: 'ri-history-line', color: '#546e7a' }
]

export default function ProjectManagerMaxPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params?.lang || 'en'

  const { data: session, status: sessionStatus } = useSession()

  const [summary, setSummary] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    priority: 'medium',
    status: 'active'
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      prepareProjectsAuth(session?.accessToken)
      const [sum, list] = await Promise.all([
        fetchWorkspaceSummary('max'),
        listProjects({ edition: 'max' })
      ])
      setSummary(sum)
      setProjects(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e.message || 'Failed to load Max workspace — is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionStatus === 'loading') return
    prepareProjectsAuth(session?.accessToken)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.accessToken])

  const onCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const created = await createProject({ ...form, edition: 'max' })
      setOpenCreate(false)
      setForm({ name: '', code: '', description: '', priority: 'medium', status: 'active' })
      await load()
      if (created?._id) router.push(`/${locale}/apps/projects/max/projects/${created._id}`)
    } catch (e) {
      setError(e.message || 'Could not create project')
    } finally {
      setSaving(false)
    }
  }

  const counts = summary?.counts || {}
  const pipelines = summary?.pipelines || []

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: 'calc(100dvh - 64px)' }}>
      <Box sx={{ mb: 3, maxWidth: 960 }}>
        <Chip label='PROJECT MANAGER MAX' size='small' sx={{ mb: 1.5, fontWeight: 700, bgcolor: 'rgba(69,90,100,0.12)' }} />
        <Typography variant='h4' fontWeight={700} gutterBottom>
          Enterprise delivery operating system
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 2 }}>
          Real projects with members & milestones, live pipeline boards, task desk, documents, files, and JWT + product
          entitlement security on the API.
        </Typography>
        <Stack direction='row' spacing={1.5} flexWrap='wrap' useFlexGap>
          <Button variant='contained' sx={{ bgcolor: '#455a64' }} onClick={() => setOpenCreate(true)}>
            New Max Project
          </Button>
          <Button component={Link} href={`/${locale}/apps/projects/max/projects`} variant='outlined'>
            All Projects
          </Button>
          <Button component={Link} href={`/${locale}/apps/projects/max/tasks`} variant='outlined'>
            Task Desk
          </Button>
          <Button component={Link} href={`/${locale}/apps/kanban`} variant='outlined'>
            Kanban
          </Button>
          <Button component={Link} href={`/${locale}/apps/chat`} variant='outlined'>
            Chat
          </Button>
          <Button component={Link} href={`/${locale}/manager/pipeline`} variant='outlined'>
            Manage Pipelines
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(loading
          ? [1, 2, 3, 4, 5, 6]
          : [
              { label: 'Projects', value: counts.projects ?? 0, icon: 'ri-folder-chart-line', color: '#455a64' },
              { label: 'Active', value: counts.activeProjects ?? 0, icon: 'ri-play-circle-line', color: '#1565c0' },
              { label: 'Open tasks', value: counts.openTasks ?? 0, icon: 'ri-list-check-3', color: '#00897b' },
              { label: 'Overdue', value: counts.overdue ?? 0, icon: 'ri-alarm-warning-line', color: '#c62828' },
              { label: 'Done (7d)', value: counts.completedThisWeek ?? 0, icon: 'ri-checkbox-circle-line', color: '#2e7d32' },
              { label: 'Pipelines', value: counts.pipelines ?? 0, icon: 'ri-flow-chart', color: '#00838f' }
            ]
        ).map((k, i) => (
          <Grid item xs={6} md={4} lg={2} key={loading ? i : k.label}>
            {loading ? (
              <Skeleton variant='rounded' height={96} />
            ) : (
              <Card elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ color: k.color, mb: 0.5 }}>
                    <i className={k.icon} style={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant='h5' fontWeight={700}>
                    {k.value}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {k.label}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
          <Typography fontWeight={700} sx={{ fontSize: 15 }}>
            Max projects
          </Typography>
          <Stack direction='row' spacing={1}>
            <Button size='small' component={Link} href={`/${locale}/apps/projects/max/projects`}>
              View all
            </Button>
            <Button size='small' onClick={() => setOpenCreate(true)}>
              Create
            </Button>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map(i => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant='rounded' height={120} />
              </Grid>
            ))}
          </Grid>
        ) : projects.length === 0 ? (
          <Card elevation={0} sx={{ p: 3, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <Typography color='text.secondary' sx={{ mb: 1.5 }}>
              No Max projects yet. Create one to group tasks, members, milestones, and pipelines.
            </Typography>
            <Button variant='contained' sx={{ bgcolor: '#455a64' }} onClick={() => setOpenCreate(true)}>
              Create first project
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {projects.map(p => (
              <Grid item xs={12} sm={6} md={4} key={p._id}>
                <Card
                  component={Link}
                  href={`/${locale}/apps/projects/max/projects/${p._id}`}
                  elevation={0}
                  sx={{
                    height: '100%',
                    textDecoration: 'none',
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    '&:hover': { borderColor: '#455a64' }
                  }}
                >
                  <CardContent>
                    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
                      <Chip size='small' label={p.status} />
                      <Chip size='small' variant='outlined' label={p.priority} />
                    </Stack>
                    <Typography fontWeight={700} color='text.primary'>
                      {p.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }} noWrap>
                      {p.description || p.code || 'No description'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                      {(p.members?.length || 0)} members · {(p.milestones?.length || 0)} milestones
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography fontWeight={700} sx={{ mb: 1.5, fontSize: 15 }}>
          Live pipeline boards
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {pipelines.length === 0 ? (
          <Typography color='text.secondary'>No pipelines — create one under Manage Pipelines.</Typography>
        ) : (
          <Grid container spacing={2}>
            {pipelines.map(pipe => (
              <Grid item xs={12} sm={6} md={3} key={pipe._id}>
                <Card
                  component={Link}
                  href={`/${locale}/manager/workflow/${pipe._id}`}
                  elevation={0}
                  sx={{
                    textDecoration: 'none',
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    '&:hover': { borderColor: '#00838f' }
                  }}
                >
                  <CardContent>
                    <i className='ri-flow-chart' style={{ color: '#00838f', fontSize: 20 }} />
                    <Typography fontWeight={700} color='text.primary' sx={{ mt: 1 }}>
                      {pipe.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Open stage board
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight={700} sx={{ mb: 1.5, fontSize: 15 }}>
          Max toolset
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {FEATURE_LINKS.map(m => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={m.title}>
              <Card
                component={Link}
                href={`/${locale}${m.href}`}
                elevation={0}
                sx={{
                  height: '100%',
                  textDecoration: 'none',
                  border: theme => `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  '&:hover': { borderColor: m.color }
                }}
              >
                <CardContent>
                  <Box sx={{ color: m.color, mb: 1 }}>
                    <i className={m.icon} style={{ fontSize: 20 }} />
                  </Box>
                  <Typography fontWeight={700} color='text.primary' variant='body2'>
                    {m.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Create Max project</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <TextField
            label='Project name'
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            fullWidth
            autoFocus
          />
          <TextField
            label='Code'
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            fullWidth
            placeholder='e.g. DELIV-01'
          />
          <TextField
            label='Description'
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label='Priority'
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              fullWidth
            >
              {['low', 'medium', 'high', 'critical'].map(p => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label='Status'
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              fullWidth
            >
              {['planning', 'active', 'on_hold', 'completed'].map(p => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant='contained'
            disabled={saving || !form.name.trim()}
            onClick={onCreate}
            sx={{ bgcolor: '#455a64' }}
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
