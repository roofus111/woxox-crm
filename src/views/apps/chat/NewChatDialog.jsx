'use client'

import { useEffect, useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { statusObj } from './SidebarLeft'

const NewChatDialog = ({
  open,
  onClose,
  contacts,
  existingChatUserIds,
  onSelectContact,
  onRefreshContacts,
}) => {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [localContacts, setLocalContacts] = useState(contacts)

  useEffect(() => {
    setLocalContacts(contacts)
  }, [contacts])

  useEffect(() => {
    if (!open) return

    const load = async () => {
      if (contacts.length > 0) return
      if (!onRefreshContacts) return

      setLoading(true)
      try {
        const refreshed = await onRefreshContacts()
        setLocalContacts(refreshed || [])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [open, contacts.length, onRefreshContacts])

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return localContacts.filter(contact => {
      if (!query) return true
      return (
        contact.fullName?.toLowerCase().includes(query) ||
        contact.role?.toLowerCase().includes(query)
      )
    })
  }, [localContacts, search])

  const handleSelect = contact => {
    onSelectContact(contact)
    setSearch('')
    onClose()
  }

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='xs'>
      <DialogTitle className='flex items-center justify-between gap-2'>
        <span>New Chat</span>
        <IconButton size='small' onClick={handleClose} aria-label='Close'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent className='pbs-0'>
        <TextField
          fullWidth
          size='small'
          placeholder='Search team members...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='mbe-4'
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='ri-search-line text-xl' />
              </InputAdornment>
            )
          }}
        />

        {loading ? (
          <div className='flex justify-center py-8'>
            <CircularProgress size={28} />
          </div>
        ) : filteredContacts.length === 0 ? (
          <Typography variant='body2' color='text.secondary' className='text-center py-8'>
            {search
              ? 'No contacts match your search'
              : 'No other team members found in your company'}
          </Typography>
        ) : (
          <List disablePadding className='max-bs-80 overflow-y-auto'>
            {filteredContacts.map(contact => {
              const hasChat = existingChatUserIds.includes(contact.id?.toString())

              return (
                <ListItemButton
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className='rounded-lg mbe-1'
                >
                  <ListItemAvatar>
                    {contact.avatar ? (
                      <Avatar alt={contact.fullName} src={contact.avatar} />
                    ) : (
                      <CustomAvatar color={contact.avatarColor} skin='light'>
                        {getInitials(contact.fullName)}
                      </CustomAvatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.fullName}
                    secondary={contact.role}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <div className='flex items-center gap-2'>
                    {hasChat && <Chip label='Chat exists' size='small' variant='outlined' />}
                    <Typography
                      component='span'
                      variant='caption'
                      color={`${statusObj[contact.status] || 'secondary'}.main`}
                    >
                      ●
                    </Typography>
                  </div>
                </ListItemButton>
              )
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default NewChatDialog
