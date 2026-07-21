// React Imports
import { useRef, useEffect, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

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

const formatedChatData = (chats, profileUser) => {
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

const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className }) => {
  if (isBelowLgScreen) {
    return (
      <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
        {children}
      </div>
    )
  }
  return (
    <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
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
}) => {
  const { profileUser, contacts, typingUserId } = chatStore
  const activeUserChat = chatStore.chats.find(
    chat => chat.userId?.toString() === chatStore.activeUser?.id?.toString()
  )

  const scrollRef = useRef(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedMsg, setSelectedMsg] = useState(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      if (isBelowLgScreen) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else {
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }

  useEffect(() => {
    if (activeUserChat?.chat?.length) scrollToBottom()
  }, [chatStore, typingUserId])

  const handleContextMenu = (event, msg) => {
    event.preventDefault()
    setSelectedMsg(msg)
    setMenuAnchor({ top: event.clientY, left: event.clientX })
  }

  const contact = contacts.find(c => c.id?.toString() === activeUserChat?.userId?.toString())

  return (
    <ScrollWrapper
      isBelowLgScreen={isBelowLgScreen}
      scrollRef={scrollRef}
      className='bg-[var(--mui-palette-customColors-chatBg)]'
    >
      <CardContent className='p-0'>
        {activeUserChat &&
          formatedChatData(activeUserChat.chat, profileUser).map((msgGroup, index) => {
            const isSender = msgGroup.senderId?.toString() === profileUser.id?.toString()

            return (
              <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
                {!isSender ? (
                  contact?.avatar ? (
                    <Avatar alt={contact.fullName} src={contact.avatar} className='is-8 bs-8' />
                  ) : (
                    <CustomAvatar color={contact?.avatarColor} skin='light' size={32}>
                      {getInitials(contact?.fullName || '')}
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
                  {msgGroup.messages.map((msg, msgIndex) => (
                    <div key={msg.messageId || msgIndex} className='flex flex-col gap-1'>
                      <Typography
                        component='div'
                        className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs cursor-context-menu', {
                          'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender,
                          'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s-lg rounded-b-lg': isSender
                        })}
                        style={{ wordBreak: 'break-word' }}
                        onContextMenu={e => handleContextMenu(e, msg)}
                      >
                        <MessageContent msg={msg} />
                        {msg.edited && (
                          <Typography component='span' variant='caption' className='opacity-70 ml-1'>
                            (edited)
                          </Typography>
                        )}
                      </Typography>
                      {msg.reactions?.length > 0 && (
                        <div className='flex gap-1 flex-wrap'>
                          {msg.reactions.map((r, i) => (
                            <Chip key={i} label={r.emoji} size='small' variant='outlined' />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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

        {typingUserId && (
          <Typography variant='body2' color='text.secondary' className='px-5 pb-3 italic'>
            typing...
          </Typography>
        )}
      </CardContent>

      <Menu
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setSelectedMsg(null) }}
        anchorReference='anchorPosition'
        anchorPosition={menuAnchor || undefined}
      >
        <MenuItem onClick={() => {
          const emoji = '👍'
          if (selectedMsg?.messageId) onAddReaction?.(selectedMsg.messageId, emoji)
          setMenuAnchor(null)
        }}>
          👍 React
        </MenuItem>
        {selectedMsg?.senderId?.toString() === profileUser.id?.toString() && (
          <>
            <MenuItem onClick={() => {
              const newContent = window.prompt('Edit message:', selectedMsg.message)
              if (newContent && selectedMsg.messageId) onEditMessage?.(selectedMsg.messageId, newContent)
              setMenuAnchor(null)
            }}>
              Edit
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedMsg?.messageId) onDeleteMessage?.(selectedMsg.messageId)
              setMenuAnchor(null)
            }}>
              Delete
            </MenuItem>
          </>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default ChatLog
