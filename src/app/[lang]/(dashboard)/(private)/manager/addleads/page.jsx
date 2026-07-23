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
import { DialogContentText, Select, MenuItem, InputLabel, FormControl, FormHelperText, Stepper, Step, StepLabel } from '@mui/material'
import { toast } from 'react-toastify'
import axios from 'axios'

const MAPPABLE_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'phone', label: 'Phone', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'district', label: 'District', required: false }
]

const Leads = ({ campid, onClose }) => {

  const districtsInKerala = [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ];

  const [formData, setFormData] = useState({
    campaign: '',
    campaignid: "",
    source: '',
    name: '',
    email: '',
    phone: '',
    district: 'Welocome'
  })
  const [uploadData, setUploadData] = useState({
    campaignid: '',
    source: ''
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form Validation
  const validateForm = () => {
    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields.')
      return false
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
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
        handleReset();
        if (onClose) {
          onClose();
        }
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
      campaignid: '',
      source: '',
      name: '',
      email: '',
      phone: '',
      district: ' '
    })
    setError('')
    setSuccess('')
  }

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)

  const resetBulkUpload = () => {
    setUploading(false)
    setReadingHeaders(false)
    setUploadStep(0)
    setFiles([])
    setFileHeaders([])
    setSampleRows([])
    setRowCount(0)
    setFieldMap({ name: '', phone: '', email: '', district: '' })
    setErrorMessage('')
  }

  const handleClose = () => {
    setOpen(false)
    resetBulkUpload()
  }

  // States
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadStep, setUploadStep] = useState(0)
  const [readingHeaders, setReadingHeaders] = useState(false)
  const [fileHeaders, setFileHeaders] = useState([])
  const [sampleRows, setSampleRows] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [fieldMap, setFieldMap] = useState({
    name: '',
    phone: '',
    email: '',
    district: ''
  })

  // Dropzone Hooks
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv']
    },
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0]
      if (!file) return
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage('File size exceeds 50MB')
        return
      }

      setErrorMessage('')
      setFiles([file])
      setUploadStep(0)
      setFileHeaders([])
      setSampleRows([])
      setRowCount(0)
      setFieldMap({ name: '', phone: '', email: '', district: '' })
    }
  })

  useEffect(() => {
    return () => {
      files.forEach(file => file.preview && URL.revokeObjectURL(file.preview))
    }
  }, [files])

  const handleReadHeaders = async () => {
    if (!files.length) {
      toast.error('Please select an Excel or CSV file to upload.', { position: 'bottom-right' })
      return
    }
    if (!uploadData.campaignid) {
      toast.error('Please select a campaign.', { position: 'bottom-right' })
      return
    }

    setReadingHeaders(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', files[0])

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excel/headers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || data.details || 'Failed to read file columns.', { position: 'bottom-right' })
        return
      }

      setFileHeaders(data.headers || [])
      setSampleRows(data.sampleRows || [])
      setRowCount(data.rowCount || 0)
      setFieldMap({
        name: data.suggestedMapping?.name || '',
        phone: data.suggestedMapping?.phone || '',
        email: data.suggestedMapping?.email || '',
        district: data.suggestedMapping?.district || ''
      })
      setUploadStep(1)
    } catch (err) {
      toast.error('Failed to read file columns. Please try again.', { position: 'bottom-right' })
    } finally {
      setReadingHeaders(false)
    }
  }

  const handleUploadSubmit = async e => {
    e?.preventDefault?.()
    if (!files.length) {
      toast.error('Please select an Excel or CSV file to upload.', { position: 'bottom-right' })
      return
    }
    if (!uploadData.campaignid) {
      toast.error('Please select a campaign.', { position: 'bottom-right' })
      return
    }
    if (!fieldMap.name || !fieldMap.phone) {
      toast.error('Please map Name and Phone columns before importing.', { position: 'bottom-right' })
      return
    }

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('campaignid', uploadData.campaignid)
      formData.append('source', uploadData.source || '')
      formData.append('fieldMap', JSON.stringify(fieldMap))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excel/upload-mapped`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        const created = data.created ?? 0
        const duplicates = data.duplicates ?? 0
        const skipped = data.skipped ?? 0
        toast.success(
          `Upload complete: ${created} lead(s) created${duplicates ? `, ${duplicates} duplicate(s) skipped` : ''}${skipped ? `, ${skipped} row(s) skipped` : ''}.`,
          { position: 'bottom-right' }
        )
        setUploadData({ campaignid: campid?._id || '', source: '' })
        handleClose()
      } else {
        toast.error(data.error || data.details || data.message || 'An error occurred. Please try again.', {
          position: 'bottom-right'
        })
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.', {
        position: 'bottom-right'
      })
    } finally {
      setUploading(false)
    }
  }
  const [campaigns, setCampaigns] = useState([])
  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/campaign/getcampaign`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setCampaigns(response.data) // Update data if component is still mounted
        console.log(response.data)
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
      })
  }, [open])

  useEffect(() => {
    if (campid) {
      setFormData(prevFormData => ({
        ...prevFormData,
        campaignid: campid._id,
      }));
      setUploadData(prevFormData => ({
        ...prevFormData,
        campaignid: campid._id,
      }));
    }
  }, [campid]);
  return (
    <>
      <Box margin={5} display={'flex'} justifyContent={'flex-end'}>
        <Button variant='contained' onClick={handleClickOpen}>
          Bulk Upload
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title' maxWidth='sm' fullWidth>
        <DialogTitle id='form-dialog-title'>Bulk Upload Leads</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Stepper activeStep={uploadStep} alternativeLabel>
              <Step>
                <StepLabel>Upload file</StepLabel>
              </Step>
              <Step>
                <StepLabel>Map columns</StepLabel>
              </Step>
            </Stepper>
          </Box>

          {uploadStep === 0 && (
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <DialogContentText>
                  Choose a campaign, optional source, then upload an Excel or CSV file. Next you will map columns
                  (Name and Phone are required).
                </DialogContentText>
              </Grid>
              <Grid item xs={12} sm={12}>
                {campid ? (
                  <TextField disabled fullWidth label='Campaign' value={campid.name} />
                ) : (
                  <>
                    <InputLabel id='campaign-select-label'>Campaign</InputLabel>
                    <Select
                      fullWidth
                      style={{ color: 'black' }}
                      labelId='campaign-select-label'
                      id='campaign-select'
                      value={uploadData.campaignid}
                      onChange={e => setUploadData({ ...uploadData, campaignid: e.target.value })}
                    >
                      <MenuItem value='' disabled>
                        Choose Campaign
                      </MenuItem>
                      {campaigns.map((campaign, index) => (
                        <MenuItem key={index} value={campaign._id}>
                          {campaign.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </Grid>

              <Grid item xs={12} sm={12}>
                <Box {...getRootProps({ className: 'dropzone' })}>
                  <input {...getInputProps()} />
                  {files.length ? (
                    <Box display={'flex'} justifyContent={'space-between'} alignItems='center'>
                      <Typography variant='h6'>{files[0].name}</Typography>
                      <Button type='button'>Change</Button>
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
                        Drop XLS, XLSX, or CSV here
                      </Typography>
                      <Typography color='text.secondary'>
                        Drop files here or click browse through your machine
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
          )}

          {uploadStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary'>
                  {rowCount} data row(s) found in <strong>{files[0]?.name}</strong>. Columns were auto-matched where
                  possible — change any mapping below before importing.
                </Typography>
              </Grid>
              {MAPPABLE_FIELDS.map(field => {
                const sample =
                  fieldMap[field.key] && sampleRows[0]
                    ? String(sampleRows[0][fieldMap[field.key]] ?? '')
                    : ''
                return (
                  <Grid item xs={12} key={field.key}>
                    <FormControl fullWidth>
                      <InputLabel id={`map-${field.key}-label`}>
                        {field.label}
                        {field.required ? ' *' : ''}
                      </InputLabel>
                      <Select
                        labelId={`map-${field.key}-label`}
                        label={`${field.label}${field.required ? ' *' : ''}`}
                        value={fieldMap[field.key] || ''}
                        onChange={e =>
                          setFieldMap(prev => ({
                            ...prev,
                            [field.key]: e.target.value
                          }))
                        }
                      >
                        <MenuItem value=''>
                          <em>Skip / not mapped</em>
                        </MenuItem>
                        {fileHeaders.map(header => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                      {sample ? (
                        <FormHelperText>Sample: {sample}</FormHelperText>
                      ) : (
                        <FormHelperText>
                          {field.required ? 'Required' : 'Optional'}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary'>
            Cancel
          </Button>
          {uploadStep === 1 && (
            <Button onClick={() => setUploadStep(0)} variant='outlined'>
              Back
            </Button>
          )}
          {uploadStep === 0 ? (
            <Button onClick={handleReadHeaders} variant='contained' disabled={readingHeaders}>
              {readingHeaders ? <CircularProgress size={24} /> : 'Next: Map columns'}
            </Button>
          ) : (
            <Button
              onClick={handleUploadSubmit}
              variant='contained'
              disabled={uploading || !fieldMap.name || !fieldMap.phone}
            >
              {uploading ? <CircularProgress size={24} /> : 'Import leads'}
            </Button>
          )}
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
                {campid ? <TextField
                  disabled
                  fullWidth
                  label='Campaign'
                  value={campid.name}
                /> : <Select
                  fullWidth
                  style={{ color: 'black' }}
                  labelId="campaign-select-label"
                  id="campaign-select"
                  value={formData.campaignid}
                  onChange={e => setFormData({ ...formData, campaignid: e.target.value })}
                >
                  <MenuItem value="" disabled>
                    Choose Campaign
                  </MenuItem>
                  {campaigns.map((campaign, index) => (
                    <MenuItem key={index} value={campaign._id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>}

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
              <Grid item xs={12} sm={6}>
                <Box display={'flex'} justifyContent={'space-between'}>
                  <InputLabel className='p-3'>District : </InputLabel>
                  <Select
                    style={{ width: '80%' }}
                    value={formData.district || ' '}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    label="District"
                  >
                    <MenuItem value="" disabled>
                      Choose a District
                    </MenuItem>
                    {districtsInKerala.map(district => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select></Box>
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
