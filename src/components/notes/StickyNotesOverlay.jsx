'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, IconButton, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import {
  bridgeCrmPlatformWithLegacyToken,
  convertStickyToNote,
  createSticky,
  deleteSticky,
  duplicateSticky,
  fetchStickies,
  getCrmPlatformToken,
  updateSticky,
  upsertStickyPosition,
} from '@/libs/crmPlatformApi'

const COLORS = ['#FFF59D', '#90CAF9', '#F48FB1', '#A5D6A7', '#FFCC80', '#CE93D8', '#FFFFFF', '#424242']

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

function StickyCard({ sticky, onChange, onDelete, onDuplicate, onConvert, onMoveEnd }) {
  const pos = sticky.positions?.[0] || { x: 80, y: 80, width: 240, height: 200 }
  const drag = useRef(null)
  const [local, setLocal] = useState({ x: pos.x, y: pos.y })

  useEffect(() => {
    setLocal({ x: pos.x, y: pos.y })
  }, [pos.x, pos.y])

  const onPointerDown = e => {
    if (e.target.closest('[data-no-drag]')) return
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: local.x,
      origY: local.y,
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = e => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    setLocal({
      x: Math.max(0, drag.current.origX + dx),
      y: Math.max(0, drag.current.origY + dy),
    })
  }

  const onPointerUp = () => {
    if (!drag.current) return
    drag.current = null
    onMoveEnd(sticky.id, local.x, local.y, pos.width, pos.height)
  }

  const dark = sticky.color === '#424242'

  return (
    <Box
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      sx={{
        position: 'fixed',
        left: local.x,
        top: local.y,
        width: pos.width || 240,
        minHeight: pos.height || 180,
        zIndex: 1200,
        bgcolor: sticky.color || '#FFF59D',
        color: dark ? '#fff' : '#222',
        borderRadius: 2,
        boxShadow: 4,
        p: 1.5,
        cursor: 'grab',
        resize: 'both',
        overflow: 'auto',
      }}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
        <TextField
          data-no-drag
          variant='standard'
          value={sticky.title || ''}
          onChange={e => onChange(sticky.id, { title: e.target.value })}
          InputProps={{ disableUnderline: true, sx: { fontWeight: 700, color: 'inherit' } }}
          sx={{ flex: 1 }}
        />
        <IconButton data-no-drag size='small' onClick={() => onDuplicate(sticky.id)}>
          <i className='ri-file-copy-line' />
        </IconButton>
        <IconButton data-no-drag size='small' onClick={() => onConvert(sticky.id)}>
          <i className='ri-sticky-note-line' />
        </IconButton>
        <IconButton data-no-drag size='small' onClick={() => onDelete(sticky.id)}>
          <i className='ri-close-line' />
        </IconButton>
      </Stack>
      <TextField
        data-no-drag
        multiline
        minRows={4}
        fullWidth
        variant='standard'
        value={sticky.content || ''}
        onChange={e => onChange(sticky.id, { content: e.target.value })}
        InputProps={{ disableUnderline: true, sx: { color: 'inherit' } }}
        placeholder='Write something…'
      />
      <Stack direction='row' spacing={0.5} sx={{ mt: 1 }} data-no-drag>
        {COLORS.map(c => (
          <Box
            key={c}
            onClick={() => onChange(sticky.id, { color: c })}
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              bgcolor: c,
              border: sticky.color === c ? '2px solid #1976d2' : '1px solid #999',
              cursor: 'pointer',
            }}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default function StickyNotesOverlay({ pageKey = 'dashboard' }) {
  const [stickies, setStickies] = useState([])
  const saveTimers = useRef({})

  const load = useCallback(async () => {
    try {
      const ok = await ensurePlatformAuth()
      if (!ok) return
      const items = await fetchStickies(pageKey)
      setStickies(Array.isArray(items) ? items : [])
    } catch (err) {
      console.warn('Stickies load failed', err)
    }
  }, [pageKey])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleCreate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const handleCreate = async () => {
    try {
      const ok = await ensurePlatformAuth()
      if (!ok) {
        toast.error('Platform session required for sticky notes')
        return
      }
      const created = await createSticky({ title: 'Sticky', content: '' })
      setStickies(prev => [created, ...prev])
    } catch (err) {
      toast.error(err.message || 'Could not create sticky')
    }
  }

  const handleChange = (id, patch) => {
    setStickies(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id])
    saveTimers.current[id] = setTimeout(async () => {
      try {
        await updateSticky(id, patch)
      } catch (err) {
        console.warn(err)
      }
    }, 800)
  }

  const handleMoveEnd = async (id, x, y, width, height) => {
    setStickies(prev =>
      prev.map(s => {
        if (s.id !== id) return s
        const positions = [{ ...(s.positions?.[0] || {}), x, y, width, height, pageKey }]
        return { ...s, positions }
      })
    )
    try {
      await upsertStickyPosition(id, { pageKey, x, y, width, height })
    } catch (err) {
      console.warn(err)
    }
  }

  const handleDelete = async id => {
    try {
      await deleteSticky(id)
      setStickies(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDuplicate = async id => {
    try {
      const copy = await duplicateSticky(id)
      setStickies(prev => [copy, ...prev])
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleConvert = async id => {
    try {
      await convertStickyToNote(id)
      toast.success('Converted to note')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <Box sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1300 }}>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleCreate}>
          Sticky
        </Button>
      </Box>
      {stickies.map(s => (
        <StickyCard
          key={s.id}
          sticky={s}
          onChange={handleChange}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onConvert={handleConvert}
          onMoveEnd={handleMoveEnd}
        />
      ))}
    </>
  )
}

export function MyStickyNotesWidget() {
  const [items, setItems] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const ok = await ensurePlatformAuth()
        if (!ok) return
        const list = await fetchStickies('dashboard')
        setItems((list || []).slice(0, 5))
      } catch {
        /* ignore */
      }
    })()
  }, [])

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
        <Typography fontWeight={700}>My Sticky Notes</Typography>
        <Select size='small' displayEmpty value='' sx={{ minWidth: 120 }} disabled>
          <MenuItem value=''>Quick view</MenuItem>
        </Select>
      </Stack>
      {items.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          No stickies yet. Use the Sticky button on the dashboard.
        </Typography>
      ) : (
        items.map(s => (
          <Box key={s.id} sx={{ p: 1, mb: 1, borderRadius: 1, bgcolor: s.color || '#FFF59D' }}>
            <Typography fontWeight={600}>{s.title}</Typography>
            <Typography variant='body2' noWrap>
              {s.content}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  )
}
