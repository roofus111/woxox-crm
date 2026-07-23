'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { createEnvelope } from './api'

const emptyRecipient = (role = 'signer') => ({ name: '', email: '', role, order: 1 })
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function DocSignCreate() {
  const { lang } = useParams()
  const locale = lang || 'en'
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [signers, setSigners] = useState([{ ...emptyRecipient('signer'), order: 1 }])
  const [ccs, setCcs] = useState([])
  const [signingOrder, setSigningOrder] = useState(true)
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateSigner = (idx, patch) => {
    setSigners(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  const updateCc = (idx, patch) => {
    setCcs(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  const submit = async () => {
    setError('')
    if (!file) return setError('Choose a PDF to send for signature (max 25 MB)')
    if (file.size > 25 * 1024 * 1024) return setError('PDF must be 25 MB or smaller')
    if (!signers.length || signers.some(s => !s.name.trim() || !EMAIL_RE.test(s.email.trim()))) {
      return setError('Each signer needs a valid name and email')
    }
    if (ccs.some(s => !s.name.trim() || !EMAIL_RE.test(s.email.trim()))) {
      return setError('Each CC recipient needs a valid name and email')
    }
    setSaving(true)
    try {
      const recipients = [
        ...signers.map((s, i) => ({ ...s, role: 'signer', order: i + 1 })),
        ...ccs.map((s, i) => ({ ...s, role: 'cc', order: signers.length + i + 1 }))
      ]
      const envelope = await createEnvelope({
        file,
        title: title || file.name,
        message,
        signers: recipients,
        signingOrder,
        reminder: { enabled: reminderEnabled, intervalDays: 3, maxReminders: 5 },
        expiresAt: expiresAt || undefined
      })
      router.push(`/${locale}/apps/docsign/${envelope._id}`)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 760, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        New envelope
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        Upload a PDF, add signers (and optional CC), then place fields on the next screen.
      </Typography>

      <Paper variant='outlined' sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Button variant='outlined' component='label'>
            {file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : 'Upload PDF (max 25 MB)'}
            <input
              hidden
              type='file'
              accept='application/pdf,.pdf'
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </Button>
          <TextField
            label='Title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={file?.name || 'Agreement'}
            fullWidth
          />
          <TextField
            label='Message to signers'
            value={message}
            onChange={e => setMessage(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label='Expires on (optional)'
            type='date'
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Typography fontWeight={600}>Signers</Typography>
          {signers.map((s, idx) => (
            <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems='center'>
              <TextField
                size='small'
                label='Name'
                value={s.name}
                onChange={e => updateSigner(idx, { name: e.target.value })}
                fullWidth
              />
              <TextField
                size='small'
                label='Email'
                type='email'
                value={s.email}
                onChange={e => updateSigner(idx, { email: e.target.value })}
                fullWidth
              />
              <IconButton
                aria-label='Remove signer'
                disabled={signers.length === 1}
                onClick={() =>
                  setSigners(prev =>
                    prev.filter((_, i) => i !== idx).map((row, i) => ({ ...row, order: i + 1 }))
                  )
                }
              >
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Stack>
          ))}
          <Button
            onClick={() => setSigners(prev => [...prev, { ...emptyRecipient('signer'), order: prev.length + 1 }])}
            startIcon={<i className='ri-user-add-line' />}
          >
            Add signer
          </Button>

          <Typography fontWeight={600} sx={{ pt: 1 }}>
            CC (notified when complete)
          </Typography>
          {ccs.map((s, idx) => (
            <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems='center'>
              <TextField
                size='small'
                label='Name'
                value={s.name}
                onChange={e => updateCc(idx, { name: e.target.value })}
                fullWidth
              />
              <TextField
                size='small'
                label='Email'
                type='email'
                value={s.email}
                onChange={e => updateCc(idx, { email: e.target.value })}
                fullWidth
              />
              <IconButton
                aria-label='Remove CC'
                onClick={() => setCcs(prev => prev.filter((_, i) => i !== idx))}
              >
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Stack>
          ))}
          <Button
            onClick={() => setCcs(prev => [...prev, emptyRecipient('cc')])}
            startIcon={<i className='ri-mail-add-line' />}
          >
            Add CC
          </Button>

          <FormControlLabel
            control={
              <Checkbox checked={signingOrder} onChange={e => setSigningOrder(e.target.checked)} />
            }
            label='Sign in order (sequential)'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={reminderEnabled}
                onChange={e => setReminderEnabled(e.target.checked)}
              />
            }
            label='Auto-remind every 3 days'
          />

          {error && (
            <Typography color='error' variant='body2'>
              {error}
            </Typography>
          )}

          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button onClick={() => router.push(`/${locale}/apps/docsign`)}>Cancel</Button>
            <Button variant='contained' onClick={submit} disabled={saving}>
              {saving ? 'Creating…' : 'Continue to field placement'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
