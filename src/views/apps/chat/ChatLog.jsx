// React Imports
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Popper from '@mui/material/Popper'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { QUICK_REACTIONS } from './chatExtras'

const MessageContent = ({ msg }) => {
  if (msg.messageType === 'image' && msg.fileUrl) {
    return (
      <img
        src={msg.fileUrl}
        alt={msg.fileName || 'Image'}
        className='max-w-full rounded-lg max-h-64 object-cover'
      />
    )
  }

  if (msg.messageType === 'video' && msg.fileUrl) {
    return (
      <video src={msg.fileUrl} controls className='max-w-full rounded-lg max-h-64'>
        <track kind='captions' />
      </video>
    )
  }

  if (msg.messageType === 'audio' && msg.fileUrl) {
    return <audio src={msg.fileUrl} controls className='min-is-48' />
  }

  if ((msg.messageType === 'file' || msg.fileUrl) && msg.fileUrl) {
    return (
      <Link href={msg.fileUrl} target='_blank' rel='noopener noreferrer' underline='hover'>
        📎 {msg.fileName || 'Download file'}
      </Link>
    )
  }

  return msg.message
}

const ReplyPreview = ({ replyTo, isSender }) => {
  if (!replyTo) return null
  const preview =
    replyTo.messageType && replyTo.messageType !== 'text'
      ? replyTo.fileName || replyTo.messageType
      : replyTo.message

  return (
    <Box
      className={classnames('mb-1 px-2 py-1 rounded text-xs border-l-4', {
        'bg-black/10 border-white/70': isSender,
        'bg-actionHover border-primary': !isSender,
      })}
      sx={{ opacity: 0.9, maxWidth: '100%' }}
    >
      <Typography variant='caption' className='block font-medium' noWrap>
        Reply
      </Typography>
      <Typography variant='caption' className='block' noWrap>
        {preview || 'Message'}
      </Typography>
    </Box>
  )
}

const formatedChatData = chats => {
  const formattedChatData = []
  if (!chats.length) return formattedChatData

  let chatMessageSenderId = chats[0].senderId
  let msgGroup = { senderId: chatMessageSenderId, messages: [] }

  chats.forEach((chat, index) => {
    if (chatMessageSenderId === chat.senderId) {
      msgGroup.messages.push(chat)
    } else {
      chatMessageSenderId = chat.senderId
      formattedChatData.push(msgGroup)
      msgGroup = { senderId: chat.senderId, messages: [chat] }
    }
    if (index === chats.length - 1) formattedChatData.push(msgGroup)
  })

  return formattedChatData
}

const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className, onScrollTop }) => {
  const handleScroll = e => {
    const el = e?.target
    if (el && el.scrollTop < 80) onScrollTop?.()
  }

  if (isBelowLgScreen) {
    return (
      <div
        ref={scrollRef}
        className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}
        onScroll={handleScroll}
      >
        {children}
      </div>
    )
  }
  return (
    <PerfectScrollbar
      ref={scrollRef}
      options={{ wheelPropagation: false }}
      className={className}
      onScrollY={container => {
        if (container.scrollTop < 80) onScrollTop?.()
      }}
    >
      {children}
    </PerfectScrollbar>
  )
}

