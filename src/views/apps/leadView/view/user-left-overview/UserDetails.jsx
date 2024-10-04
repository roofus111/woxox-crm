// React Imports
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import { useRouter } from 'next/navigation'
import Avatar from '@mui/material/Avatar'
// Components Imports
import CustomIconButton from '@core/components/mui/IconButton'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'

// Component Imports
import EditUserInfo from '@components/dialogs/edit-user-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'
import { styled } from '@mui/material/styles'
import { useDropzone } from 'react-dropzone'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { Box, Checkbox, FormControlLabel } from '@mui/material'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { toast } from 'react-toastify'
import { useData } from '@/contexts/DataContext'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomInput from './CustomInput'

import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
// import Checkbox from '@mui/material'

const UserDetails = props => {
  const { updateData } = useData()
  // Vars
  const router = useRouter()
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })
  let content = null
  const userData = {
    firstName: props.data.name,
    status: props.data.status,
    campaign: props.data.campaign,
    source: props.data.source,
    phone: props.data.phone,
    email: props.data.email,
    role: 'Subscriber',
    taxId: 'Tax-8894',
    contact: '+1 (234) 464-0600',
    language: ['English'],
    country: 'France',
    useAsBillingAddress: true,
    leadId: props.data._id
  }
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  const [formData, setFormData] = useState({
    notes: ''
  })
  const [docData, setDocData] = useState({
    docName: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loading2, setLoading2] = useState(false)
  const [error2, setError2] = useState('')

  const handleReset = () => {
    setFormData({
      notes: ''
    })
  }
  const handleReset2 = () => {
    setFormData({
      notes: ''
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      if (formData.notes !== '') {
        const response = await fetch('http://localhost:8000/api/leadactivity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            leadId: userData.leadId,
            action: 'note_added',
            details: formData.notes
          })
        })

        const data = await response.json()

        if (response.ok) {
          updateData({ refresh: true })
          toast.success('Successfully uploaded', {
            position: 'bottom-right'
          })
          handleReset() // Reset form after successful submission
          handleClose()
        } else {
          setError(data.message || 'An error occurred. Please try again.')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [open2, setOpen2] = useState(false)

  const handleClickOpen2 = () => setOpen2(true)

  const handleClose2 = () => setOpen2(false)

  const [time, setTime] = useState(new Date())
  const [dateTime, setDateTime] = useState(new Date())
  const [value, setValue] = useState('Controlled')

  const [followupData, setfollowupData] = useState({ notes: '' })
  const [assign, setAssign] = useState('')

  const handleSubmit2 = async () => {
    setError2('')
    setLoading2(true)

    try {
      const body = {
        leadId: userData.leadId,
        followUpDate: Date.now(),
        status: 'Pending',
        nextFollowUpDate: dateTime,
        notes: followupData.notes,
        assignedTo: assign
      }
      console.log(body)
      const token = localStorage.getItem('token')
      // Example API call to submit the form
      const response = await fetch('http://localhost:8000/api/followups/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('New Follow Up added', {
          position: 'bottom-right'
        })
        handleReset2() // Reset form after successful submission
      } else {
        toast.error('An error occurred. Please try again.', {
          position: 'bottom-right'
        })
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.', {
        position: 'bottom-right'
      })
    } finally {
      setLoading2(false)
    }
  }
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
  const [open3, setOpen3] = useState(false)

  const handleClickOpen3 = () => setOpen3(true)

  const handleClose3 = () => setOpen3(false)

  const [file, setFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false, // Ensure single file upload
    accept: {
      'application/pdf': ['.pdf'], // Allow PDF uploads
      'image/*': ['.png', '.jpg', '.jpeg'] // Allow image uploads
    },
    onDrop: acceptedFiles => {
      const selectedFile = acceptedFiles[0]
      if (selectedFile.size > MAX_FILE_SIZE) {
        setErrorMessage('File size exceeds 5MB')
        return
      }

      setErrorMessage('')
      setFile(Object.assign(selectedFile, { preview: URL.createObjectURL(selectedFile) }))
    }
  })
  // Handle changing the file selection
  const handleChangeFile = () => {
    setFile(null) // Reset the file state to allow re-upload
  }
  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload')
      return
    }
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('docName', docData.docName)
    formData.append('leadId', userData.leadId)
    try {
      const response = await fetch('http://localhost:8000/api/leads/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}` // Only include Authorization, no need for Content-Type
        },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        alert('File uploaded successfully')
        setFile(null) // Clear the selected file
      } else {
        setErrorMessage(data.error)
      }
    } catch (error) {
      setErrorMessage('An error occurred during the upload.')
    }
  }
  const [data, setData] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get('http://localhost:8000/api/user-profiles', {
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
  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.preview) // Clean up the object URL
      }
    }
  }, [file])

  const [isVisible, setIsVisible] = useState(false)
  const handleVisibilityChange = event => {
    setIsVisible(event.target.checked)
  }

  return (
    <>
      <Dialog fullScreen open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Caller Mode</DialogTitle>
        <DialogContent>
          <Card>
            <CardContent className='flex flex-col pbs-12 gap-6'>
              <div>
                <Box display={'flex'} justifyContent={'space-between'}>
                  <Typography variant='h5'>Customer Details</Typography>
                  <Button>Add more information</Button>
                </Box>

                <Divider className='mlb-4' />
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center flex-wrap gap-x-1.5'>
                    <Typography color='text.primary' className='font-medium'>
                      Full Name
                    </Typography>
                    <Typography>{userData.firstName}</Typography>
                  </div>
                  <div className='flex items-center flex-wrap gap-x-1.5'>
                    <Typography color='text.primary' className='font-medium'>
                      Email
                    </Typography>
                    <Typography>{userData.email}</Typography>
                  </div>
                  <div className='flex items-center flex-wrap gap-x-1.5'>
                    <Typography color='text.primary' className='font-medium'>
                      Phone:
                    </Typography>
                    <Typography>{userData.phone}</Typography>
                  </div>
                </div>
                <>
                  <Accordion style={{ boxShadow: 'none', marginTop: '5px' }}>
                    <AccordionSummary style={{ padding: '0px' }} id='panel-header-1' aria-controls='panel-content-1'>
                      <p>More information</p>
                    </AccordionSummary>
                    <AccordionDetails style={{ padding: '0px' }}>
                      <Typography>
                        Wafer sesame snaps chocolate bar candy canes halvah. Cupcake sesame snaps sweet tart dessert
                        biscuit. Topping soufflé tart sweet croissant.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </>
                <Divider className='mlb-4' />
                <div>
                  <TextField
                    fullWidth
                    multiline
                    variant='standard'
                    id='textarea-standard'
                    placeholder='Placeholder'
                    label='Add Notes'
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Box display={'flex'} justifyContent={'flex-end'} gap={3} marginTop={3}>
                  <Button onClick={handleClickOpen2} variant='outlined' color='primary'>
                    Add Follow up
                  </Button>
                  <Button onClick={handleClickOpen3} variant='outlined' color='primary'>
                    Upload Document
                  </Button>
                </Box>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='contained' color='error'>
            Not Picked
          </Button>
          <Button onClick={handleSubmit} variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* follow Up */}

      <Dialog id='popper' open={open2} onClose={handleClose2} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Add Follow up</DialogTitle>
        <DialogContent>
          <Grid marginTop={1} container spacing={6}>
            <Grid item xs={12} sm={12}>
              <AppReactDatepicker
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
                selected={dateTime}
                id='date-time-picker'
                dateFormat='MM/dd/yyyy h:mm aa'
                onChange={date => setDateTime(date)}
                customInput={<CustomInput label='Date & Time' />}
                portalId='popper'
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <TextField
                onChange={e => setfollowupData({ ...followupData, notes: e.target.value })}
                fullWidth
                rows={4}
                multiline
                label='Notes'
                id='textarea-outlined-static'
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <div className='d-flex'>
                <label>Assign to others</label>
                <Checkbox checked={isVisible} onChange={handleVisibilityChange} />
              </div>
            </Grid>
            {isVisible && (
              <Grid item xs={12} sm={12}>
                <Select
                  fullWidth
                  defaultValue=''
                  id='demo-basic-select-helper'
                  labelId='demo-basic-select-helper-label'
                  onChange={e => setAssign(e.target.value)}
                >
                  {data.map((item, index) => {
                    return <MenuItem value={item._id}>{item.firstName}</MenuItem>
                  })}
                </Select>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose2} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit2} variant='contained'>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog id='popper' open={open3} onClose={handleClose3} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Add Follow up</DialogTitle>
        <DialogContent>
          <Grid marginTop={1} container spacing={6}>
            {' '}
            <Grid item xs={12} sm={12}>
              <TextField
                onChange={e => setDocData({ ...docData, docName: e.target.value })}
                fullWidth
                id='outlined-basic'
                label='Document Type'
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Box {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                {file ? ( // Check if file is selected
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Typography variant='h6'>{file.name}</Typography>
                    <Button onClick={handleChangeFile}>Change</Button>
                  </Box>
                ) : (
                  <Box
                    className='flex items-center flex-col'
                    sx={{
                      border: '2px dotted',
                      borderColor: 'gray',
                      padding: 5,
                      borderRadius: 1
                    }}
                  >
                    <Avatar variant='rounded' className='bs-12 is-12 mbe-9'>
                      <i className='ri-upload-2-line' />
                    </Avatar>
                    <Typography variant='h4' className='mbe-2.5'>
                      Drop PDF or image file here or click to upload.
                    </Typography>
                    <Typography color='text.secondary'>
                      Drop files here or click{' '}
                      <a href='/' onClick={e => e.preventDefault()} className='text-textPrimary no-underline'>
                        browse
                      </a>{' '}
                      through your machine.
                    </Typography>
                  </Box>
                )}
                {errorMessage && <Typography color='error'>{errorMessage}</Typography>}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose3} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant='contained'>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col items-center justify-center gap-4'>
              <CustomAvatar
                alt='user-profile'
                src='/images/avatars/1.png'
                variant='rounded'
                className='rounded-lg'
                size={120}
              />
              <Typography variant='h5'>{userData.firstName}</Typography>
              <div className='flex gap-2'>
                <Chip label={userData.status} variant='tonal' color='error' size='small' />
                <Chip label={userData.campaign} variant='tonal' color='error' size='small' />
                <Chip label={userData.source} variant='tonal' color='error' size='small' />
              </div>
            </div>
            <div className='flex items-center justify-around flex-wrap gap-4'>
              <div className='flex items-center '>
                <CustomAvatar onClick={handleClickOpen} variant='rounded' color='primary' skin='light'>
                  <i className='ri-phone-line' />
                </CustomAvatar>
              </div>
              <div className='flex items-center '>
                <CustomAvatar variant='rounded' color='primary' skin='light'>
                  <i className='ri-mail-line' />
                </CustomAvatar>
              </div>
              <div className='flex items-center '>
                <CustomAvatar variant='rounded' color='primary' skin='light'>
                  <i className='ri-whatsapp-line' />
                </CustomAvatar>
              </div>
            </div>
          </div>
          <div>
            <Typography variant='h5'>Basic Information</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Full Name
                </Typography>
                <Typography>{userData.firstName}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Email
                </Typography>
                <Typography>{userData.email}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Phone:
                </Typography>
                <Typography>{userData.phone}</Typography>
              </div>
            </div>
          </div>
          <div className='flex gap-4 justify-center'>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Edit', 'primary', 'contained')}
              dialog={EditUserInfo}
              dialogProps={{ data: userData }}
            />
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Suspend', 'error', 'outlined')}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'suspend-account' }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default UserDetails
