'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const TaskManagerV2 = dynamic(() => import('@/views/apps/manager/TaskManagerV2'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
})

/** Legacy /manager/taskmanager route → Project Manager Lite task desk */
export default function TaskManagerPage() {
  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100dvh - 64px)', bgcolor: 'background.default' }}>
      <TaskManagerV2 />
    </Box>
  )
}
