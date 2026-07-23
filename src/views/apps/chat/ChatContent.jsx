// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Collapse from '@mui/material/Collapse'
import Tooltip from '@mui/material/Tooltip'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import AvatarWithBadge from './AvatarWithBadge'
import { statusObj } from './SidebarLeft'
import ChatLog from './ChatLog'
import SendMsgForm from './SendMsgForm'
import UserProfileRight from './UserProfileRight'
import CustomAvatar from '@core/components/mui/Avatar'
import { clearChat } from '@/redux-store/slices/chat'

const UserAvatar = ({ activeUser, setUserProfileLeftOpen, setBackdropOpen }) => (
  <div
    className='flex items-center gap-4 cursor-pointer'
    onClick={() => {
      setUserProfileLeftOpen(true)
      setBackdropOpen(true)
    }}
  >
    <AvatarWithBadge
      alt={activeUser?.fullName}
      src={activeUser?.avatar}
      color={activeUser?.avatarColor}
      badgeColor={statusObj[activeUser?.status || 'offline']}
    />
    <div>
      <Typography color='text.primary'>{activeUser?.fullName}</Typography>
      <Typography variant='body2' color={activeUser?.status === 'online' ? 'success.main' : 'text.secondary'}>
        {activeUser?.isGroup
          ? `${activeUser.memberCount || 0} members`
          : activeUser?.status === 'online'
            ? 'Online'
            : 'Offline'}
        {activeUser?.role && !activeUser?.isGroup ? ` · ${activeUser.role}` : ''}
      </Typography>
    </div>
  </div>
)

