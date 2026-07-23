'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

const ForwardDialog = ({ open, onClose, contacts = [], groups = [], message, onForward }) => {
  const [targets, setTargets] = useState([])
  const [saving, setSaving] = useState(false)

  const options = [
    ...contacts.filter(c => !c.isGroup).map(c => ({ ...c, kind: 'user', label: c.fullName })),
    ...groups.map(g => ({
      id: g._id || g.id,
      fullName: g.name,
      kind: 'group',
      label: `${g.name} (Group)`,
    })),
  ]

  const handleForward = async () => {
    if (!targets.length || !message?.messageId || saving) return
    setSaving(true)
    try {
      await onForward({
        messageId: message.messageId,
        toUserIds: targets.filter(t => t.kind === 'user').map(t => t.id),
        toGroupIds: targets.filter(t => t.kind === 'group').map(t => t.id),
      })
      setTargets([])
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Forward message</DialogTitle>
      <DialogContent className='flex flex-col gap-3 pt-2'>
        <Typography variant='body2' color='text.secondary' className='truncate'>
          {message?.message || message?.fileName || 'Attachment'}
        </Typography>
        <Autocomplete
          multiple
          options={options}
          getOptionLabel={o => o.label || o.fullName || ''}
          value={targets}
          onChange={(_, value) => setTargets(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip {...getTagProps({ index })} key={`${option.kind}-${option.id}`} label={option.label} size='small' />
            ))
          }
          renderInput={params => <TextField {...params} label='Forward to' placeholder='People or groups' />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleForward} disabled={!targets.length || saving}>
          {saving ? <CircularProgress size={18} /> : 'Forward'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ForwardDialog
