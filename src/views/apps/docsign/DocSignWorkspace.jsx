'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import {
  deleteEnvelope,
  getEnvelope,
  remindEnvelope,
  sendEnvelope,
  STATUS_COLOR,
  updateEnvelope,
  voidEnvelope
} from './api'

const FIELD_TYPES = [
  { value: 'signature', label: 'Signature', w: 28, h: 8 },
  { value: 'initials', label: 'Initials', w: 12, h: 6 },
  { value: 'name', label: 'Full name', w: 24, h: 5 },
  { value: 'date', label: 'Date', w: 16, h: 5 },
  { value: 'text', label: 'Text', w: 24, h: 5 }
]

const SIGNER_COLORS = ['#0f766e', '#1d4ed8', '#b45309', '#7c3aed', '#be123c', '#047857']

function newFieldId() {
  return `fld_${Math.random().toString(36).slice(2, 10)}`
}

export default function DocSignWorkspace() {
  const { lang, id } = useParams()
  const locale = lang || 'en'
  const router = useRouter()
  const [envelope, setEnvelope] = useState(null)
  const [fields, setFields] = useState([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [pageImage, setPageImage] = useState('')
  const [activeSignerId, setActiveSignerId] = useState('')
  const [placeType, setPlaceType] = useState('signature')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const canvasWrapRef = useRef(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await getEnvelope(id)
      setEnvelope(data)
      setFields(data.fields || [])
      setPageCount(data.document?.pageCount || 1)
      setActiveSignerId(data.signers?.find(s => s.role === 'signer')?._id || '')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load')
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    async function renderPage() {
      if (!envelope?.document?.fileUrl) return
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf')
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
        const loadingTask = pdfjs.getDocument(envelope.document.fileUrl)
        const pdf = await loadingTask.promise
        const count = pdf.numPages
        if (!cancelled) setPageCount(count)
        const pdfPage = await pdf.getPage(page)
        const viewport = pdfPage.getViewport({ scale: 1.35 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        if (!cancelled) setPageImage(canvas.toDataURL('image/png'))
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Could not render PDF preview. Check the document URL.')
      }
    }
    renderPage()
    return () => {
      cancelled = true
    }
  }, [envelope?.document?.fileUrl, page])

  const signerColor = useMemo(() => {
    const map = {}
    ;(envelope?.signers || [])
      .filter(s => s.role === 'signer')
      .forEach((s, i) => {
        map[String(s._id)] = SIGNER_COLORS[i % SIGNER_COLORS.length]
      })
    return map
  }, [envelope])

  const pageFields = fields.filter(f => Number(f.page) === Number(page))

  const placeField = e => {
    if (envelope?.status !== 'draft') return
    if (!activeSignerId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    const meta = FIELD_TYPES.find(t => t.value === placeType) || FIELD_TYPES[0]
    const width = meta.w
    const height = meta.h
    setFields(prev => [
      ...prev,
      {
        fieldId: newFieldId(),
        type: placeType,
        signerId: activeSignerId,
        page,
        x: Math.max(0, Math.min(100 - width, xPct - width / 2)),
        y: Math.max(0, Math.min(100 - height, yPct - height / 2)),
        width,
        height,
        required: true,
        label: meta.label
      }
    ])
  }

  const removeField = fieldId => {
    setFields(prev => prev.filter(f => f.fieldId !== fieldId))
  }

  const saveFields = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const updated = await updateEnvelope(id, {
        fields,
        documentPageCount: pageCount
      })
      setEnvelope(updated)
      setFields(updated.fields || fields)
      setNotice('Fields saved')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const doSend = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await updateEnvelope(id, { fields, documentPageCount: pageCount })
      const { envelope: updated } = await sendEnvelope(id)
      setEnvelope(updated)
      setNotice('Envelope sent to signers')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Send failed')
    } finally {
      setBusy(false)
    }
  }

  const doRemind = async () => {
    setBusy(true)
    try {
      const { envelope: updated } = await remindEnvelope(id)
      setEnvelope(updated)
      setNotice('Reminder sent')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Reminder failed')
    } finally {
      setBusy(false)
    }
  }

  const doVoid = async () => {
    if (!window.confirm('Void this envelope? Signers will no longer be able to sign.')) return
    setBusy(true)
    try {
      const updated = await voidEnvelope(id)
      setEnvelope(updated)
      setNotice('Envelope voided')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Void failed')
    } finally {
      setBusy(false)
    }
  }

  const doDelete = async () => {
    if (!window.confirm('Delete this draft?')) return
    await deleteEnvelope(id)
    router.push(`/${locale}/apps/docsign`)
  }

  if (!envelope && !error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading envelope…</Typography>
      </Box>
    )
  }

  const isDraft = envelope?.status === 'draft'

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent='space-between'
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Button component={Link} href={`/${locale}/apps/docsign`} size='small' sx={{ mb: 1 }}>
            ← All envelopes
          </Button>
          <Typography variant='h4' fontWeight={700}>
            {envelope?.title}
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 1 }}>
            <Chip size='small' label={envelope?.status} color={STATUS_COLOR[envelope?.status]} />
            {envelope?.document?.originalName && (
              <Typography variant='body2' color='text.secondary'>
                {envelope.document.originalName}
              </Typography>
            )}
          </Stack>
        </Box>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          {isDraft && (
            <>
              <Button variant='outlined' disabled={busy} onClick={saveFields}>
                Save fields
              </Button>
              <Button variant='contained' disabled={busy} onClick={doSend}>
                Send for signature
              </Button>
              <Button color='error' disabled={busy} onClick={doDelete}>
                Delete
              </Button>
            </>
          )}
          {envelope?.status === 'sent' && (
            <>
              <Button variant='outlined' disabled={busy} onClick={doRemind}>
                Send reminder
              </Button>
              <Button color='warning' disabled={busy} onClick={doVoid}>
                Void
              </Button>
            </>
          )}
          {envelope?.signedDocument?.fileUrl && (
            <Button
              component='a'
              href={envelope.signedDocument.fileUrl}
              target='_blank'
              rel='noreferrer'
              variant='contained'
            >
              Download signed PDF
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity='success' sx={{ mb: 2 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems='flex-start'>
        <Paper variant='outlined' sx={{ p: 2, width: { xs: '100%', lg: 280 }, flexShrink: 0 }}>
          {isDraft && (
            <>
              <Typography fontWeight={600} gutterBottom>
                Place fields
              </Typography>
              <TextField
                select
                size='small'
                fullWidth
                label='Signer'
                value={activeSignerId}
                onChange={e => setActiveSignerId(e.target.value)}
                sx={{ mb: 1.5 }}
              >
                {(envelope.signers || [])
                  .filter(s => s.role === 'signer')
                  .map(s => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                size='small'
                fullWidth
                label='Field type'
                value={placeType}
                onChange={e => setPlaceType(e.target.value)}
                sx={{ mb: 1.5 }}
              >
                {FIELD_TYPES.map(t => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 2 }}>
                Click on the document to place the selected field.
              </Typography>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Typography fontWeight={600} gutterBottom>
            Signers
          </Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {(envelope?.signers || []).map(s => (
              <Box key={s._id} sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' fontWeight={600}>
                    {s.order}. {s.name}
                  </Typography>
                  <Chip size='small' label={s.status} />
                </Stack>
                <Typography variant='caption' color='text.secondary'>
                  {s.email}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Typography fontWeight={600} gutterBottom>
            Audit trail
          </Typography>
          <Stack spacing={0.75} sx={{ maxHeight: 240, overflow: 'auto' }}>
            {[...(envelope?.audit || [])].reverse().map((a, idx) => (
              <Box key={idx}>
                <Typography variant='caption' display='block'>
                  <strong>{a.action}</strong> — {a.actorName || a.actorEmail || 'system'}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {a.at ? new Date(a.at).toLocaleString() : ''}
                </Typography>
              </Box>
            ))}
            {!envelope?.audit?.length && (
              <Typography variant='caption' color='text.secondary'>
                No events yet
              </Typography>
            )}
          </Stack>
        </Paper>

        <Paper variant='outlined' sx={{ p: 2, flex: 1, width: '100%' }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
            <Typography fontWeight={600}>Document</Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Button size='small' disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Prev
              </Button>
              <Typography variant='body2'>
                Page {page} / {pageCount}
              </Typography>
              <Button
                size='small'
                disabled={page >= pageCount}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>

          <Box
            ref={canvasWrapRef}
            onClick={placeField}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 820,
              mx: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#f8fafc',
              cursor: isDraft ? 'crosshair' : 'default',
              minHeight: 320
            }}
          >
            {pageImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pageImage} alt={`Page ${page}`} style={{ width: '100%', display: 'block' }} />
            ) : (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography color='text.secondary'>Rendering PDF…</Typography>
              </Box>
            )}
            {pageFields.map(f => (
              <Box
                key={f.fieldId}
                onClick={e => {
                  e.stopPropagation()
                  if (isDraft) removeField(f.fieldId)
                }}
                title={isDraft ? 'Click to remove' : f.label}
                sx={{
                  position: 'absolute',
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  width: `${f.width}%`,
                  height: `${f.height}%`,
                  border: '2px solid',
                  borderColor: signerColor[String(f.signerId)] || '#0f766e',
                  bgcolor: 'rgba(15,118,110,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: signerColor[String(f.signerId)] || '#0f766e',
                  pointerEvents: isDraft ? 'auto' : 'none'
                }}
              >
                {f.label || f.type}
              </Box>
            ))}
          </Box>
        </Paper>
      </Stack>
    </Box>
  )
}
