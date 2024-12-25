// React Imports
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
// MUI Imports
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { Button, Box } from '@mui/material'
import MeetingSchedule from '@views/user/MeetingSchedule'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import ListItemText from '@mui/material/ListItemText'
import Select from '@mui/material/Select'
import { toast } from 'react-toastify'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      inlineSize: 250,
      maxBlockSize: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}

const Leads = () => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)
  const [data, setData] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setData(response.data) // Update data if component is still mounted
        console.log(response.data)
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
      })
  }, [])

  // States
  const [personName, setPersonName] = useState([])
  const [personNameNative, setPersonNameNative] = useState([])

  const handleChange = event => {
    setPersonName(event.target.value)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(personName) // Ensure the body structure matches expected API input
      })

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json() // Assuming the server responds with JSON error details
        toast.error(errorData.message || 'Unknown error occurred.')
        return // Stop further execution in case of HTTP error
      }

      const data = await response.json()
      toast.success(data)
    } catch (error) {
      // This will catch network errors or issues with the fetch operation itself
      toast.error(error.message || 'Network error occurred.')
    }
  }

  return (
    <>
      <MeetingSchedule user={data} />

      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Assign leads</DialogTitle>
        <DialogContent>
          <div>
            <Typography className='mbe-2 font-medium' color='text.primary'>
              Select counsellors
            </Typography>
            <FormControl fullWidth>
              <InputLabel id='demo-multiple-checkbox-label'>Tag</InputLabel>
              <Select
                multiple
                label='Tag'
                value={personName}
                MenuProps={MenuProps}
                onChange={handleChange}
                id='demo-multiple-checkbox'
                labelId='demo-multiple-checkbox-label'
                renderValue={personName => `${personName.length} people selected`}
              >
                {data.map(name => (
                  <MenuItem key={name._id} value={name}>
                    <Checkbox checked={personName.indexOf(name) > -1} />
                    <ListItemText primary={name.firstName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary'>
            Disagree
          </Button>
          <Button onClick={handleSubmit} variant='contained'>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Leads
