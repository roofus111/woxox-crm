'use client'

import dynamic from 'next/dynamic'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { Suspense } from 'react'

const TaskManagerV2 = dynamic(() => import('@/views/apps/manager/TaskManagerV2'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
})

const VIEWS = [
  { id: 'all-tasks', label: 'All Tasks', icon: 'ri-list-check-3' },
  { id: 'new-task', label: 'New Task', icon: 'ri-add-circle-line' },
  { id: 'calendar', label: 'Calendar', icon: 'ri-calendar-line' },
  { id: 'reports', label: 'Reports', icon: 'ri-bar-chart-box-line' }
]

function MaxTasksWorkspace() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const locale = params?.lang || 'en'
  const view = searchParams.get('view') || 'all-tasks'

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100dvh - 64px)', bgcolor: 'background.default' }}>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: 2,
          pb: 1,
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper'
        }}
      >
        <Typography sx={{ color: '#455a64', fontWeight: 700, fontSize: 12, letterSpacing: 1.2 }}>
          PROJECT MANAGER MAX · TASKS
        </Typography>
        <Typography variant='h5' fontWeight={700} sx={{ mb: 1.5 }}>
          Enterprise task desk
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mb: 1.5 }}>
          {VIEWS.map(v => (
            <Button
              key={v.id}
              size='small'
              variant={view === v.id ? 'contained' : 'outlined'}
              startIcon={<i className={v.icon} />}
              onClick={() => router.push(`/${locale}/apps/projects/max/tasks?view=${v.id}`)}
              sx={{
                borderRadius: '10px',
                ...(view === v.id
                  ? { bgcolor: '#455a64', '&:hover': { bgcolor: '#37474f' } }
                  : { borderColor: 'divider', color: 'text.primary' })
              }}
            >
              {v.label}
            </Button>
          ))}
          <Button
            size='small'
            variant='outlined'
            onClick={() => router.push(`/${locale}/apps/projects/max`)}
            sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.primary' }}
          >
            Max Dashboard
          </Button>
        </Stack>
      </Box>
      <TaskManagerV2 initialView={view} />
    </Box>
  )
}

export default function ProjectManagerMaxTasksPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      }
    >
      <MaxTasksWorkspace />
    </Suspense>
  )
}
