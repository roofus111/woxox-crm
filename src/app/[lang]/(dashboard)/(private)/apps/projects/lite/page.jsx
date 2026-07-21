'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { createProject, fetchWorkspaceSummary, listProjects, prepareProjectsAuth } from '@/libs/projectsApi'

const TaskManagerV2 = dynamic(() => import('@/views/apps/manager/TaskManagerV2'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
})

const LITE_VIEWS = [
  { id: 'all-tasks', label: 'All Tasks', icon: 'ri-list-check-3' },
  { id: 'new-task', label: 'New Task', icon: 'ri-add-circle-line' },
  { id: 'calendar', label: 'Calendar', icon: 'ri-calendar-line' },
  { id: 'reports', label: 'Reports', icon: 'ri-bar-chart-box-line' }
]

const KPI = ({ label, value, color, icon }) => (
  <Card elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: `${color}18`,
          color
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
      </Box>
    </CardContent>
  </Card>
)

function LiteWorkspace() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const locale = params?.lang || 'en'
  const view = searchParams.get('view') || 'all-tasks'

  const { data: session, status: sessionStatus } = useSession()
  const [summary, setSummary] = useState(null)
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium' })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      prepareProjectsAuth(session?.accessToken)
      const [sum, list] = await Promise.all([
        fetchWorkspaceSummary('lite'),
        listProjects({ edition: 'lite' })
      ])
      setSummary(sum)
      setProjects(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e.message || 'Failed to load Lite workspace')
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

  const setView = id => router.push(`/${locale}/apps/projects/lite?view=${id}`)

  const onCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await createProject({ ...form, edition: 'lite', status: 'active' })
      setOpenCreate(false)
      setForm({ name: '', description: '', priority: 'medium' })
      await load()
    } catch (e) {
      setError(e.message || 'Could not create project')
    } finally {
      setSaving(false)
    }
  }

  const counts = summary?.counts || {}

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100dvh - 64px)', bgcolor: 'background.default' }}>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: 2,
          pb: 2,
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper'
        }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start' flexWrap='wrap' gap={2}>
          <Box>
            <Typography sx={{ color: '#00897b', fontWeight: 700, fontSize: 12, letterSpacing: 1.2 }}>
              PROJECT MANAGER LITE
            </Typography>
            <Typography variant='h5' fontWeight={700}>
              Task & project delivery desk
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Live KPIs from your company tasks, projects, and pipelines — secured by JWT + product entitlement.
            </Typography>
          </Box>
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            <Button variant='contained' sx={{ bgcolor: '#00897b' }} onClick={() => setOpenCreate(true)}>
              New Project
            </Button>
            <Button variant='outlined' onClick={() => router.push(`/${locale}/apps/projects/lite/projects`)}>
              All Projects
            </Button>
            <Button variant='outlined' onClick={() => router.push(`/${locale}/manager/pipeline`)}>
              Pipelines
            </Button>
            <Button variant='outlined' onClick={() => router.push(`/${locale}/apps/chat`)}>
              Chat
            </Button>
            <Button variant='outlined' onClick={() => router.push(`/${locale}/manager/followup`)}>
              Follow-ups
            </Button>
            <Button variant='outlined' onClick={() => router.push(`/${locale}/manager/myfiles`)}>
              Files
            </Button>
          </Stack>
        </Stack>

        {error ? (
          <Alert severity='error' sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        ) : null}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {loading
            ? [1, 2, 3, 4].map(i => (
                <Grid item xs={6} md={3} key={i}>
                  <Card elevation={0} sx={{ height: 88, border: theme => `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
                      <CircularProgress size={24} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : [
                { label: 'Open tasks', value: counts.openTasks ?? 0, color: '#00897b', icon: 'ri-list-check-3' },
                { label: 'Overdue', value: counts.overdue ?? 0, color: '#c62828', icon: 'ri-alarm-warning-line' },
                { label: 'Done this week', value: counts.completedThisWeek ?? 0, color: '#2e7d32', icon: 'ri-checkbox-circle-line' },
                { label: 'Active projects', value: counts.activeProjects ?? 0, color: '#1565c0', icon: 'ri-folder-chart-line' }
              ].map(k => (
                <Grid item xs={6} md={3} key={k.label}>
                  <KPI {...k} />
                </Grid>
              ))}
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
            <Typography fontWeight={700} sx={{ fontSize: 13 }}>
              Your Lite projects
            </Typography>
            <Button size='small' onClick={() => router.push(`/${locale}/apps/projects/lite/projects`)}>
              View all
            </Button>
          </Stack>
          {projects.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No projects yet — create one to group tasks and milestones.
            </Typography>
          ) : (
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {projects.slice(0, 8).map(p => (
                <Chip
                  key={p._id}
                  label={`${p.name} · ${p.status}`}
                  onClick={() => router.push(`/${locale}/apps/projects/lite/projects/${p._id}`)}
                  sx={{ borderRadius: '10px' }}
                  variant='outlined'
                />
              ))}
            </Stack>
          )}
        </Box>

        {(summary?.pipelines || []).length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 1, fontSize: 13 }}>
              Pipeline boards
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {summary.pipelines.slice(0, 8).map(pipe => (
                <Chip
                  key={pipe._id}
                  icon={<i className='ri-flow-chart' />}
                  label={pipe.name}
                  onClick={() => router.push(`/${locale}/manager/workflow/${pipe._id}`)}
                  sx={{ borderRadius: '10px' }}
                  color='primary'
                  variant='outlined'
                />
              ))}
            </Stack>
          </Box>
        ) : null}

        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mt: 2 }}>
          {LITE_VIEWS.map(v => (
            <Button
              key={v.id}
              size='small'
              variant={view === v.id ? 'contained' : 'outlined'}
              startIcon={<i className={v.icon} />}
              onClick={() => setView(v.id)}
              sx={{
                borderRadius: '10px',
                ...(view === v.id
                  ? { bgcolor: '#00897b', '&:hover': { bgcolor: '#00796b' } }
                  : { borderColor: 'divider', color: 'text.primary' })
              }}
            >
              {v.label}
            </Button>
          ))}
          <Button
            size='small'
            variant='outlined'
            startIcon={<i className='ri-price-tag-3-line' />}
            onClick={() => router.push(`/${locale}/manager/tagSection`)}
            sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.primary' }}
          >
            Tags
          </Button>
          <Button
            size='small'
            variant='outlined'
            startIcon={<i className='ri-group-line' />}
            onClick={() => router.push(`/${locale}/manager/team`)}
            sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.primary' }}
          >
            Team
          </Button>
          <Button
            size='small'
            variant='outlined'
            startIcon={<i className='ri-history-line' />}
            onClick={() => router.push(`/${locale}/manager/activitylog`)}
            sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.primary' }}
          >
            Activity
          </Button>
        </Stack>
      </Box>

      <TaskManagerV2 initialView={view} />

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Create Lite project</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <TextField
            label='Project name'
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            fullWidth
            autoFocus
          />
          <TextField
            label='Description'
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant='contained' disabled={saving || !form.name.trim()} onClick={onCreate} sx={{ bgcolor: '#00897b' }}>
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function ProjectManagerLitePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      }
    >
      <LiteWorkspace />
    </Suspense>
  )
}