const ChatLog = ({
  chatStore,
  isBelowLgScreen,
  isBelowMdScreen,
  isBelowSmScreen,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  onReplyMessage,
  onForwardMessage,
  onStarMessage,
  onRetryMessage,
  onLoadOlder,
  searchQuery = '',
}) => {
  const { profileUser, contacts, typingUserId, activeChatType } = chatStore
  const activeUserChat = chatStore.chats.find(
    chat =>
      chat.userId?.toString() === chatStore.activeUser?.id?.toString() &&
      (chat.chatType || 'user') === (activeChatType || 'user')
  )

  const scrollRef = useRef(null)
  const loadingOlderRef = useRef(false)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [reactionAnchor, setReactionAnchor] = useState(null)

  const filteredMessages = useMemo(() => {
    const messages = activeUserChat?.chat || []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return messages
    return messages.filter(m => {
      const text = `${m.message || ''} ${m.fileName || ''}`.toLowerCase()
      return text.includes(q)
    })
  }, [activeUserChat?.chat, searchQuery])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      if (isBelowLgScreen) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else if (scrollRef.current._container) {
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }

  useEffect(() => {
    if (filteredMessages.length && !searchQuery) scrollToBottom()
  }, [chatStore.activeUser?.id, typingUserId, searchQuery])

  const handleLoadOlder = useCallback(async () => {
    if (!activeUserChat?.hasMore || loadingOlderRef.current || !onLoadOlder) return
    loadingOlderRef.current = true
    try {
      await onLoadOlder()
    } finally {
      loadingOlderRef.current = false
    }
  }, [activeUserChat?.hasMore, onLoadOlder])

  const handleContextMenu = (event, msg) => {
    event.preventDefault()
    setSelectedMsg(msg)
    setMenuAnchor({ top: event.clientY, left: event.clientX })
  }

  const contact = contacts.find(
    c =>
      c.id?.toString() === activeUserChat?.userId?.toString() &&
      (!!c.isGroup === ((activeChatType || 'user') === 'group'))
  )
  const q = searchQuery.trim().toLowerCase()

  const resolveSender = senderId =>
    contacts.find(c => c.id?.toString() === senderId?.toString() && !c.isGroup) || contact

  return (
    <ScrollWrapper
      isBelowLgScreen={isBelowLgScreen}
      scrollRef={scrollRef}
      className='bg-[var(--mui-palette-customColors-chatBg)]'
      onScrollTop={handleLoadOlder}
    >
      <CardContent className='p-0'>
        {activeUserChat?.hasMore && (
          <div className='flex justify-center py-2'>
            <Button size='small' onClick={handleLoadOlder}>
              Load earlier messages
            </Button>
          </div>
        )}

        {q && (
          <Typography variant='caption' color='text.secondary' className='block px-5 pt-3'>
            {filteredMessages.length} match{filteredMessages.length === 1 ? '' : 'es'} for “{searchQuery.trim()}”
          </Typography>
        )}

        {activeUserChat &&
          formatedChatData(filteredMessages).map((msgGroup, index) => {
            const isSender = msgGroup.senderId?.toString() === profileUser.id?.toString()
            const sender = resolveSender(msgGroup.senderId)

            return (
              <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
                {!isSender ? (
                  sender?.avatar ? (
                    <Avatar alt={sender.fullName} src={sender.avatar} className='is-8 bs-8' />
                  ) : (
                    <CustomAvatar color={sender?.avatarColor} skin='light' size={32}>
                      {getInitials(sender?.fullName || '')}
                    </CustomAvatar>
                  )
                ) : profileUser.avatar ? (
                  <Avatar alt={profileUser.fullName} src={profileUser.avatar} className='is-8 bs-8' />
                ) : (
                  <CustomAvatar alt={profileUser.fullName} size={32}>
                    {getInitials(profileUser.fullName || '')}
                  </CustomAvatar>
                )}
                <div
                  className={classnames('flex flex-col gap-2', {
                    'items-end': isSender,
                    'max-is-[65%]': !isBelowMdScreen,
                    'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
                    'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
                  })}
                >
                  {msgGroup.messages.map((msg, msgIndex) => {
                    const highlighted =
                      q && `${msg.message || ''} ${msg.fileName || ''}`.toLowerCase().includes(q)

                    return (
                      <div key={msg.messageId || msgIndex} className='flex flex-col gap-1'>
                        <Typography
                          component='div'
                          className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs cursor-context-menu', {
                            'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender,
                            'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s-lg rounded-b-lg':
                              isSender,
                            'ring-2 ring-warning': highlighted,
                            'opacity-70 border border-dashed': msg.failed
                          })}
                          style={{ wordBreak: 'break-word' }}
                          onContextMenu={e => handleContextMenu(e, msg)}
                        >
                          {msg.forwardedFrom && (
                            <Typography variant='caption' className='block opacity-80 mb-1'>
                              Forwarded
                            </Typography>
                          )}
                          <ReplyPreview replyTo={msg.replyTo} isSender={isSender} />
                          <MessageContent msg={msg} />
                          {msg.edited && (
                            <Typography component='span' variant='caption' className='opacity-70 ml-1'>
                              (edited)
                            </Typography>
                          )}
                          {msg.starred && (
                            <Typography component='span' variant='caption' className='ml-1'>
                              ⭐
                            </Typography>
                          )}
                        </Typography>
                        {msg.failed && (
                          <Button size='small' color='error' onClick={() => onRetryMessage?.(msg)}>
                            Retry send
                          </Button>
                        )}
                        {msg.reactions?.length > 0 && (
                          <div className='flex gap-1 flex-wrap'>
                            {msg.reactions.map((r, i) => (
                              <Chip
                                key={i}
                                label={r.emoji}
                                size='small'
                                variant='outlined'
                                onClick={() => {
                                  const uid = (r.user?._id || r.user)?.toString()
                                  if (uid === profileUser.id?.toString()) {
                                    onRemoveReaction?.(msg.messageId)
                                  } else {
                                    onAddReaction?.(msg.messageId, r.emoji)
                                  }
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {msgGroup.messages.map(
                    (msg, msgIndex) =>
                      msgIndex === msgGroup.messages.length - 1 &&
                      (isSender ? (
                        <div key={`status-${msgIndex}`} className='flex items-center gap-2'>
                          {msg.msgStatus?.isSeen ? (
                            <i className='ri-check-double-line text-success text-base' />
                          ) : msg.msgStatus?.isDelivered ? (
                            <i className='ri-check-double-line text-base' />
                          ) : (
                            msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
                          )}
                          {msg.time && (
                            <Typography variant='caption'>
                              {new Date(msg.time).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                              })}
                            </Typography>
                          )}
                        </div>
                      ) : msg.time ? (
                        <Typography key={`time-${msgIndex}`} variant='caption'>
                          {new Date(msg.time).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </Typography>
                      ) : null)
                  )}
                </div>
              </div>
            )
          })}

        {typingUserId && !searchQuery && (
          <Typography variant='body2' color='text.secondary' className='px-5 pb-3 italic'>
            typing...
          </Typography>
        )}
      </CardContent>

      <Menu
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null)
          setSelectedMsg(null)
        }}
        anchorReference='anchorPosition'
        anchorPosition={menuAnchor || undefined}
      >
        <MenuItem
          onClick={() => {
            if (selectedMsg) onReplyMessage?.(selectedMsg)
            setMenuAnchor(null)
          }}
        >
          Reply
        </MenuItem>
        <MenuItem
          onClick={e => {
            setReactionAnchor(e.currentTarget)
            setMenuAnchor(null)
          }}
        >
          React…
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMsg) onForwardMessage?.(selectedMsg)
            setMenuAnchor(null)
          }}
        >
          Forward
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMsg?.messageId) onStarMessage?.(selectedMsg)
            setMenuAnchor(null)
          }}
        >
          {selectedMsg?.starred ? 'Unstar' : 'Star'}
        </MenuItem>
        {selectedMsg?.senderId?.toString() === profileUser.id?.toString() && (
          <>
            <MenuItem
              onClick={() => {
                const newContent = window.prompt('Edit message:', selectedMsg.message)
                if (newContent && selectedMsg.messageId) onEditMessage?.(selectedMsg.messageId, newContent)
                setMenuAnchor(null)
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedMsg?.messageId) onDeleteMessage?.(selectedMsg.messageId)
                setMenuAnchor(null)
              }}
            >
              Delete
            </MenuItem>
          </>
        )}
      </Menu>

      <Popper open={Boolean(reactionAnchor)} anchorEl={reactionAnchor} placement='top' className='z-[1300]'>
        <ClickAwayListener onClickAway={() => setReactionAnchor(null)}>
          <Paper className='p-2 flex flex-wrap gap-1 max-w-xs'>
            {QUICK_REACTIONS.map(emoji => (
              <Button
                key={emoji}
                size='small'
                onClick={() => {
                  if (selectedMsg?.messageId) onAddReaction?.(selectedMsg.messageId, emoji)
                  setReactionAnchor(null)
                  setSelectedMsg(null)
                }}
              >
                {emoji}
              </Button>
            ))}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </ScrollWrapper>
  )
}

export default ChatLog
