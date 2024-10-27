'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 5MB

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { toast } from 'react-toastify'

const Leads = () => {
  // States
  const [formData, setFormData] = useState({
    campaign: '',
    source: '',
    name: '',
    email: '',
    phone: ''
  })
  const [uploadData, setUploadData] = useState({
    campaign: '',
    source: ''
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form Validation
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields.')
      return false
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.')
      return false
    }

    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      // Example API call to submit the form
      const response = await fetch('http://13.127.160.185:8000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Lead submitted successfully!')
        handleReset() // Reset form after successful submission
      } else {
        setError(data.message || 'An error occurred. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      campaign: '',
      source: '',
      name: '',
      email: '',
      phone: ''
    })
    setError('')
    setSuccess('')
  }

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false)
    setUploading(false)
  }

  // States
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  // Dropzone Hooks
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'application/vnd.ms-excel': ['.xls']
    },
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0]
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage('File size exceeds 5MB')
        return
      }

      setErrorMessage('')
      setFiles([Object.assign(file)])
    }
  })

  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  const handleUploadSubmit = async e => {
    e.preventDefault()
    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()

      // Assuming files is an array with a single file
      formData.append('file', files[0]) // Upload the first file
      formData.append('campaign', uploadData.campaign)
      formData.append('source', uploadData.source)

      // Example API call to submit the form
      const response = await fetch('http://13.127.160.185:8000/api/excel/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}` // Only include Authorization, no need for Content-Type
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Successfully uploaded', {
          position: 'bottom-right'
        })
        setUploading(false)
        handleClose()
        setFiles([])
        setUploadData({
          campaign: '',
          source: ''
        })
      } else {
        toast.error('An error occurred. Please try again.', {
          position: 'bottom-right'
        })
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.', {
        position: 'bottom-right'
      })
    }
  }

  return (
    <>
      <Box margin={5} display={'flex'} justifyContent={'flex-end'}>
        <Button variant='contained' onClick={handleClickOpen}>
          Bulk Upload
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Upload XLSX</DialogTitle>
        <DialogContent>
          <DialogContentText className='mbe-3'>
            {/* To subscribe to this website, please enter your email address here. We will send updates occasionally. */}
          </DialogContentText>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Campaign'
                value={uploadData.campaign}
                placeholder='Campaign'
                onChange={e => setUploadData({ ...uploadData, campaign: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <Box {...getRootProps({ className: 'dropzone' })} {...files.length}>
                <input {...getInputProps()} />
                {files.length ? (
                  <>
                    <Box display={'flex'} justifyContent={'space-between'}>
                      <Typography variant='h6'>{files[0].name}</Typography>
                      <Button>change</Button>
                    </Box>
                  </>
                ) : (
                  <Box
                    className='flex items-center flex-col'
                    sx={{
                      border: '2px dotted', // Dotted border
                      borderColor: 'gray', // You can choose any color, e.g., primary.main
                      padding: 5, // Padding inside the box
                      borderRadius: 1 // Optional: border radius for rounded corners
                    }}
                  >
                    <Avatar variant='rounded' className='bs-12 is-12 mbe-9'>
                      <i className='ri-upload-2-line' />
                    </Avatar>
                    <Typography variant='h4' className='mbe-2.5'>
                      Drop XLS file here or click to upload.
                    </Typography>
                    <Typography color='text.secondary'>
                      Drop files here or click{' '}
                      <a href='/' onClick={e => e.preventDefault()} className='text-textPrimary no-underline'>
                        browse
                      </a>{' '}
                      through your machine
                    </Typography>
                  </Box>
                )}
                {errorMessage && <Typography color='error'>{errorMessage}</Typography>}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Source'
                value={uploadData.source}
                placeholder='facebook,instagram'
                onChange={e => setUploadData({ ...uploadData, source: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleUploadSubmit} type='submit' variant='contained' disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      <Card>
        <CardHeader title='Create a new Lead' />
        <Divider />
        <form>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='body2' className='font-medium' color='text.primary'>
                  1. Lead Category
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Campaign'
                  placeholder='Campaign Name'
                  value={formData.campaign}
                  onChange={e => setFormData({ ...formData, campaign: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Source'
                  value={formData.source}
                  placeholder='facebook,instagram'
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body2' className='font-medium' color='text.primary'>
                  2. Lead Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Full Name'
                  placeholder='Name'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='email'
                  label='Email'
                  placeholder='example@gmail.com'
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Phone Number'
                  type='tel'
                  placeholder='123-456-7890'
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Typography variant='body2' color='error'>
                    {error}
                  </Typography>
                </Grid>
              )}
              {success && (
                <Grid item xs={12}>
                  <Typography variant='body2' color='success'>
                    {success}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
          <Divider />
          <CardActions>
            <Button onClick={handleSubmit} variant='contained' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
            <Button type='reset' variant='outlined' onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </CardActions>
        </form>
      </Card>{' '}
    </>
  )
}

export default Leads