const ChatContent = props => {
  const {
    chatStore,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    setSidebarOpen,
    isBelowMdScreen,
    isBelowSmScreen,
    isBelowLgScreen,
    messageInputRef,
    onSendMessage,
    onTyping,
    onEditMessage,
    onDeleteMessage,
    onAddReaction,
    onRemoveReaction,
    onReplyMessage,
    onForwardMessage,
    onStarMessage,
    onRetryMessage,
    onLoadOlder,
    onServerSearch,
    replyToMsg,
    onCancelReply,
    onOpenNewChat,
    onStartAudioCall,
    onStartVideoCall,
    onToggleMute,
    onTogglePin,
    onToggleArchive,
    onToggleBlock,
    preference,
  } = props

  const { activeUser } = chatStore

  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [serverHits, setServerHits] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!backdropOpen && userProfileRightOpen) {
      setUserProfileRightOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  useEffect(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setServerHits([])
  }, [activeUser?.id])

  useEffect(() => {
    if (!searchOpen || !searchQuery.trim() || !onServerSearch) {
      setServerHits([])
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const hits = await onServerSearch(searchQuery.trim())
        setServerHits(hits || [])
      } catch {
        setServerHits([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [searchQuery, searchOpen, onServerSearch])

  const menuOptions = [
    {
      text: 'View Contact',
      menuItemProps: {
        onClick: () => {
          setUserProfileRightOpen(true)
          setBackdropOpen(true)
        }
      }
    },
    {
      text: preference?.muted ? 'Unmute' : 'Mute',
      menuItemProps: { onClick: () => onToggleMute?.() }
    },
    {
      text: preference?.pinned ? 'Unpin' : 'Pin',
      menuItemProps: { onClick: () => onTogglePin?.() }
    },
    {
      text: preference?.archived ? 'Unarchive' : 'Archive',
      menuItemProps: { onClick: () => onToggleArchive?.() }
    },
    ...(!activeUser?.isGroup
      ? [
          {
            text: preference?.blocked ? 'Unblock' : 'Block',
            menuItemProps: { onClick: () => onToggleBlock?.() }
          }
        ]
      : []),
    {
      text: 'Clear Chat',
      menuItemProps: {
        onClick: () => {
          if (activeUser?.id) dispatch(clearChat(activeUser.id))
        }
      }
    }
  ]

  return !chatStore.activeUser ? (
    <CardContent className='flex flex-col flex-auto items-center justify-center bs-full gap-[18px]'>
      <CustomAvatar variant='circular' size={98} color='primary' skin='light'>
        <i className='ri-wechat-line text-[50px]' />
      </CustomAvatar>
      <Typography className='text-center'>Select a contact to start a conversation.</Typography>
      <Button
        variant='contained'
        className='rounded-full'
        startIcon={<i className='ri-add-line' />}
        onClick={onOpenNewChat}
      >
        New Chat
      </Button>
      {isBelowMdScreen && (
        <Button
          variant='outlined'
          className='rounded-full'
          onClick={() => {
            setSidebarOpen(true)
            isBelowSmScreen ? setBackdropOpen(false) : setBackdropOpen(true)
          }}
        >
          Browse Conversations
        </Button>
      )}
    </CardContent>
  ) : (
    <>
      {activeUser && (
        <div className='flex flex-col flex-grow bs-full'>
          <div className='flex items-center justify-between border-be plb-[17px] pli-5 bg-[var(--mui-palette-customColors-chatBg)]'>
            {isBelowMdScreen ? (
              <div className='flex items-center gap-4'>
                <IconButton
                  onClick={() => {
                    setSidebarOpen(true)
                    setBackdropOpen(true)
                  }}
                >
                  <i className='ri-menu-line text-textSecondary text-xl' />
                </IconButton>
                <UserAvatar
                  activeUser={activeUser}
                  setBackdropOpen={setBackdropOpen}
                  setUserProfileLeftOpen={setUserProfileRightOpen}
                />
              </div>
            ) : (
              <UserAvatar
                activeUser={activeUser}
                setBackdropOpen={setBackdropOpen}
                setUserProfileLeftOpen={setUserProfileRightOpen}
              />
            )}
            <div className='flex items-center gap-1'>
              {!activeUser.isGroup && (
                <>
                  <Tooltip title='Voice call'>
                    <IconButton size='small' onClick={onStartAudioCall}>
                      <i className='ri-phone-line text-textSecondary' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Video call'>
                    <IconButton size='small' onClick={onStartVideoCall}>
                      <i className='ri-vidicon-line text-textSecondary' />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <IconButton
                size='small'
                onClick={() => setSearchOpen(prev => !prev)}
                color={searchOpen ? 'primary' : 'default'}
                aria-label='Search messages'
              >
                <i className='ri-search-line text-textSecondary' />
              </IconButton>
              <OptionMenu iconClassName='text-textSecondary' options={menuOptions} />
            </div>
          </div>

          <Collapse in={searchOpen}>
            <div className='px-5 py-2 border-be bg-[var(--mui-palette-customColors-chatBg)] relative'>
              <TextField
                fullWidth
                size='small'
                placeholder='Search in conversation…'
                value={searchQuery}
                autoFocus
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setSearchQuery('')}>
                        <i className='ri-close-line' />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
              {serverHits.length > 0 && (
                <Paper className='absolute left-5 right-5 z-10 mt-1 max-h-48 overflow-auto'>
                  <List dense>
                    {serverHits.slice(0, 8).map(hit => (
                      <ListItemButton key={hit._id} onClick={() => setSearchQuery(hit.content || '')}>
                        <ListItemText
                          primary={hit.content || hit.fileName || 'Message'}
                          secondary={new Date(hit.createdAt).toLocaleString()}
                          primaryTypographyProps={{ noWrap: true }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
              {searching && (
                <Typography variant='caption' color='text.secondary' className='px-1'>
                  Searching server…
                </Typography>
              )}
            </div>
          </Collapse>

          <ChatLog
            chatStore={chatStore}
            isBelowMdScreen={isBelowMdScreen}
            isBelowSmScreen={isBelowSmScreen}
            isBelowLgScreen={isBelowLgScreen}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            onForwardMessage={onForwardMessage}
            onStarMessage={onStarMessage}
            onRetryMessage={onRetryMessage}
            onLoadOlder={onLoadOlder}
            onReplyMessage={msg => {
              onReplyMessage?.(msg)
              messageInputRef.current?.focus()
            }}
            searchQuery={searchQuery}
          />

          <SendMsgForm
            activeUser={activeUser}
            contacts={chatStore.contacts}
            isBelowSmScreen={isBelowSmScreen}
            messageInputRef={messageInputRef}
            onSendMessage={onSendMessage}
            onTyping={onTyping}
            replyToMsg={replyToMsg}
            onCancelReply={onCancelReply}
          />
        </div>
      )}

      {activeUser && (
        <UserProfileRight
          open={userProfileRightOpen}
          handleClose={() => {
            setUserProfileRightOpen(false)
            setBackdropOpen(false)
          }}
          activeUser={activeUser}
          isBelowSmScreen={isBelowSmScreen}
          isBelowLgScreen={isBelowLgScreen}
        />
      )}
    </>
  )
}

export default ChatContent
