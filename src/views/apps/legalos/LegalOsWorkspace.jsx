'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import { Sparkles, X } from 'lucide-react'
import { lg } from './theme'

const AI_ACTIONS = [
  'AI Case Summary',
  'AI Draft Petition',
  'AI Contract Review',
  'AI Risk Analysis',
  'AI Judgment Search',
  'AI Legal Research',
  'AI Timeline Generator'
]

/**
 * LegalOS workspace inside WOXOX outlet — matches CRM background (light/dark).
 */
export default function LegalOsWorkspace({ children }) {
  const theme = useTheme()
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    const main = document.querySelector('main.ts-vertical-layout-content, main')
    if (!main) return undefined
    const prev = {
      max: main.style.maxInlineSize,
      margin: main.style.marginInline,
      width: main.style.inlineSize,
      padding: main.style.padding,
      bg: main.style.backgroundColor
    }
    main.style.maxInlineSize = 'none'
    main.style.marginInline = '0'
    main.style.inlineSize = '100%'
    main.style.padding = '0'
    main.style.backgroundColor = theme.palette.background.default
    return () => {
      main.style.maxInlineSize = prev.max
      main.style.marginInline = prev.margin
      main.style.inlineSize = prev.width
      main.style.padding = prev.padding
      main.style.backgroundColor = prev.bg
    }
  }, [theme.palette.background.default])

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 'calc(100dvh - 64px)',
        bgcolor: 'background.default',
        color: 'text.primary',
        fontFamily: lg.font,
        position: 'relative',
        overflow: 'auto'
      }}
    >
      {children}

      <Fab
        onClick={() => setAiOpen(true)}
        sx={{
          position: 'fixed',
          right: 28,
          bottom: 28,
          zIndex: 40,
          bgcolor: lg.gold,
          color: '#0B0B0C',
          fontWeight: 700,
          '&:hover': { bgcolor: lg.goldDark }
        }}
        aria-label='Legal AI Assistant'
      >
        <Sparkles size={22} />
      </Fab>

      <Drawer
        anchor='right'
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderLeft: theme => `1px solid ${theme.palette.divider}`
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ color: lg.gold, fontWeight: 700, fontSize: 12, letterSpacing: 2 }}>
              LEGAL AI
            </Typography>
            <Typography variant='h6' fontWeight={700}>
              Executive Assistant
            </Typography>
          </Box>
          <IconButton onClick={() => setAiOpen(false)} color='inherit'>
            <X size={18} />
          </IconButton>
        </Box>
        <Divider />
        <Stack spacing={1.5} sx={{ p: 3 }}>
          {AI_ACTIONS.map(label => (
            <Button
              key={label}
              fullWidth
              variant='outlined'
              sx={{
                justifyContent: 'flex-start',
                borderColor: 'divider',
                color: 'text.primary',
                borderRadius: '12px',
                py: 1.25,
                '&:hover': { borderColor: lg.gold, bgcolor: 'action.hover' }
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Drawer>
    </Box>
  )
}
