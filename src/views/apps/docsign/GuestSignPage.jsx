'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SignaturePad from './SignaturePad'
import {
  absoluteApiUrl,
  declinePublicEnvelope,
  getPublicEnvelope,
  loadPdfBlobUrl,
  markPublicViewed,
  signPublicEnvelope
} from './api'

export default function GuestSignPage() {
  const { token } = useParams()
  const [session, setSession] = useState(null)
  const [page, setPage] = useState(1)
  const [pageImage, setPageImage] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [pdfBlobUrl, setPdfBlobUrl] = useState('')
  const [values, setValues] = useState({})
  const [activeField, setActiveField] = useState(null)
  const [sigData, setSigData] = useState(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [pdfError, setPdfError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const data = await getPublicEnvelope(token)
        if (cancelled) return
        setSession(data)
        setPageCount(data.document?.pageCount || 1)
        if (data.signer?.status === 'signed' || data.status === 'completed') setDone(true)
        if (data.status === 'sent' && !['signed', 'declined'].includes(data.signer?.status)) {
          try {
            const viewed = await markPublicViewed(token)
            if (!cancelled) setSession(viewed)
          } catch {
            /* ignore view errors on finished envelopes */
          }
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || err.message || 'Link invalid')
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    let revoked = false
    let objectUrl = ''
    async function loadPdf() {
      if (!token) return
      try {
        setPdfError('')
        objectUrl = await loadPdfBlobUrl(`/api/docsign/public/${token}/file`)
        if (!revoked) setPdfBlobUrl(objectUrl)
      } catch (err) {
        console.error(err)
        if (!revoked) setPdfError('Could not load the PDF. Ask the sender to resend the link.')
      }
    }
    loadPdf()
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [token])

  useEffect(() => {
    let cancelled = false
    async function renderPage() {
      if (!pdfBlobUrl) return
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf')
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
        const pdf = await pdfjs.getDocument(pdfBlobUrl).promise
        if (!cancelled) setPageCount(pdf.numPages)
        const pdfPage = await pdf.getPage(page)
        const viewport = pdfPage.getViewport({ scale: 1.25 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        if (!cancelled) setPageImage(canvas.toDataURL('image/png'))
      } catch (err) {
        console.error(err)
        if (!cancelled) setPdfError('Could not render this PDF page.')
      }
    }
    renderPage()
    return () => {
      cancelled = true
    }
  }, [pdfBlobUrl, page])

  const pageFields = useMemo(
    () => (session?.fields || []).filter(f => Number(f.page) === Number(page)),
    [session, page]
  )
  const pageOverlays = useMemo(
    () => (session?.overlayFields || []).filter(f => Number(f.page) === Number(page)),
    [session, page]
  )

  const openField = field => {
    if (!session?.canSign || done) return
    setActiveField(field)
    setSigData(values[field.fieldId] || null)
  }

  const applyFieldValue = () => {
    if (!activeField) return
    let value = ''
    if (activeField.type === 'signature' || activeField.type === 'initials') {
      if (!sigData) return setError('Please draw your signature')
      value = sigData
    } else if (activeField.type === 'date') {
      value = values[activeField.fieldId] || new Date().toLocaleDateString()
    } else if (activeField.type === 'name') {
      value = values[activeField.fieldId] || session.signer?.name || ''
    } else {
      value = values[activeField.fieldId] || ''
    }
    if (!value) return setError('Please fill this field')
    setValues(prev => ({ ...prev, [activeField.fieldId]: value }))
    setActiveField(null)
    setError('')
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const fields = (session.fields || []).map(f => ({
        fieldId: f.fieldId,
        value: values[f.fieldId] || ''
      }))
      const result = await signPublicEnvelope(token, fields)
      setSession(result)
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Sign failed')
    } finally {
      setBusy(false)
    }
  }

  const decline = async () => {
    setBusy(true)
    try {
      const result = await declinePublicEnvelope(token, declineReason)
      setSession(result)
      setDeclineOpen(false)
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Decline failed')
    } finally {
      setBusy(false)
    }
  }

  if (error && !session) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 480 }}>
          <Typography variant='h5' fontWeight={700} gutterBottom>
            Unable to open document
          </Typography>
          <Typography color='text.secondary'>{error}</Typography>
        </Paper>
      </Box>
    )
  }

  if (!session) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Typography>Loading document…</Typography>
      </Box>
    )
  }

  const signedDownload = absoluteApiUrl(session.signedDocumentUrl)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', py: 3, px: 2 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant='overline' color='text.secondary'>
            WOXOX Doc Sign
          </Typography>
          <Typography variant='h4' fontWeight={700}>
            {session.title}
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 1 }}>
            Signing as <strong>{session.signer?.name}</strong> ({session.signer?.email})
          </Typography>
          {session.message && <Typography sx={{ mt: 2 }}>{session.message}</Typography>}
          {!session.canSign && !done && (
            <Alert severity='info' sx={{ mt: 2 }}>
              {session.waitingReason || 'This link is not open for signing right now.'}
            </Alert>
          )}
          {done && (
            <Alert severity='success' sx={{ mt: 2 }}>
              {session.signer?.status === 'declined'
                ? 'You declined this document.'
                : 'Thanks — your signature was recorded.'}
              {signedDownload && (
                <>
                  {' '}
                  <a href={signedDownload} target='_blank' rel='noreferrer'>
                    Download signed PDF
                  </a>
                </>
              )}
            </Alert>
          )}
          {error && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {pdfError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {pdfError}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
            <Typography fontWeight={600}>Document</Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Button size='small' disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Prev
              </Button>
              <Typography variant='body2'>
                Page {page}/{pageCount}
              </Typography>
              <Button size='small' disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </Stack>
          </Stack>
          <Box sx={{ position: 'relative', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            {pageImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pageImage} alt={`Page ${page}`} style={{ width: '100%', display: 'block' }} />
            ) : (
              <Box sx={{ p: 6, textAlign: 'center' }}>{pdfError || 'Rendering…'}</Box>
            )}
            {pageOverlays.map(f => (
              <Box
                key={`ov-${f.fieldId}`}
                sx={{
                  position: 'absolute',
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  width: `${f.width}%`,
                  height: `${f.height}%`,
                  border: '1px solid #94a3b8',
                  bgcolor: 'rgba(148,163,184,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}
              >
                {f.type === 'signature' || f.type === 'initials' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.value} alt='' style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                  <Typography variant='caption'>{f.value}</Typography>
                )}
              </Box>
            ))}
            {pageFields.map(f => (
              <Box
                key={f.fieldId}
                onClick={() => openField(f)}
                sx={{
                  position: 'absolute',
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  width: `${f.width}%`,
                  height: `${f.height}%`,
                  border: '2px dashed',
                  borderColor: values[f.fieldId] ? '#0f766e' : '#0369a1',
                  bgcolor: values[f.fieldId] ? 'rgba(15,118,110,0.1)' : 'rgba(3,105,161,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: session.canSign && !done ? 'pointer' : 'default',
                  overflow: 'hidden'
                }}
              >
                {values[f.fieldId] && (f.type === 'signature' || f.type === 'initials') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={values[f.fieldId]}
                    alt='signature'
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                ) : (
                  values[f.fieldId] || f.label || f.type
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        {session.canSign && !done && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent='flex-end'>
            <Button color='inherit' onClick={() => setDeclineOpen(true)} disabled={busy}>
              Decline
            </Button>
            <Button variant='contained' onClick={submit} disabled={busy}>
              {busy ? 'Submitting…' : 'Finish signing'}
            </Button>
          </Stack>
        )}
      </Box>

      <Dialog open={Boolean(activeField)} onClose={() => setActiveField(null)} fullWidth maxWidth='sm'>
        <DialogTitle>{activeField?.label || activeField?.type}</DialogTitle>
        <DialogContent>
          {(activeField?.type === 'signature' || activeField?.type === 'initials') && (
            <SignaturePad
              label={activeField?.type === 'initials' ? 'Draw initials' : 'Draw signature'}
              onChange={setSigData}
            />
          )}
          {activeField?.type === 'name' && (
            <TextField
              fullWidth
              label='Full name'
              value={values[activeField.fieldId] ?? session.signer?.name ?? ''}
              onChange={e =>
                setValues(prev => ({ ...prev, [activeField.fieldId]: e.target.value }))
              }
              sx={{ mt: 1 }}
            />
          )}
          {activeField?.type === 'date' && (
            <TextField
              fullWidth
              label='Date'
              value={values[activeField.fieldId] ?? new Date().toLocaleDateString()}
              onChange={e =>
                setValues(prev => ({ ...prev, [activeField.fieldId]: e.target.value }))
              }
              sx={{ mt: 1 }}
            />
          )}
          {activeField?.type === 'text' && (
            <TextField
              fullWidth
              label='Text'
              value={values[activeField.fieldId] || ''}
              onChange={e =>
                setValues(prev => ({ ...prev, [activeField.fieldId]: e.target.value }))
              }
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActiveField(null)}>Cancel</Button>
          <Button variant='contained' onClick={applyFieldValue}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={declineOpen} onClose={() => setDeclineOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Decline to sign</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label='Reason (optional)'
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineOpen(false)}>Cancel</Button>
          <Button color='error' variant='contained' onClick={decline} disabled={busy}>
            Decline
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
