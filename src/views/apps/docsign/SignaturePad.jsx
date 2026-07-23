'use client'

import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function SignaturePad({ onChange, height = 160, label = 'Draw your signature' }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const hasInk = useRef(false)
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = height * ratio
    const ctx = canvas.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0f172a'
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, rect.width, height)
    hasInk.current = false
    setEmpty(true)
  }, [height])

  const pos = e => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const src = e.touches?.[0] || e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const start = e => {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const move = e => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    hasInk.current = true
    setEmpty(false)
  }

  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    if (!hasInk.current) {
      onChange?.(null)
      return
    }
    onChange?.(canvasRef.current.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, rect.width, height)
    hasInk.current = false
    setEmpty(true)
    onChange?.(null)
  }

  return (
    <Box>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: '#fff',
          touchAction: 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height, display: 'block', cursor: 'crosshair' }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </Box>
      <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
        <Button size='small' onClick={clear}>
          Clear
        </Button>
      </Stack>
    </Box>
  )
}
