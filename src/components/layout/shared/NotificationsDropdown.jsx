'use client'

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { debounce } from 'lodash'
import CustomAvatar from '@core/components/mui/Avatar'
import themeConfig from '@configs/themeConfig'
import { useSettings } from '@core/hooks/useSettings'
import { getInitials } from '@/utils/getInitials'
import { useSocket } from '@/hooks/useSocket'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  }

  return (
    <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
      {children}
    </PerfectScrollbar>
  )
}

const iconForType = type => {
  if (type === 'lead_assigned') return { avatarIcon: 'ri-user-shared-line', avatarColor: 'primary' }
  if (type === 'follow_up_reminder') return { avatarIcon: 'ri-calendar-check-line', avatarColor: 'warning' }
  if (String(type || '').includes('ticket')) return { avatarIcon: 'ri-coupon-3-line', avatarColor: 'info' }
  return { avatarIcon: 'ri-notification-2-line', avatarColor: 'secondary' }
}

const formatTime = value => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return String(value)
  }
}

const mapApiNotification = n => {
  const icons = iconForType(n.type)
  return {
    id: n._id,
    title: n.title || 'Notification',
    subtitle: n.message || '',
    time: formatTime(n.createdAt || n.timestamp),
    read: n.status ? n.status !== 'unread' : Boolean(n.read),
    type: n.type,
    ...icons
  }
}

const getAvatar = params => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  }
  if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  }
  return (
    <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
      {avatarText || getInitials(title)}
    </CustomAvatar>
  )
}

const NotificationDropdown = ({ notifications = [] }) => {
  const [open, setOpen] = useState(false)
  const [notificationsState, setNotificationsState] = useState(() =>
    (notifications || []).map(n => (n.id || n._id ? mapApiNotification(n) : n))
  )
  const [loading, setLoading] = useState(false)

  const notificationCount = useMemo(
    () => notificationsState.filter(notification => !notification.read).length,
    [notificationsState]
  )

  const readAll = useMemo(
    () => notificationsState.length > 0 && notificationsState.every(notification => notification.read),
    [notificationsState]
  )

  const anchorRef = useRef(null)
  const ref = useRef(null)
  const { notificationData } = useSocket()
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const fetchNotifications = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token || !process.env.NEXT_PUBLIC_API_URL) return

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/getall?limit=30`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        setNotificationsState([])
        return
      }
      const data = await res.json()
      const list = Array.isArray(data.notifications) ? data.notifications : Array.isArray(data) ? data : []
      setNotificationsState(list.map(mapApiNotification))
    } catch (err) {
      console.error('Failed to load notifications', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!notificationData) return
    const mapped = mapApiNotification({
      ...notificationData,
      status: notificationData.status || 'unread',
      createdAt: notificationData.createdAt || notificationData.timestamp || new Date()
    })
    setNotificationsState(prev => {
      if (mapped.id && prev.some(n => String(n.id) === String(mapped.id))) return prev
      return [mapped, ...prev]
    })
  }, [notificationData])

  const handleReadNotification = useCallback(async (event, value, index) => {
    event.stopPropagation()
    const item = notificationsState[index]
    setNotificationsState(prev => {
      const next = [...prev]
      next[index] = { ...next[index], read: value }
      return next
    })

    if (!item?.id) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/update/${item.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: value ? 'read' : 'unread' })
      })
    } catch (err) {
      console.error('Failed to update notification', err)
    }
  }, [notificationsState])

  const handleRemoveNotification = useCallback(async (event, index) => {
    event.stopPropagation()
    const item = notificationsState[index]
    setNotificationsState(prev => {
      const next = [...prev]
      next.splice(index, 1)
      return next
    })
    if (!item?.id) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/delete/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.error('Failed to delete notification', err)
    }
  }, [notificationsState])

  const readAllNotifications = useCallback(async () => {
    const markRead = !readAll
    setNotificationsState(prev => prev.map(n => ({ ...n, read: markRead })))
    if (!markRead) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.error('Failed to mark all read', err)
    }
  }, [readAll])

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        const availableHeight = window.innerHeight - 100
        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    adjustPopoverHeight()
    const debouncedAdjust = debounce(adjustPopoverHeight, 250)
    window.addEventListener('resize', debouncedAdjust)
    return () => {
      window.removeEventListener('resize', debouncedAdjust)
      debouncedAdjust.cancel()
    }
  }, [])

  const handleClose = () => setOpen(false)
  const handleToggle = () => {
    setOpen(prev => !prev)
    if (!open) fetchNotifications()
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='ri-notification-2-line' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-4 z-[1] max-bs-[550px] bs-[550px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: { padding: themeConfig.layoutPadding }
                }
              ]
            }
          : { className: 'is-96 !mbs-4 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      Notifications
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip variant='tonal' size='small' color='primary' label={`${notificationCount} New`} />
                    )}
                    <Tooltip
                      title={readAll ? 'Mark all as unread' : 'Mark all as read'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                    >
                      {notificationsState.length > 0 ? (
                        <IconButton size='small' onClick={() => readAllNotifications()} className='text-textPrimary'>
                          <i className={classnames(readAll ? 'ri-mail-line' : 'ri-mail-open-line', 'text-xl')} />
                        </IconButton>
                      ) : null}
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {loading && notificationsState.length === 0 ? (
                      <Typography className='pli-4 plb-6' color='text.secondary'>
                        Loading…
                      </Typography>
                    ) : null}
                    {!loading && notificationsState.length === 0 ? (
                      <Typography className='pli-4 plb-6' color='text.secondary'>
                        No notifications yet
                      </Typography>
                    ) : null}
                    {notificationsState.map((notification, index) => {
                      const {
                        title,
                        subtitle,
                        time,
                        read,
                        avatarImage,
                        avatarIcon,
                        avatarText,
                        avatarColor,
                        avatarSkin,
                        id
                      } = notification

                      return (
                        <div
                          key={id || index}
                          className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
                            'border-be': index !== notificationsState.length - 1
                          })}
                          onClick={e => handleReadNotification(e, true, index)}
                        >
                          {getAvatar({ avatarImage, avatarIcon, title, avatarText, avatarColor, avatarSkin })}
                          <div className='flex flex-col flex-auto'>
                            <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
                              {title}
                            </Typography>
                            <Typography variant='caption' className='mbe-2' color='text.secondary'>
                              {subtitle}
                            </Typography>
                            <Typography variant='caption' color='text.disabled'>
                              {time}
                            </Typography>
                          </div>
                          <div className='flex flex-col items-end gap-2'>
                            <Badge
                              variant='dot'
                              color={read ? 'secondary' : 'primary'}
                              onClick={e => handleReadNotification(e, !read, index)}
                              className={classnames('mbs-1 mie-1', {
                                'invisible group-hover:visible': read
                              })}
                            />
                            <i
                              className='ri-close-line text-xl invisible group-hover:visible text-textSecondary'
                              onClick={e => handleRemoveNotification(e, index)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                    <Button fullWidth variant='contained' size='small' onClick={fetchNotifications}>
                      Refresh
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
