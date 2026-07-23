'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  Alert,
} from '@mui/material'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import io from 'socket.io-client'
import {
  connectPersonalWhatsApp,
  disconnectPersonalWhatsApp,
  getPersonalWhatsAppStatus,
} from '@/utils/personalWhatsappApi'

const statusColor = {
  connected: 'success',
  qr: 'warning',
  connecting: 'info',
  disconnected: 'default',
  logged_out: 'error',
  error: 'error',
}

export default function MyWhatsAppPage() {
  const { data: session } = useSession()
  const [status, setStatus] = useState('disconnected')
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [lastError, setLastError] = useState('')
  const [busy, setBusy] = useState(false)
  const statusRef = useRef(status)
  statusRef.current = status

  const applyStatus = useCallback(payload => {
    if (!payload) return
    setStatus(payload.status || 'disconnected')
    setQrDataUrl(payload.qrDataUrl || null)
    setPhoneNumber(payload.phoneNumber || '')
    setLastError(payload.lastError || '')
  }, [])

  const refresh = useCallback(async () => {
    try {
      const data = await getPersonalWhatsAppStatus()
      applyStatus(data)
    } catch (err) {
      setLastError(err.message)
    }
  }, [applyStatus])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Poll while linking so UI updates even if socket miss events
  useEffect(() => {
    if (status !== 'connecting' && status !== 'qr') return undefined
    const id = setInterval(() => {
      refresh()
    }, 1500)
    return () => clearInterval(id)
  }, [status, refresh])

  useEffect(() => {
    const userId = session?.user?.id || session?.user?._id
    if (!userId) return undefined

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      ''

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    })
    socket.on('connect', () => {
      socket.emit('register', String(userId))
    })
    socket.on('personal_wa:status', payload => applyStatus(payload))

    return () => {
      socket.disconnect()
    }
  }, [session, applyStatus])

  const handleConnect = async (refreshQr = false) => {
    setBusy(true)
    try {
      const data = await connectPersonalWhatsApp({ refresh: refreshQr })
      applyStatus(data)
      if (data.status === 'connected') {
        toast.success('WhatsApp connected')
      } else if (data.qrDataUrl) {
        toast.info(refreshQr ? 'New QR ready — scan with your phone' : 'Scan the QR code with WhatsApp on your phone')
      } else {
        toast.info('Connecting… QR will appear shortly')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDisconnect = async () => {
    setBusy(true)
    try {
      const data = await disconnectPersonalWhatsApp()
      applyStatus(data)
      toast.success('WhatsApp disconnected')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box sx={{ p: 4, maxWidth: 720, mx: 'auto' }}>
      <Card>
        <CardHeader
          title='My WhatsApp'
          subheader='Connect your personal WhatsApp so you can message leads from your own number'
          action={
            <Chip
              label={(status || 'disconnected').replace('_', ' ')}
              color={statusColor[status] || 'default'}
              sx={{ textTransform: 'capitalize' }}
            />
          }
        />
        <CardContent>
          <Alert severity='info' sx={{ mb: 3 }}>
            Works like WhatsApp Web: scan the QR once, then keep your phone online. Use normal one-to-one
            messaging — very high volume can trigger temporary limits from WhatsApp.
          </Alert>

          <Stack spacing={2} alignItems='center'>
            {status === 'connected' ? (
              <>
                <Typography variant='h6'>Connected{phoneNumber ? ` as +${phoneNumber}` : ''}</Typography>
                <Typography color='text.secondary' align='center'>
                  You can send messages to leads from your number inside the lead drawer.
                </Typography>
                <Button variant='outlined' color='error' onClick={handleDisconnect} disabled={busy}>
                  {busy ? <CircularProgress size={22} /> : 'Disconnect'}
                </Button>
              </>
            ) : (
              <>
                {qrDataUrl ? (
                  <Box
                    component='img'
                    src={qrDataUrl}
                    alt='WhatsApp QR'
                    sx={{ width: 280, height: 280, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 280,
                      height: 280,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    {status === 'connecting' || busy ? (
                      <CircularProgress />
                    ) : (
                      <Typography color='text.secondary' align='center' sx={{ px: 2 }}>
                        Click Connect to generate a QR code
                      </Typography>
                    )}
                  </Box>
                )}

                <Typography variant='body2' color='text.secondary' align='center'>
                  Open WhatsApp on your phone → Linked devices → Link a device → scan this QR
                </Typography>

                <Stack direction='row' spacing={1}>
                  <Button
                    variant='contained'
                    onClick={() => handleConnect(Boolean(qrDataUrl))}
                    disabled={busy}
                  >
                    {busy ? (
                      <CircularProgress size={22} />
                    ) : qrDataUrl ? (
                      'Refresh QR'
                    ) : (
                      'Connect WhatsApp'
                    )}
                  </Button>
                  {(status === 'qr' || status === 'connecting') && (
                    <Button variant='outlined' color='inherit' onClick={handleDisconnect} disabled={busy}>
                      Cancel
                    </Button>
                  )}
                </Stack>
              </>
            )}

            {lastError ? (
              <Typography color='error' variant='body2'>
                {lastError}
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
