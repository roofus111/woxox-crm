// React Imports
import { useState } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Slice Imports
import { addNewChat, setSidebarFilter } from '@/redux-store/slices/chat'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import UserProfileLeft from './UserProfileLeft'
import AvatarWithBadge from './AvatarWithBadge'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { formatDateToMonthShort } from './utils'

export const statusObj = {
  busy: 'error',
  away: 'warning',
  online: 'success',
  offline: 'secondary'
}

// Render chat list
const renderChat = props => {
  // Props
  const { chatStore, getActiveUserData, setSidebarOpen, backdropOpen, setBackdropOpen, isBelowMdScreen } = props
  const filter = chatStore.sidebarFilter || 'all'

  const sorted = [...chatStore.chats].sort((a, b) => {
    const aPref = chatStore.preferences?.[`${a.chatType || 'user'}:${a.userId}`]
    const bPref = chatStore.preferences?.[`${b.chatType || 'user'}:${b.userId}`]
    const aPin = aPref?.pinned ? 1 : 0
    const bPin = bPref?.pinned ? 1 : 0
    if (aPin !== bPin) return bPin - aPin
    const aTime = a.chat[a.chat.length - 1]?.time || 0
    const bTime = b.chat[b.chat.length - 1]?.time || 0
    return new Date(bTime) - new Date(aTime)
  })

  return sorted.map(chat => {
    const chatType = chat.chatType || 'user'
    const pref = chatStore.preferences?.[`${chatType}:${chat.userId}`] || {}
    if (filter === 'archived' && !pref.archived) return null
    if (filter !== 'archived' && pref.archived) return null
    if (filter === 'groups' && chatType !== 'group') return null
    if (filter === 'direct' && chatType !== 'user') return null
    if (filter === 'unread' && !(chat.unseenMsgs > 0)) return null

    const contact = chatStore.contacts.find(
      c => c.id?.toString() === chat.userId?.toString() && (!!c.isGroup === (chatType === 'group'))
    )
    if (!contact) return null

    const isChatActive =
      chatStore.activeUser?.id?.toString() === contact.id?.toString() &&
      (chatStore.activeChatType || 'user') === chatType

    return (
      <li
        key={`${chatType}-${chat.id}`}
        className={classnames('flex items-start gap-4 pli-3 plb-2 cursor-pointer rounded-lg mbe-1', {
          'bg-primary shadow-xs': isChatActive,
          'text-[var(--mui-palette-primary-contrastText)]': isChatActive,
          'opacity-70': pref.muted
        })}
        onClick={() => {
          getActiveUserData(chat.userId)
          isBelowMdScreen && setSidebarOpen(false)
          isBelowMdScreen && backdropOpen && setBackdropOpen(false)
        }}
      >
        <AvatarWithBadge
          src={contact.avatar}
          isChatActive={isChatActive}
          alt={contact.fullName}
          badgeColor={contact.isGroup ? 'info' : statusObj[contact.status]}
          color={contact.avatarColor}
        />
        <div className='min-is-0 flex-auto'>
          <Typography color='inherit'>
            {pref.pinned ? '📌 ' : ''}
            {contact?.fullName}
            {contact.isGroup ? ' · Group' : ''}
            {pref.muted ? ' 🔇' : ''}
          </Typography>
          {chat.chat.length ? (
            <Typography variant='body2' color={isChatActive ? 'inherit' : 'text.secondary'} className='truncate'>
              {chat.chat[chat.chat.length - 1].messageType !== 'text'
                ? `[${chat.chat[chat.chat.length - 1].messageType}]`
                : chat.chat[chat.chat.length - 1].message}
            </Typography>
          ) : (
            <Typography variant='body2' color={isChatActive ? 'inherit' : 'text.secondary'} className='truncate'>
              {contact.role}
            </Typography>
          )}
        </div>
        <div className='flex flex-col items-end justify-start'>
          <Typography
            variant='body2'
            color='inherit'
            className={classnames('truncate', {
              'text-textDisabled': !isChatActive
            })}
          >
            {chat.chat.length ? formatDateToMonthShort(chat.chat[chat.chat.length - 1].time) : null}
          </Typography>
          {chat.unseenMsgs > 0 ? <Chip label={chat.unseenMsgs} color='error' size='small' /> : null}
        </div>
      </li>
    )
  })
}

