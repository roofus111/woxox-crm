'use client'

import { useEffect, useState } from 'react'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import {
  bridgeCrmPlatformWithLegacyToken,
  createNote,
  fetchNotes,
  getCrmPlatformToken,
} from '@/libs/crmPlatformApi'

async function ensurePlatformAuth() {
  if (getCrmPlatformToken()) return true
  const legacy = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!legacy) return false
  try {
    await bridgeCrmPlatformWithLegacyToken(legacy)
    return Boolean(getCrmPlatformToken())
  } catch {
    return false
  }
}

/** Linked notes list for a CRM entity (Lead, Deal, etc.) */
export default function EntityNotesPanel({ entityType = 'Lead', entityId, entityLabel }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const ok = await ensurePlatformAuth()
      if (!ok || !entityId) {
        setItems([])
        return
      }
      const data = await fetchNotes({ entityType, entityId, limit: 20 })
      setItems(data.items || [])
    } catch (err) {
      console.warn(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [entityType, entityId])

  const handleAdd = async () => {
    try {
      const ok = await ensurePlatformAuth()
      if (!ok) {
        toast.error('Platform session required')
        return
      }
      await createNote({
        title: entityLabel ? `Note · ${entityLabel}` : 'Linked note',
        contentHtml: '<p></p>',
        links: [{ entityType, entityId, label: entityLabel }],
      })
      toast.success('Note created')
      load()
    } catch (err) {
      toast.error(err.message || 'Could not create note')
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={22} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 1 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
        <Typography fontWeight={700}>Notes</Typography>
        <Button size='small' variant='contained' onClick={handleAdd}>
          Add note
        </Button>
      </Stack>
      {items.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          No linked notes yet
        </Typography>
      ) : (
        items.map(n => (
          <Box
            key={n.id}
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderLeft: `4px solid ${n.color || '#FFF59D'}`,
            }}
          >
            <Typography fontWeight={600}>{n.title}</Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              dangerouslySetInnerHTML={{
                __html: (n.contentHtml || '').slice(0, 180),
              }}
            />
          </Box>
        ))
      )}
    </Box>
  )
}
