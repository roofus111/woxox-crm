'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import { useSession } from 'next-auth/react'
import {
  addMilestone,
  archiveProject,
  getProject,
  linkTasks,
  prepareProjectsAuth,
  updateProject
} from '@/libs/projectsApi'
import { getApiBase, authHeaders } from '@/libs/apiAuth'

export default function ProjectDetailPage({ edition = 'max' }) {
  const params = useParams()
  const router = useRouter()
  const locale = params?.lang || 'en'
  const projectId = params?.projectId
  const home = edition === 'lite' ? '/apps/projects/lite' : '/apps/projects/max'
  const accent = edition === 'lite' ? '#00897b' : '#455a64'

  const { data: session, status: sessionStatus } = useSession()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      prepareProjectsAuth(session?.accessToken)
      const res = await getProject(projectId)
      setData(res)
    } catch (e) {
      setError(e.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!projectId || sessionStatus === 'loading') return
    prepareProjectsAuth(session?.accessToken)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, sessionStatus, session?.accessToken])

  const project = data?.project
  const tasks = data?.tasks || []

  const setStatus = async status => {
    setSaving(true)
    try {
      await updateProject(projectId, { status })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const onAddMilestone = async () => {
    if (!milestoneTitle.trim()) return
    setSaving(true)
    try {
      await addMilestone(projectId, { title: milestoneTitle.trim() })
      setMilestoneTitle('')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const onArchive = async () => {
    if (!window.confirm('Archive this project?')) return
    setSaving(true)
    try {
      await archiveProject(projectId)
      router.push(`/${locale}${home}/projects`)
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  const onLinkOpenTasks = async () => {
    setSaving(true)
    setError('')
    try {
      prepareProjectsAuth(session?.accessToken)
      const res = await fetch(`${getApiBase()}/api/tasks/getalltasks`, { headers: authHeaders() })
      const all = await res.json()
      if (!res.ok) throw new Error(all.message || 'Failed to load tasks')
      const unlinked = (Array.isArray(all) ? all : [])
        .filter(t => !t.projectId && t.status !== 'Completed' && t.status !== 'Cancelled')
        .map(t => t._id)
      if (!unlinked.length) {
        setError('No unlinked open tasks to attach')
        return
      }
      await linkTasks(projectId, unlinked)
      await load()
    } catch (e) {
      setError(e.message || 'Could not link tasks')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!project) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity='error'>{error || 'Project not found'}</Alert>
        <Button sx={{ mt: 2 }} component={Link} href={`/${locale}${home}`}>
          Back
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: 'calc(100dvh - 64px)' }}>
      <Button component={Link} href={`/${locale}${home}/projects`} size='small' sx={{ mb: 2 }}>
        ← Back to projects
      </Button>

      {error ? (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ color: accent, fontWeight: 700, fontSize: 12, letterSpacing: 1.2 }}>
            {edition === 'lite' ? 'LITE PROJECT' : 'MAX PROJECT'}
          </Typography>
          <Typography variant='h4' fontWeight={700}>
            {project.name}
          </Typography>
          <Typography color='text.secondary'>{project.description || 'No description'}</Typography>
          <Stack direction='row' spacing={1} sx={{ mt: 1 }} flexWrap='wrap' useFlexGap>
            <Chip label={project.status} size='small' />
            <Chip label={project.priority} size='small' variant='outlined' />
            {project.code ? <Chip label={project.code} size='small' variant='outlined' /> : null}
          </Stack>
        </Box>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Button
            variant='outlined'
            component={Link}
            href={`/${locale}${home === '/apps/projects/lite' ? '/apps/projects/lite' : '/apps/projects/max/tasks'}`}
          >
            Open tasks
          </Button>
          <TextField
            select
            size='small'
            label='Status'
            value={project.status}
            onChange={e => setStatus(e.target.value)}
            sx={{ minWidth: 140 }}
            disabled={saving}
          >
            {['planning', 'active', 'on_hold', 'completed', 'cancelled'].map(s => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Button color='error' variant='outlined' onClick={onArchive} disabled={saving}>
            Archive
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Members
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {(project.members || []).length === 0 ? (
                <Typography color='text.secondary' variant='body2'>
                  No members
                </Typography>
              ) : (
                project.members.map((m, i) => (
                  <Stack key={i} direction='row' justifyContent='space-between' sx={{ mb: 0.75 }}>
                    <Typography variant='body2'>{m.user?.name || m.user?.email || 'User'}</Typography>
                    <Chip size='small' label={m.role} />
                  </Stack>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Milestones
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                <TextField
                  size='small'
                  fullWidth
                  placeholder='New milestone'
                  value={milestoneTitle}
                  onChange={e => setMilestoneTitle(e.target.value)}
                />
                <Button variant='contained' sx={{ bgcolor: accent }} onClick={onAddMilestone} disabled={saving}>
                  Add
                </Button>
              </Stack>
              {(project.milestones || []).length === 0 ? (
                <Typography color='text.secondary' variant='body2'>
                  No milestones yet
                </Typography>
              ) : (
                project.milestones.map(ms => (
                  <Stack
                    key={ms._id}
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                    sx={{ py: 0.75, borderBottom: theme => `1px solid ${theme.palette.divider}` }}
                  >
                    <Typography variant='body2'>{ms.title}</Typography>
                    <Chip size='small' label={ms.status} />
                  </Stack>
                ))
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
                <Typography fontWeight={700}>Linked tasks ({tasks.length})</Typography>
                <Button size='small' variant='outlined' onClick={onLinkOpenTasks} disabled={saving}>
                  Link open tasks
                </Button>
              </Stack>
              <Divider sx={{ mb: 1.5 }} />
              {tasks.length === 0 ? (
                <Typography color='text.secondary' variant='body2'>
                  No tasks linked yet. Use “Link open tasks” to attach unassigned company tasks to this project.
                </Typography>
              ) : (
                tasks.map(t => (
                  <Stack
                    key={t._id}
                    direction='row'
                    justifyContent='space-between'
                    sx={{ py: 0.75, borderBottom: theme => `1px solid ${theme.palette.divider}` }}
                  >
                    <Typography variant='body2'>{t.title}</Typography>
                    <Chip size='small' label={t.status} />
                  </Stack>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