// Scroll wrapper for chat list
const ScrollWrapper = ({ children, isBelowLgScreen }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-y-auto overflow-x-hidden'>{children}</div>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const SidebarLeft = props => {
  // Props
  const {
    chatStore,
    getActiveUserData,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    sidebarOpen,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    messageInputRef,
    onOpenNewChat,
    onOpenNewGroup,
  } = props

  // States
  const [userSidebar, setUserSidebar] = useState(false)
  const [searchValue, setSearchValue] = useState()

  const handleChange = (event, newValue) => {
    if (!newValue) return
    const contact = chatStore.contacts.find(contact => contact.fullName === newValue)
    if (!contact) return
    setSearchValue(newValue)
    dispatch(addNewChat({ id: contact.id, chatType: contact.isGroup ? 'group' : 'user', isGroup: contact.isGroup }))
    getActiveUserData(contact.id)
    isBelowMdScreen && setSidebarOpen(false)
    setBackdropOpen(false)
    setSearchValue(null)
    messageInputRef.current?.focus()
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'direct', label: 'Direct' },
    { id: 'groups', label: 'Groups' },
    { id: 'unread', label: 'Unread' },
    { id: 'archived', label: 'Archived' },
  ]

  return (
    <>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className='bs-full'
        variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: isBelowMdScreen && sidebarOpen ? 11 : 10,
          position: !isBelowMdScreen ? 'static' : 'absolute',
          ...(isBelowSmScreen && sidebarOpen && { width: '100%' }),
          '& .MuiDrawer-paper': {
            overflow: 'hidden',
            boxShadow: 'none',
            width: isBelowSmScreen ? '100%' : '370px',
            position: !isBelowMdScreen ? 'static' : 'absolute'
          }
        }}
      >
        <div className='flex plb-[18px] pli-5 gap-4 border-be'>
          <AvatarWithBadge
            alt={chatStore.profileUser.fullName}
            src={chatStore.profileUser.avatar}
            badgeColor={statusObj[chatStore.profileUser.status]}
            onClick={() => {
              setUserSidebar(true)
            }}
          />
          <div className='flex is-full items-center flex-auto sm:gap-x-3 gap-y-2'>
            <Autocomplete
              fullWidth
              size='small'
              id='select-contact'
              options={chatStore.contacts.map(contact => contact.fullName) || []}
              value={searchValue || null}
              onChange={handleChange}
              renderInput={params => (
                <TextField
                  {...params}
                  variant='outlined'
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '999px !important' } }}
                  placeholder='Search Contacts'
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-search-line text-xl' />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => {
                const contact = chatStore.contacts.find(contact => contact.fullName === option)

                return (
                  <li
                    {...props}
                    key={option.toLowerCase().replace(/\s+/g, '-')}
                    className={classnames('gap-3 max-sm:pli-3', props.className)}
                  >
                    {contact ? (
                      contact.avatar ? (
                        <Avatar
                          alt={contact.fullName}
                          src={contact.avatar}
                          key={option.toLowerCase().replace(/\s+/g, '-')}
                        />
                      ) : (
                        <CustomAvatar
                          color={contact.avatarColor}
                          skin='light'
                          key={option.toLowerCase().replace(/\s+/g, '-')}
                        >
                          {getInitials(contact.fullName)}
                        </CustomAvatar>
                      )
                    ) : null}
                    {option}
                  </li>
                )
              }}
            />
            {isBelowMdScreen ? (
              <>
                <Tooltip title='New group'>
                  <IconButton className='p-0 mis-1' onClick={onOpenNewGroup}>
                    <i className='ri-group-line text-xl' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='New chat'>
                  <IconButton className='p-0 mis-1' onClick={onOpenNewChat}>
                    <i className='ri-edit-box-line text-xl' />
                  </IconButton>
                </Tooltip>
                <IconButton
                  className='p-0 mis-2'
                  onClick={() => {
                    setSidebarOpen(false)
                    setBackdropOpen(false)
                  }}
                >
                  <i className='ri-close-line' />
                </IconButton>
              </>
            ) : (
              <>
                <Tooltip title='New group'>
                  <IconButton color='primary' onClick={onOpenNewGroup} className='mis-1'>
                    <i className='ri-group-line text-xl' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='New chat'>
                  <IconButton color='primary' onClick={onOpenNewChat} className='mis-1'>
                    <i className='ri-edit-box-line text-xl' />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
        </div>
        <div className='flex items-center gap-1 flex-wrap pli-4 plb-2 border-be'>
          {filters.map(f => (
            <Chip
              key={f.id}
              size='small'
              label={f.label}
              color={(chatStore.sidebarFilter || 'all') === f.id ? 'primary' : 'default'}
              variant={(chatStore.sidebarFilter || 'all') === f.id ? 'filled' : 'outlined'}
              onClick={() => dispatch(setSidebarFilter(f.id))}
              className='cursor-pointer'
            />
          ))}
        </div>
        <div className='flex items-center justify-between pli-5 plb-2 border-be'>
          <Typography variant='body2' color='text.secondary'>
            {chatStore.chats.length ? `${chatStore.chats.length} conversation${chatStore.chats.length > 1 ? 's' : ''}` : 'No conversations yet'}
          </Typography>
          {(isBelowMdScreen || chatStore.chats.length === 0) && (
            <Button
              size='small'
              variant='text'
              startIcon={<i className='ri-add-line' />}
              onClick={onOpenNewChat}
            >
              New Chat
            </Button>
          )}
        </div>
        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <ul className='p-3 pbs-4'>
            {renderChat({
              chatStore,
              getActiveUserData,
              backdropOpen,
              setSidebarOpen,
              isBelowMdScreen,
              setBackdropOpen
            }).filter(Boolean)}
            {!chatStore.chats.length && chatStore.contacts.length > 0 && (
              <div className='flex flex-col items-center gap-3 p-6'>
                <Typography variant='body2' color='text.secondary' className='text-center'>
                  No conversations yet. Start chatting with a team member.
                </Typography>
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<i className='ri-add-line' />}
                  onClick={onOpenNewChat}
                >
                  New Chat
                </Button>
              </div>
            )}
          </ul>
        </ScrollWrapper>
      </Drawer>

      <UserProfileLeft
        userSidebar={userSidebar}
        setUserSidebar={setUserSidebar}
        profileUserData={chatStore.profileUser}
        dispatch={dispatch}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
      />
    </>
  )
}

export default SidebarLeft
