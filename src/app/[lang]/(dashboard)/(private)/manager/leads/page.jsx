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
import ResizableDrawer from "../leads/components/ResizableDrawer"

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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [selectedLeadData, setSelectedLeadData] = useState(null)
  const [leadsData, setLeadsData] = useState([]) // Separate state for leads

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [data, setData] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')

    // Fetch user profiles (counsellors)
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setData(response.data)
        console.log('User profiles:', response.data)
      })
      .catch(error => {
        console.error('Failed to fetch user profiles:', error)
      })

    // Fetch leads data
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setLeadsData(response.data)
        console.log('Leads data:', response.data)
      })
      .catch(error => {
        console.error('Failed to fetch leads:', error)
      })
  }, [])

  // Function to handle lead selection and open drawer
  const handleLeadClick = (lead) => {
    setSelectedLeadId(lead._id || lead.id)
    setSelectedLeadData(lead)
    setDrawerOpen(true)
  }

  // Function to close drawer
  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedLeadId(null)
    setSelectedLeadData(null)
  }

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
        body: JSON.stringify(personName)
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || 'Unknown error occurred.')
        return
      }

      const data = await response.json()
      toast.success('Leads assigned successfully!')
      // Refresh leads data after assignment
      const updatedLeadsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setLeadsData(updatedLeadsResponse.data)
    } catch (error) {
      toast.error(error.message || 'Network error occurred.')
    }
  }

  return (
    <>
      <MeetingSchedule
        user={data}
        leads={leadsData}
        onLeadClick={handleLeadClick}
      />

      {/* Assign Leads Dialog */}
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

      {/* ResizableDrawer for Lead Details */}
      <ResizableDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        title="Lead Details"
        leadId={selectedLeadId}
        leadData={selectedLeadData}
        userName={selectedLeadData?.name || selectedLeadData?.firstName || "Unknown Lead"}
      />
    </>
  )
}

export default Leads