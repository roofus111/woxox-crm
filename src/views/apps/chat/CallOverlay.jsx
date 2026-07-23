'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]

const CallOverlay = ({
  open,
  mode, // 'outgoing' | 'incoming' | 'active'
  callType, // 'audio' | 'video'
  peerName,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleVideo,
  muted,
  videoOff,
}) => {
  const localRef = useRef(null)
  const remoteRef = useRef(null)

  useEffect(() => {
    if (localRef.current && localStream) localRef.current.srcObject = localStream
  }, [localStream])

  useEffect(() => {
    if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream
  }, [remoteStream])

  if (!open) return null

  return (
    <Dialog open={open} fullWidth maxWidth='sm' onClose={onEnd}>
      <DialogTitle className='flex items-center justify-between'>
        <span>
          {callType === 'video' ? 'Video' : 'Voice'} call · {peerName || 'Contact'}
        </span>
        <Typography variant='caption' color='text.secondary'>
          {mode === 'incoming' ? 'Incoming' : mode === 'outgoing' ? 'Calling…' : 'Connected'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box className='relative rounded-lg overflow-hidden bg-black min-h-[240px] flex items-center justify-center'>
          {callType === 'video' ? (
            <>
              <video ref={remoteRef} autoPlay playsInline className='w-full max-h-[360px] object-cover' />
              <video
                ref={localRef}
                autoPlay
                muted
                playsInline
                className='absolute bottom-3 right-3 w-28 h-20 object-cover rounded border border-white/40'
              />
            </>
          ) : (
            <>
              <audio ref={remoteRef} autoPlay />
              <Typography color='common.white' variant='h6'>
                {peerName || 'On call'}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions className='justify-center gap-2 pb-4'>
        {mode === 'incoming' ? (
          <>
            <Button color='error' variant='contained' onClick={onReject}>
              Decline
            </Button>
            <Button color='success' variant='contained' onClick={onAccept}>
              Accept
            </Button>
          </>
        ) : (
          <>
            <IconButton onClick={onToggleMute} color={muted ? 'error' : 'default'}>
              <i className={muted ? 'ri-mic-off-line' : 'ri-mic-line'} />
            </IconButton>
            {callType === 'video' && (
              <IconButton onClick={onToggleVideo} color={videoOff ? 'error' : 'default'}>
                <i className={videoOff ? 'ri-camera-off-line' : 'ri-camera-line'} />
              </IconButton>
            )}
            <Button color='error' variant='contained' onClick={onEnd}>
              End
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export function useWebRTCCall({
  selfId,
  callInvite,
  callAnswer,
  callIce,
  callReject,
  callEnd,
  onIncomingHandlers,
}) {
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const [callState, setCallState] = useState({
    open: false,
    mode: null,
    callType: 'audio',
    peerId: null,
    peerName: '',
    muted: false,
    videoOff: false,
    localStream: null,
    remoteStream: null,
  })

  const cleanup = useCallback(() => {
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    setCallState(s => ({
      ...s,
      open: false,
      mode: null,
      localStream: null,
      remoteStream: null,
      peerId: null,
    }))
  }, [])

  const ensurePc = useCallback((peerId) => {
    if (pcRef.current) return pcRef.current
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    pc.onicecandidate = (e) => {
      if (e.candidate && peerId && selfId) {
        callIce({ to: peerId, from: selfId, candidate: e.candidate })
      }
    }
    pc.ontrack = (e) => {
      setCallState(s => ({ ...s, remoteStream: e.streams[0] }))
    }
    pcRef.current = pc
    return pc
  }, [callIce, selfId])

  const startMedia = useCallback(async (callType) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    })
    localStreamRef.current = stream
    setCallState(s => ({ ...s, localStream: stream }))
    return stream
  }, [])

  const startCall = useCallback(async (peerId, peerName, callType = 'audio') => {
    if (!selfId || !peerId) return
    const stream = await startMedia(callType)
    const pc = ensurePc(peerId)
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    callInvite({ to: peerId, from: selfId, callType, offer })
    setCallState(s => ({
      ...s,
      open: true,
      mode: 'outgoing',
      callType,
      peerId,
      peerName,
    }))
  }, [selfId, startMedia, ensurePc, callInvite])

  const handleIncoming = useCallback((data) => {
    setCallState(s => ({
      ...s,
      open: true,
      mode: 'incoming',
      callType: data.callType || 'audio',
      peerId: data.from,
      peerName: data.peerName || 'Incoming call',
      offer: data.offer,
    }))
  }, [])

  const acceptCall = useCallback(async () => {
    const { peerId, callType, offer } = callState
    if (!peerId || !offer || !selfId) return
    const stream = await startMedia(callType)
    const pc = ensurePc(peerId)
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    callAnswer({ to: peerId, from: selfId, answer })
    setCallState(s => ({ ...s, mode: 'active' }))
  }, [callState, selfId, startMedia, ensurePc, callAnswer])

  const handleAnswered = useCallback(async (data) => {
    if (!pcRef.current || !data.answer) return
    await pcRef.current.setRemoteDescription(data.answer)
    setCallState(s => ({ ...s, mode: 'active' }))
  }, [])

  const handleIce = useCallback(async (data) => {
    if (data.candidate && pcRef.current) {
      try {
        await pcRef.current.addIceCandidate(data.candidate)
      } catch {
        // ignore late candidates
      }
    }
  }, [])

  const reject = useCallback(() => {
    if (callState.peerId && selfId) {
      callReject({ to: callState.peerId, from: selfId })
    }
    cleanup()
  }, [callState.peerId, selfId, callReject, cleanup])

  const end = useCallback(() => {
    if (callState.peerId && selfId) {
      callEnd({ to: callState.peerId, from: selfId })
    }
    cleanup()
  }, [callState.peerId, selfId, callEnd, cleanup])

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()?.[0]
    if (track) {
      track.enabled = !track.enabled
      setCallState(s => ({ ...s, muted: !track.enabled }))
    }
  }, [])

  const toggleVideo = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()?.[0]
    if (track) {
      track.enabled = !track.enabled
      setCallState(s => ({ ...s, videoOff: !track.enabled }))
    }
  }, [])

  useEffect(() => {
    onIncomingHandlers?.({
      handleIncoming,
      handleAnswered,
      handleIce,
      handleEnded: cleanup,
      handleRejected: cleanup,
    })
  }, [onIncomingHandlers, handleIncoming, handleAnswered, handleIce, cleanup])

  return {
    callState,
    startCall,
    acceptCall,
    reject,
    end,
    toggleMute,
    toggleVideo,
    CallOverlayProps: {
      open: callState.open,
      mode: callState.mode,
      callType: callState.callType,
      peerName: callState.peerName,
      localStream: callState.localStream,
      remoteStream: callState.remoteStream,
      muted: callState.muted,
      videoOff: callState.videoOff,
      onAccept: acceptCall,
      onReject: reject,
      onEnd: end,
      onToggleMute: toggleMute,
      onToggleVideo: toggleVideo,
    },
  }
}

export default CallOverlay
