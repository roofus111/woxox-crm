// React Imports
import { useRef, useState, useEffect } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'

const EmojiPicker = ({ onChange, isBelowSmScreen, openEmojiPicker, setOpenEmojiPicker, anchorRef }) => (
  <Popper
    open={openEmojiPicker}
    transition
    disablePortal
    placement='top-start'
    className='z-[12]'
    anchorEl={anchorRef.current}
  >
    {({ TransitionProps, placement }) => (
      <Fade {...TransitionProps} style={{ transformOrigin: placement === 'top-start' ? 'right top' : 'left top' }}>
        <Paper>
          <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
            <span>
              <Picker
                emojiSize={18}
                theme='light'
                data={data}
                maxFrequentRows={1}
                onEmojiSelect={emoji => {
                  onChange(emoji.native)
                  setOpenEmojiPicker(false)
                }}
                {...(isBelowSmScreen && { perLine: 8 })}
              />
            </span>
          </ClickAwayListener>
        </Paper>
      </Fade>
    )}
  </Popper>
)

const SendMsgForm = ({
  activeUser,
  contacts = [],
  isBelowSmScreen,
  messageInputRef,
  onSendMessage,
  onTyping,
  replyToMsg,
  onCancelReply,
}) => {
  const [msg, setMsg] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')

  const anchorRef = useRef(null)
  const fileInputRef = useRef(null)
  const open = Boolean(anchorEl)

  const handleToggle = () => setOpenEmojiPicker(prevOpen => !prevOpen)
  const handleClick = event => setAnchorEl(prev => (prev ? null : event.currentTarget))
  const handleClose = () => setAnchorEl(null)

  const mentionCandidates = (contacts || [])
    .filter(c => !c.isGroup)
    .filter(c => c.fullName?.toLowerCase().includes(mentionQuery.toLowerCase()))
    .slice(0, 6)

  const handleSendMsg = async (event, text) => {
    event.preventDefault()
    if (text.trim() === '' || uploading) return
    await onSendMessage(text.trim())
    setMsg('')
    try {
      const { saveDraft } = await import('./chatExtras')
      saveDraft(activeUser?.id, '', activeUser?.isGroup ? 'group' : 'user')
    } catch {
      // ignore
    }
  }

  const handleFileSelect = async event => {
    const file = event.target.files?.[0]
    if (!file || uploading) return
    setUploading(true)
    try {
      await onSendMessage('', file)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { loadDraft } = await import('./chatExtras')
      if (!cancelled) {
        setMsg(loadDraft(activeUser?.id, activeUser?.isGroup ? 'group' : 'user'))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [activeUser?.id, activeUser?.isGroup])

  useEffect(() => {
    if (replyToMsg) messageInputRef.current?.focus()
  }, [replyToMsg, messageInputRef])

  const replyPreview =
    replyToMsg &&
    (replyToMsg.messageType && replyToMsg.messageType !== 'text'
      ? replyToMsg.fileName || replyToMsg.messageType
      : replyToMsg.message)

  const onChangeMsg = value => {
    setMsg(value)
    onTyping?.(value.length > 0)
    import('./chatExtras').then(({ saveDraft }) => {
      saveDraft(activeUser?.id, value, activeUser?.isGroup ? 'group' : 'user')
    })
    const at = value.lastIndexOf('@')
    if (at >= 0 && (at === 0 || value[at - 1] === ' ')) {
      setMentionOpen(true)
      setMentionQuery(value.slice(at + 1))
    } else {
      setMentionOpen(false)
      setMentionQuery('')
    }
  }

  const insertMention = name => {
    const at = msg.lastIndexOf('@')
    const next = `${msg.slice(0, at)}@${name} `
    setMsg(next)
    setMentionOpen(false)
    messageInputRef.current?.focus()
  }

  const handleInputEndAdornment = () => (
    <div className='flex items-center gap-1'>
      {uploading && <CircularProgress size={20} />}
      {isBelowSmScreen ? (
        <>
          <IconButton
            id='option-menu'
            aria-haspopup='true'
            {...(open && { 'aria-expanded': true, 'aria-controls': 'share-menu' })}
            onClick={handleClick}
            ref={anchorRef}
          >
            <i className='ri-more-2-line text-textPrimary' />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleToggle()
                handleClose()
              }}
            >
              <i className='ri-emotion-happy-line text-textPrimary' />
            </MenuItem>
            <MenuItem onClick={handleClose} className='p-0'>
              <label htmlFor='upload-chat-file' className='plb-2 pli-5 cursor-pointer'>
                <i className='ri-attachment-2 text-textPrimary' />
                <input
                  hidden
                  type='file'
                  id='upload-chat-file'
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx'
                />
              </label>
            </MenuItem>
          </Menu>
          <EmojiPicker
            anchorRef={anchorRef}
            openEmojiPicker={openEmojiPicker}
            setOpenEmojiPicker={setOpenEmojiPicker}
            isBelowSmScreen={isBelowSmScreen}
            onChange={value => {
              setMsg(prev => prev + value)
              messageInputRef.current?.focus()
            }}
          />
        </>
      ) : (
        <>
          <IconButton ref={anchorRef} size='small' onClick={handleToggle}>
            <i className='ri-emotion-happy-line text-textPrimary' />
          </IconButton>
          <EmojiPicker
            anchorRef={anchorRef}
            openEmojiPicker={openEmojiPicker}
            setOpenEmojiPicker={setOpenEmojiPicker}
            isBelowSmScreen={isBelowSmScreen}
            onChange={value => {
              setMsg(prev => prev + value)
              messageInputRef.current?.focus()
            }}
          />
          <IconButton size='small' component='label' htmlFor='upload-chat-file-desktop'>
            <i className='ri-attachment-2 text-textPrimary' />
            <input
              hidden
              type='file'
              id='upload-chat-file-desktop'
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx'
            />
          </IconButton>
        </>
      )}
      {isBelowSmScreen ? (
        <CustomIconButton variant='contained' color='primary' type='submit' disabled={uploading}>
          <i className='ri-send-plane-line' />
        </CustomIconButton>
      ) : (
        <Button
          variant='contained'
          color='primary'
          type='submit'
          endIcon={<i className='ri-send-plane-line' />}
          disabled={uploading}
        >
          Send
        </Button>
      )}
    </div>
  )

  return (
    <form
      autoComplete='off'
      onSubmit={event => handleSendMsg(event, msg)}
      className=' bg-[var(--mui-palette-customColors-chatBg)]'
    >
      {replyToMsg && (
        <div className='flex items-center justify-between gap-2 px-5 pt-3'>
          <div className='flex-1 min-w-0 border-l-4 border-primary pl-3'>
            <Typography variant='caption' color='primary' className='font-medium'>
              Replying to
            </Typography>
            <Typography variant='body2' noWrap color='text.secondary'>
              {replyPreview || 'Message'}
            </Typography>
          </div>
          <IconButton size='small' onClick={onCancelReply} aria-label='Cancel reply'>
            <i className='ri-close-line' />
          </IconButton>
        </div>
      )}
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={replyToMsg ? 'Write a reply…' : 'Type a message · @ to mention'}
        value={msg}
        className='p-5'
        onChange={e => onChangeMsg(e.target.value)}
        sx={{
          '& fieldset': { border: '0' },
          '& .MuiOutlinedInput-root': {
            background: 'var(--mui-palette-background-paper)',
            borderRadius: 'var(--mui-shape-customBorderRadius-lg)',
            boxShadow: 'var(--mui-customShadows-xs)'
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) handleSendMsg(e, msg)
        }}
        size='small'
        inputRef={messageInputRef}
        InputProps={{ endAdornment: handleInputEndAdornment() }}
      />
      {mentionOpen && mentionCandidates.length > 0 && (
        <div className='px-5 pb-3'>
          <Paper className='p-1'>
            {mentionCandidates.map(c => (
              <MenuItem key={c.id} onClick={() => insertMention(c.fullName)}>
                @{c.fullName}
              </MenuItem>
            ))}
          </Paper>
        </div>
      )}
    </form>
  )
}

export default SendMsgForm
