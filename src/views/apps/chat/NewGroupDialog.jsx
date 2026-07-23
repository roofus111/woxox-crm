'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

const NewGroupDialog = ({ open, onClose, contacts = [], onCreate }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState([])
  const [saving, setSaving] = useState(false)

  const people = contacts.filter(c => !c.isGroup)

  const handleCreate = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        memberIds: members.map(m => m.id),
      })
      setName('')
      setDescription('')
      setMembers([])
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Create group</DialogTitle>
      <DialogContent className='flex flex-col gap-4 pt-2'>
        <TextField
          label='Group name'
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          autoFocus
        />
        <TextField
          label='Description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />
        <Autocomplete
          multiple
          options={people}
          getOptionLabel={o => o.fullName || ''}
          value={members}
          onChange={(_, value) => setMembers(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip {...getTagProps({ index })} key={option.id} label={option.fullName} size='small' />
            ))
          }
          renderInput={params => <TextField {...params} label='Add members' placeholder='Search people' />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleCreate} disabled={!name.trim() || saving}>
          {saving ? <CircularProgress size={18} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewGroupDialog
