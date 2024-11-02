// React Imports
'use client'
import { useState, useEffect } from 'react'
import './style.css';
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
import { AvatarGroup, Box, CardMedia, Checkbox, FormControlLabel, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Menu, Tooltip } from '@mui/material'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { toast } from 'react-toastify'
import { useData } from '@/contexts/DataContext'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomInput from './CustomInput'
import Fab from '@mui/material/Fab';
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLayoutsCollapsible from '@/app/[lang]/(dashboard)/(private)/manager/leads/FormLayoutsCollapsible';
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
    leadId: props.data._id,
    createdAt: props.data.createdAt,
    modify: props.data.updatedAt,
    assigned: props.data.assignedTo,
    profile: props.data.profile,
    moreData: props.data.additionalFields
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

    const token = localStorage.getItem('token') // Retrieve token once

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    try {
      const promises = [];

      if (formData.notes !== '') {
        promises.push(
          fetch('https://app.canbridge.in/api/leadactivity', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              leadId: userData.leadId,
              action: 'note_added',
              details: formData.notes
            })
          }).then(response => response.json().then(data => ({ response, data })))
        );
      }

      if (userData.status === 'New') {
        promises.push(
          fetch(`https://app.canbridge.in/api/leads/${userData.leadId}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: "Contacted" }) // Corrected JSON structure
          }).then(response => response.json().then(data => ({ response, data })))
        );
      }

      const results = await Promise.all(promises);

      results.forEach(result => {
        if (result.response.ok) {
          toast.success('Successfully updated', {
            position: 'bottom-right'
          });
        } else {
          throw new Error(result.data.message || 'An error occurred. Please try again.');
        }
      });

      updateData({ refresh: true });
      handleReset();
      handleClose();

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
      const response = await fetch('https://app.canbridge.in/api/followups/', {
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
  const [noteOpen, setNoteOpen] = useState(false)

  const handleClickOpen3 = () => setOpen3(true)
  const handleNoteOpen = () => setNoteOpen(true)
  const handleNoteClose = () => setNoteOpen(false)
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
      const response = await fetch('https://app.canbridge.in/api/leads/upload', {
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
      .get('https://app.canbridge.in/api/user-profiles', {
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

  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState(userData.status);
  const openstatus = Boolean(anchorEl);

  const leadStatuses = [
    'Interested',
    'Not Interested',
    'Converted',
    'Lost',
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authorization token found.')

        return
      }
      const response = await fetch(`https://app.canbridge.in/api/leads/${userData.leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        toast.error("Something goes wrong")
      }

      const data = await response.json();
      toast.success(`Lead Status changes to ${data.lead.status}`)
      setStatus(data.lead.status)
      handleClose();
    } catch (error) {
      console.error('Failed to update lead status:', error);
      throw error; // Rethrow error to handle in the UI
    }
    // setStatus(newStatus);

  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'primary'; // Blue
      case 'Contacted':
        return 'info'; // Light Blue
      case 'In Progress':
        return 'warning'; // Orange
      case 'Converted':
        return 'success'; // Green
      case 'Lost':
        return 'error'; // Red
      // default:
      //   return 'default'; // Grey (for default state)
    }
  };

  const [openAssign, setOpenAssign] = useState(false)
  const [selectedValue, setSelectedValue] = useState(userData?.assigned)
  const [update, setupdate] = useState("")
  const handleClickOpenAssign = () => setOpenAssign(true)

  const handleDialogCloseAssign = () => setOpenAssign(false)

  const handleCloseAssign = async value => {
    setSelectedValue(value)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authorization token found.')

        return
      }
      const response = await fetch(`https://app.canbridge.in/api/leads/assignlead/${userData.leadId}/${value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        toast.error("Something goes wrong")
      }

      const data = await response.json();
      toast.success(`Assigned Sucessfully`)
      setIsOpen(!isOpen)
      setupdate(data)
      setOpenAssign(false)
    } catch (error) {
      console.error('Failed to update lead status:', error);
      throw error; // Rethrow error to handle in the UI
    }
    // setStatus(newStatus);
  }
  const [isOpen, setIsOpen] = useState(false);

  const toggleBox = () => {
    setIsOpen(!isOpen);
  };

  const getTooltipTitle = () => {
    if (update) return update?.assignedTo?.firstName;  // If update is true, show "Updated"
    return userData?.assigned?.firstName;  // Otherwise, show the assigned user's first name
  };

  // States
  const [open4, setOpen4] = useState(false)

  const handleClickOpen4 = () => setOpen4(true)

  const handleClose4 = () => setOpen4(false)

  const handleCall = (phone) => {
    // Open the modal
    setOpen(true);

    // Delay the phone call by a short time so the user can see the modal
    setTimeout(() => {
      window.location.href = `tel:${phone}`;
    }, 1000); // Adjust the delay as necessary, 1000ms = 1 second
  };

  const formatLabel = (label) => {
    return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };
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
                  <Button onClick={handleClickOpen4}>Add more information</Button>
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
                  {/* <Accordion style={{ boxShadow: 'none', marginTop: '5px' }}>
                    <AccordionSummary style={{ padding: '0px' }} id='panel-header-1' aria-controls='panel-content-1'>
                      <Grid container spacing={2}>
                        <Typography color='text.primary' className='font-medium'>
                          Address
                        </Typography>
                      </Grid>
                    </AccordionSummary>
                    <AccordionDetails style={{ padding: '0px' }}>

                      <Grid item xs={12} sm={6} md={4} >

                        <Typography variant="h6" color="text.primary">
                          {userData.firstName}
                        </Typography>
                        <Typography color="text.secondary">
                          Phone: {userData.phone || 'N/A'}
                        </Typography>
                        <Typography color="text.secondary">
                          Email: {userData.email || 'N/A'}
                        </Typography>
                        <Typography color="text.secondary">
                          Address: {userData.profile?.address || 'N/A'}
                        </Typography>
                        <Typography color="text.secondary">
                          City: {userData.profile?.city || 'N/A'}
                        </Typography>
                        <Typography color="text.secondary">
                          State: {userData.profile?.state || 'N/A'}
                        </Typography>
                        <Typography color="text.secondary">
                          Country: {userData.profile?.country || 'N/A'}
                        </Typography>
                        <Typography color="text.secondary">
                          Pin Code: {userData.profile?.pinCode || 'N/A'}
                        </Typography>

                      </Grid>
                    </AccordionDetails>
                  </Accordion> */}
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

      <Dialog fullWidth id='popper' open={noteOpen} onClose={handleNoteClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Add Notes</DialogTitle>
        <DialogContent>
          <Grid marginTop={1} container spacing={6}>

            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                id='outlined-textarea'
                placeholder='Placeholder'
                label='Add Notes'
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoteClose} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant='contained'>
            Submit
          </Button>
        </DialogActions>
      </Dialog>



      <Dialog onClose={handleDialogCloseAssign} aria-labelledby='simple-dialog-title' open={openAssign}>
        <DialogTitle id='simple-dialog-title'>Assign Lead to</DialogTitle>
        <List className='pt-0 px-0'>
          {data.map((item, index) => (
            <ListItem key={index} disablePadding onClick={() => handleCloseAssign(item._id)}>
              <ListItemButton>
                <ListItemAvatar>
                  <CustomAvatar color='primary' skin='light'>
                    <i className='ri-user-3-line' />
                  </CustomAvatar>
                </ListItemAvatar>
                <ListItemText primary={item.firstName} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>

      <Dialog open={open4} onClose={handleClose4} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Complete Profile</DialogTitle>
        <DialogContent>
          <FormLayoutsCollapsible props={props.data} handleClose={handleClose4} />
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={handleClose4} variant='outlined' color='secondary'>
            Disagree
          </Button>
          <Button onClick={handleClose4} variant='contained'>
            Agree
          </Button>
        </DialogActions> */}
      </Dialog>




      <Card>

        <CardMedia image={data?.coverImg} className='bs-[150px] bg-primary'>
          <Box display={'flex'} justifyContent={'flex-end'} height={'100%'} alignItems={'flex-end'} width={'100%'}>
            {userData.assigned || update ?
              <AvatarGroup className='pull-up m-3' max={3} >
                <Tooltip title={getTooltipTitle()}>
                  <Box display={'flex'}>
                    {/* <Avatar onClick={toggleBox} src='/images/avatars/4.png' /> */}
                    <Avatar sx={{ bgcolor: "yellow" }} onClick={toggleBox} >{userData ? userData.assigned?.firstName?.substring(0, 2).toUpperCase() : '??'}</Avatar>
                    {isOpen && (
                      <IconButton onClick={handleClickOpenAssign} aria-label='capture screenshot' style={{ color: 'white' }} size='small'>
                        <i className='ri-user-search-fill text-xl' />
                      </IconButton>
                    )}
                  </Box>
                </Tooltip>
                {/* <Tooltip title='Howard Lloyd'>
                <Avatar src='/images/avatars/5.png' alt='Howard Lloyd' />
              </Tooltip> */}
              </AvatarGroup> : <Fab onClick={handleClickOpenAssign} className='m-2' aria-label='edit' size='small'>
                <i className='ri-user-add-line' />
              </Fab>}
          </Box>
        </CardMedia>
        <CardContent className='flex justify-center flex-col items-center gap-6 md:items-end md:flex-row !pt-0 md:justify-start'>
          <div className='flex rounded-bs-xl mbs-[-30px] mli-[-5px] border-[5px] border-be-0 border-backgroundPaper bg-backgroundPaper '>
            {/* <img height={120} width={120} src='/images/avatars/1.png' className='rounded' alt='Profile Background' /> */}
            <Avatar sx={{ width: 120, height: 120, fontSize: 50, bgcolor: "#DC4D01", color: 'white' }} className='rounded'>{userData ? userData.firstName.substring(0, 2).toUpperCase() : '??'}</Avatar>
          </div>
          <div className='flex is-full flex-wrap justify-start flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
            <div className='flex flex-col items-center sm:items-start gap-2'>
              <Typography variant='h4'>{userData?.firstName}</Typography>
              <div className='flex flex-wrap gap-6 gap-y-3 justify-center sm:justify-normal min-bs-[38px]'>
                <div className='flex items-center gap-2'>
                  <Chip icon={<i className='ri-megaphone-line'></i>} label={userData.campaign} variant='tonal' size='small' />
                </div>
                {/* <div className='flex items-center gap-2'>
                  <Chip label={userData.source} variant='tonal' size='small' />
                </div> */}
              </div>
            </div>
            {/* <Button variant='contained' className='flex gap-2'>
              <i className='ri-user-follow-line text-base'></i>
              <span>{userData.status}</span>
            </Button> */}

            <div >
              <Button
                aria-controls={openstatus ? 'lead-status-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openstatus ? 'true' : undefined}
                onClick={handleClick}
                variant="contained"
                color={getStatusColor(status)} // Dynamic color based on status
                sx={{ width: 128, height: 30 }} // Fixed width and height for button
              >
                {status}
              </Button>
              <Menu
                id="lead-status-menu"
                anchorEl={anchorEl}
                open={openstatus}
                onClose={handleStatusClose}
              >
                {leadStatuses.map((leadStatus) => (
                  <MenuItem
                    key={leadStatus}
                    onClick={() => handleStatusChange(leadStatus)}
                  >
                    {leadStatus}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </div>
        </CardContent>
      </Card>

      <br />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  Action
                </Typography>  <Button onClick={() => handleCall(userData.phone)} variant='contained' className='flex gap-2'>
                  <i className='ri-phone-line text-base'></i>
                  <span>Call</span>
                </Button>
                <Button onClick={handleClickOpen4} variant='contained' className='flex gap-2'>
                  <i className='ri-user-add-line text-base'></i>
                  <span>Complete Profile</span>
                </Button>
                <Button onClick={handleClickOpen2} variant='contained' className='flex gap-2'>
                  <i className='ri-calendar-line text-base'></i>
                  <span>Add Follow up</span>
                </Button>
                <Button onClick={handleNoteOpen} variant='contained' className='flex gap-2'>
                  <i class="ri-sticky-note-line"></i>
                  <span>Add Note</span>
                </Button>
                <Button onClick={handleClickOpen3} variant='contained' className='flex gap-2'>
                  <i className='ri-file-line text-base'></i>
                  <span>Add Documents</span>
                </Button>

              </div>
            </CardContent>
          </Card>
        </Grid>

        <br />
        <Grid item xs={12}>
          <Card>
            <CardContent className='flex flex-col gap-6'>
              {userData.moreData && (
                <div className="flex flex-col gap-4">
                  <Typography className="uppercase" variant="body2" color="text.disabled">
                    Enquiry Data
                  </Typography>
                  {Object.entries(userData.moreData).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <i className="ri-question-line"></i>
                      <div className="flex items-center flex-wrap gap-2">
                        <p style={{ fontSize: '12px' }}>{formatLabel(key)}</p>
                        <Typography>
                          <b>{value}</b>
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  CONTACTS
                </Typography>
                <div className='flex items-center gap-2'>
                  <i className='ri-phone-line text-base'></i>
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>Phone</Typography>
                    <Typography>{userData.phone || "No phone number provided"}</Typography>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='ri-mail-line text-base'></i>
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='font-medium'>E-mail</Typography>
                    <Typography>{userData.email}</Typography>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  PROFILE
                </Typography>
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>Age</Typography>
                  <Typography>{userData.profile?.age || "Not provided"}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>Address</Typography>
                  <Typography>{userData.profile?.address} {userData.profile?.city} {userData.profile?.state} {userData.profile?.pinCode}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>Created At</Typography>
                  {/* <Typography>{format(new Date(userData.createdAt), 'PPP')}</Typography> */}
                </div>
              </div>
              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  LEAD DETAILS
                </Typography>
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>Campaign</Typography>
                  <Typography>{userData.campaign}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>Source</Typography>
                  <Typography>{userData.source}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>Created At</Typography>
                  <Typography>{userData.createdAt}</Typography>
                </div>
              </div>

            </CardContent>
          </Card>
        </Grid>

      </Grid>
      {/* <Card>
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
      </Card> */}
    </>
  )
}

export default UserDetails
