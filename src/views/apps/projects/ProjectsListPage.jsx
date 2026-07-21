'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import { createProject, listProjects, prepareProjectsAuth } from '@/libs/projectsApi'

export default function ProjectsListPage({ edition = 'lite' }) {
  const params = useParams()
  const router = useRouter()
  const locale = params?.lang || 'en'
  const { data: session, status: sessionStatus } = useSession()
  const accent = edition === 'lite' ? '#00897b' : '#455a64'
  const home = edition === 'lite' ? '/apps/projects/lite' : '/apps/projects/max'
  const detailBase = `${home}/projects`

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
      const list = await listProjects({ edition })
      setProjects(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionStatus === 'loading') return
    prepareProjectsAuth(session?.accessToken)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edition, sessionStatus, session?.accessToken])

  const onCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      prepareProjectsAuth(session?.accessToken)
      const created = await createProject({ ...form, edition })
      setOpenCreate(false)
      setForm({ name: '', code: '', description: '', priority: 'medium', status: 'active' })
      if (created?._id) {
        router.push(`/${locale}${detailBase}/${created._id}`)
      } else {
        await load()
      }
    } catch (e) {
      setError(e.message || 'Could not create project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: 'calc(100dvh - 64px)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ color: accent, fontWeight: 700, fontSize: 12, letterSpacing: 1.2 }}>
            {edition === 'lite' ? 'PROJECT MANAGER LITE' : 'PROJECT MANAGER MAX'}
          </Typography>
          <Typography variant='h4' fontWeight={700}>
            Projects
          </Typography>
          <Typography color='text.secondary'>
            Create and open delivery projects with milestones, members, and linked tasks.
          </Typography>
        </Box>
        <Stack direction='row' spacing={1}>
          <Button component={Link} href={`/${locale}${home}`} variant='outlined'>
            Dashboard
          </Button>
          <Button variant='contained' sx={{ bgcolor: accent }} onClick={() => setOpenCreate(true)}>
            New Project
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant='rounded' height={140} />
            </Grid>
          ))}
        </Grid>
      ) : projects.length === 0 ? (
        <Card elevation={0} sx={{ p: 4, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
          <Typography color='text.secondary' sx={{ mb: 2 }}>
            No {edition} projects yet.
          </Typography>
          <Button variant='contained' sx={{ bgcolor: accent }} onClick={() => setOpenCreate(true)}>
            Create first project
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {projects.map(p => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <Card
                component={Link}
                href={`/${locale}${detailBase}/${p._id}`}
                elevation={0}
                sx={{
                  height: '100%',
                  textDecoration: 'none',
                  border: theme => `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  '&:hover': { borderColor: accent }
                }}
              >
                <CardContent>
                  <Stack direction='row' justifyContent='space-between' sx={{ mb: 1 }}>
                    <Chip size='small' label={p.status} />
                    <Chip size='small' variant='outlined' label={p.priority} />
                  </Stack>
                  <Typography fontWeight={700} color='text.primary'>
                    {p.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' noWrap sx={{ mt: 0.5 }}>
                    {p.description || p.code || 'No description'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1.5, display: 'block' }}>
                    {(p.members?.length || 0)} members · {(p.milestones?.length || 0)} milestones
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Create {edition === 'lite' ? 'Lite' : 'Max'} project</DialogTitle>
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
            sx={{ bgcolor: accent }}
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
