'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getMailStatus, listEnvelopes, STATUS_COLOR } from './api'

export default function DocSignDashboard() {
  const { lang } = useParams()
  const locale = lang || 'en'
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mail, setMail] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [data, mailStatus] = await Promise.all([
        listEnvelopes({ status: status || undefined, q: q || undefined }),
        getMailStatus().catch(() => null)
      ])
      setItems(data.items || [])
      setMail(mailStatus)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load envelopes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant='h4' fontWeight={700}>
            Doc Sign
          </Typography>
          <Typography color='text.secondary'>
            Multi-signer envelopes, field placement, email invites, and audit trail.
          </Typography>
        </Box>
        <Button
          variant='contained'
          component={Link}
          href={`/${locale}/apps/docsign/new`}
          startIcon={<i className='ri-add-line' />}
        >
          New envelope
        </Button>
      </Stack>

      {mail && !mail.ready && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          Email is not connected for Doc Sign. Connect a mailbox under{' '}
          <strong>Email → SMTP Settings</strong> so invites can be sent. You can still copy signing
          links after sending.
        </Alert>
      )}
      {mail?.ready && (
        <Alert severity='success' sx={{ mb: 2 }}>
          Mail ready — sending as {mail.fromName ? `${mail.fromName} ` : ''}
          &lt;{mail.fromEmail}&gt;
          {mail.isVirtual ? ' (platform SMTP)' : ''}.
        </Alert>
      )}

      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size='small'
            label='Search'
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            fullWidth
          />
          <TextField
            select
            size='small'
            label='Status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value=''>All</MenuItem>
            {['draft', 'sent', 'completed', 'declined', 'voided', 'expired'].map(s => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Button variant='outlined' onClick={load}>
            Refresh
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Typography color='error' sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Signers</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align='right'>Open</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            )}
            {!loading && !items.length && (
              <TableRow>
                <TableCell colSpan={5}>
                  No envelopes yet.{' '}
                  <Link href={`/${locale}/apps/docsign/new`}>Create your first envelope</Link>.
                </TableCell>
              </TableRow>
            )}
            {items.map(item => (
              <TableRow key={item._id} hover>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Chip size='small' label={item.status} color={STATUS_COLOR[item.status] || 'default'} />
                </TableCell>
                <TableCell>
                  {item.signerSummary?.signed || 0}/{item.signerSummary?.total || 0} signed
                </TableCell>
                <TableCell>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
                </TableCell>
                <TableCell align='right'>
                  <Button size='small' component={Link} href={`/${locale}/apps/docsign/${item._id}`}>
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
