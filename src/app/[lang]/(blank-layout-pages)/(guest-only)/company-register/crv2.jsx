'use client'

import { Box, Button, TextField, Tabs, Tab, Select, MenuItem, InputLabel, FormControl, FormControlLabel, RadioGroup, ListItemText, Checkbox, Radio, FormGroup, Typography, Paper, LinearProgress } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const Page = () => {
  const router = useRouter();
  const { data: session, update } = useSession();
  console.log(session?.user, 'session');

  const [formData, setFormData] = useState({
    company_name: "",
    company_type: "",
    buisness_industry: "",
    date_of_establishment: "",
    office_address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    website: "",
    email_address: "",
    phone_number: "",
    gst_number: "",
  });

  const [surveyData, setSurveyData] = useState({
    totalEmployees: '',
    employee: '',
    // Step 1
    revenueRange: '',
    locations: '',
    yearEstablished: '',
    international: 'No',
    // Step 2  
    departments: [],
    crmUsers: '',
    currentTool: '',
    integrations: [],
    mainChallenge: '',
    // Step 3
    mainGoal: '',
    channels: [],
    implementationTimeline: '',
    requireTraining: 'No',
    hasAdmin: 'No',
    needMigrationHelp: 'No',
    mustHaveFeatures: ''
  })

  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [activeTab, setActiveTab] = useState(0)
  const [surveyStep, setSurveyStep] = useState(1)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSurveyFormComplete, setIsSurveyFormComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setErrors(prev => ({
      ...prev,
      [name]: false
    }))
  }

  const handleSurveyChange = e => {
    const { name, value } = e.target
    setSurveyData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Please select a valid image file (JPEG, PNG, GIF)'
        }))
        return
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'File size must be less than 5MB'
        }))
        return
      }

      setProfileImage(file)
      setErrors(prev => ({
        ...prev,
        profileImage: false
      }))

      const reader = new FileReader()
      reader.onload = e => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Form data valid. Switching to survey form...')
    setActiveTab(1)
  }

  const handleSurveySubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage?.getItem('token')

      // Base payload
      const companyPayload = {
        name: formData.company_name.trim(),
        email: formData.email_address.trim(),
        ...(formData.phone_number && { phone: formData.phone_number.trim() }),
        ...(formData.buisness_industry && { industry: formData.buisness_industry.trim() }),
        ...(formData.website && { website: formData.website.trim() }),
        ...(surveyData.employee && { employees: parseInt(surveyData.employee, 10) })
      }

      // Add address fields one by one
      if (formData.office_address) {
        companyPayload.street = formData.office_address.trim()
        companyPayload.city = formData.city.trim()
        companyPayload.state = formData.state.trim()
        companyPayload.country = formData.country.trim()
        companyPayload.postalCode = formData.postal_code.trim()
      }

      console.log('Creating company with payload:', companyPayload)

      let response

      if (profileImage) {
        const formDataPayload = new FormData()
        Object.entries(companyPayload).forEach(([key, val]) => {
          formDataPayload.append(key, val)
        })
        formDataPayload.append('profileImage', profileImage)

        response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, formDataPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        })
      } else {
        response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, companyPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
      }

      if (session) {
        console.log('Updating session with existing data:', session)
        await update({
          ...session,
          user: {
            ...session.user,
            company: response.data.user.company,
            role: response.data.user.role
          },
          accessToken: response.data.token
        })
        localStorage.setItem('token', response.data.token)
        console.log('Session updated successfully')
      }

      // Check multiple possible locations for the token in the response
      let newToken = null

      if (response.data?.token) {
        newToken = response.data.token
      } else if (response.data?.data?.token) {
        newToken = response.data.data.token
      } else if (response.token) {
        newToken = response.token
      }

      if (newToken) {
        console.log('New token received:', newToken)
        localStorage.setItem('token', newToken)

        // Verify the token was actually saved
        const savedToken = localStorage.getItem('token')
        console.log('Token replaced successfully:', savedToken === newToken)
        console.log('New saved token:', savedToken)

        // Optional: Decode and log token payload for verification
        try {
          const tokenPayload = JSON.parse(atob(newToken.split('.')[1]))
          console.log('New token payload:', tokenPayload)
        } catch (e) {
          console.log('Could not decode token payload')
        }
      } else {
        console.error('No token found in response!')
        console.error('Response structure:', response.data)
        console.error('Available keys in response.data:', Object.keys(response.data || {}))

        // Still proceed but warn user
        alert('Company created but authentication token was not updated. Please refresh the page.')
      }
    } catch (error) {
      console.error('Error creating company:', error)

      // Handle specific error cases
      if (error.response?.status === 400) {
        alert(error.response.data.message || 'Invalid data provided')
      } else if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.')
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        alert('Failed to create company. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const isFormComplete = formData.company_name.trim() && formData.email_address.trim()
    setIsFormValid(isFormComplete)
  }, [formData])

  useEffect(() => {
    setIsSurveyFormComplete(true)
  }, [surveyData])

  const handleSurveyMultiChange = (e) => {
    const { name, value } = e.target;
    setSurveyData(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleNextSurveyStep = () => {
    if (surveyStep < 3) {
      setSurveyStep(surveyStep + 1)
    }
  }

  const handlePrevSurveyStep = () => {
    if (surveyStep > 1) {
      setSurveyStep(surveyStep - 1)
    }
  }

  const background = '/images/background.jpg'
  const logo = '/images/woxoxlogo.png'

  // New modern field styles matching the design
  const fieldStyles = {
    mb: 3,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
      '& fieldset': {
        borderColor: '#e0e4e7',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#3b82f6',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#3b82f6',
      },
    },
    '& .MuiSelect-select': {
      padding: '12px 14px',
    },
    '& .MuiInputBase-input': {
      padding: '12px 14px',
    },
  };

  const renderSurveyStep = () => {
    switch(surveyStep) {
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600 }}>
              Step 1 of 3: Company Scale & Structure
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={33.33} 
              sx={{ mb: 4, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb' }}
            />
            
            <Box display='grid' gap='20px' gridTemplateColumns='repeat(auto-fit, minmax(280px, 1fr))'>
              <FormControl fullWidth sx={fieldStyles}>
                <InputLabel id='revenue-range-label'>Annual Revenue Range</InputLabel>
                <Select
                  labelId='revenue-range-label'
                  name='revenueRange'
                  value={surveyData.revenueRange || ''}
                  onChange={handleSurveyChange}
                  label='Annual Revenue Range'
                >
                  <MenuItem value='0-50L'>₹0–50L</MenuItem>
                  <MenuItem value='50L-1Cr'>₹50L–1Cr</MenuItem>
                  <MenuItem value='1-5Cr'>₹1–5Cr</MenuItem>
                  <MenuItem value='5Cr+'>₹5Cr+</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type='number'
                label='Number of Locations / Branches'
                name='locations'
                value={surveyData.locations || ''}
                onChange={handleSurveyChange}
                sx={fieldStyles}
              />

              <TextField
                fullWidth
                type='number'
                label='Year Established'
                name='yearEstablished'
                value={surveyData.yearEstablished || ''}
                onChange={handleSurveyChange}
                inputProps={{ min: 1900, max: new Date().getFullYear(), step: 1 }}
                sx={fieldStyles}
              />

              <FormControl fullWidth sx={fieldStyles}>
                <InputLabel id='employee-select-label'>Total Employees</InputLabel>
                <Select
                  labelId='employee-select-label'
                  name='employee'
                  value={surveyData.employee}
                  onChange={handleSurveyChange}
                  label='Total Employees'
                >
                  <MenuItem value=''>Select Range</MenuItem>
                  <MenuItem value='10'>0 - 10 Employees</MenuItem>
                  <MenuItem value='25'>10 - 25 Employees</MenuItem>
                  <MenuItem value='50'>25 - 50 Employees</MenuItem>
                  <MenuItem value='100'>50 - 100 Employees</MenuItem>
                  <MenuItem value='200'>100 - 200 Employees</MenuItem>
                  <MenuItem value='500'>250 - 500 Employees</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9fafb', borderRadius: 2, mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                Do you operate internationally?
              </Typography>
              <RadioGroup
                row
                name='international'
                value={surveyData.international || 'No'}
                onChange={handleSurveyChange}
              >
                <FormControlLabel 
                  value='Yes' 
                  control={<Radio sx={{ color: '#3b82f6' }} />} 
                  label='Yes' 
                  sx={{ color: '#374151', mr: 4 }} 
                />
                <FormControlLabel 
                  value='No' 
                  control={<Radio sx={{ color: '#3b82f6' }} />} 
                  label='No' 
                  sx={{ color: '#374151' }} 
                />
              </RadioGroup>
            </Paper>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600 }}>
              Step 2 of 3: Current Tools & Process
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={66.66} 
              sx={{ mb: 4, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb' }}
            />

            <Box display='grid' gap='20px' gridTemplateColumns='repeat(auto-fit, minmax(280px, 1fr))'>
              <FormControl fullWidth sx={fieldStyles}>
                <InputLabel id='departments-label'>Departments Using the CRM</InputLabel>
                <Select
                  labelId='departments-label'
                  name='departments'
                  multiple
                  value={surveyData.departments || []}
                  onChange={handleSurveyMultiChange}
                  renderValue={selected => selected.join(', ')}
                  label='Departments Using the CRM'
                >
                  {['Sales', 'Marketing', 'Customer Support', 'HR', 'Finance', 'Operations', 'Other'].map(dep => (
                    <MenuItem key={dep} value={dep}>
                      <Checkbox checked={surveyData.departments?.includes(dep)} />
                      <ListItemText primary={dep} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type='number'
                label='Approx. Number of CRM Users Needed'
                name='crmUsers'
                value={surveyData.crmUsers || ''}
                onChange={handleSurveyChange}
                sx={fieldStyles}
              />

              <FormControl fullWidth sx={fieldStyles}>
                <InputLabel id='manage-customers-label'>How do you currently manage customers?</InputLabel>
                <Select
                  labelId='manage-customers-label'
                  name='currentTool'
                  value={surveyData.currentTool || ''}
                  onChange={handleSurveyChange}
                  label='How do you currently manage customers?'
                >
                  {['Existing CRM', 'Spreadsheets', 'Paper Records', 'No System'].map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={fieldStyles}>
                <InputLabel id='integrations-label'>Other software to integrate</InputLabel>
                <Select
                  labelId='integrations-label'
                  name='integrations'
                  multiple
                  value={surveyData.integrations || []}
                  onChange={handleSurveyMultiChange}
                  renderValue={sel => sel.join(', ')}
                  label='Other software to integrate'
                >
                  {['Email', 'WhatsApp', 'Payment Gateway', 'ERP', 'Accounting', 'Social Media', 'Other'].map(
                    opt => (
                      <MenuItem key={opt} value={opt}>
                        <Checkbox checked={surveyData.integrations?.includes(opt)} />
                        <ListItemText primary={opt} />
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth sx={fieldStyles}>
              <InputLabel id='main-challenge-label'>Main challenge with current system</InputLabel>
              <Select
                labelId='main-challenge-label'
                name='mainChallenge'
                value={surveyData.mainChallenge || ''}
                onChange={handleSurveyChange}
                label='Main challenge with current system'
              >
                {['Manual work', 'Lack of automation', 'Poor reporting', 'Data scattered', 'Other'].map(opt => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600 }}>
              Step 3 of 3: Goals & Additional Requirements
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ mb: 4, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb' }}
            />

            <Box display='grid' gap='20px' gridTemplateColumns='repeat(auto-fit, minmax(280px, 1fr))'>
              <FormControl fullWidth sx={fieldStyles}>
                <InputLabel id='main-goal-label'>Main goal for using a CRM</InputLabel>
                <Select
                  labelId='main-goal-label'
                  name='mainGoal'
                  value={surveyData.mainGoal || ''}
                  onChange={handleSurveyChange}
                  label='Main goal for using a CRM'
                >
                  {[
                    'Increase Sales',
                    'Improve Customer Service',
                    'Automate Marketing',
                    'Reporting/Analytics',
                    'All of the Above'
                  ].map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={fieldStyles}>
                <InputLabel id='implementation-timeline-label'>Implementation timeline</InputLabel>
                <Select
                  labelId='implementation-timeline-label'
                  name='implementationTimeline'
                  value={surveyData.implementationTimeline || ''}
                  onChange={handleSurveyChange}
                  label='Implementation timeline'
                >
                  {['Immediately', 'Within 1 month', '1–3 months', '3+ months'].map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9fafb', borderRadius: 2, mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                Communication Channels
              </Typography>
              <FormGroup row>
                {['Email', 'Phone', 'WhatsApp', 'Social Media', 'In-person'].map(chan => (
                  <FormControlLabel
                    key={chan}
                    control={
                      <Checkbox
                        checked={surveyData.channels?.includes(chan)}
                        onChange={handleSurveyMultiChange}
                        name='channels'
                        value={chan}
                        sx={{ color: '#3b82f6' }}
                      />
                    }
                    label={chan}
                    sx={{ color: '#374151', mr: 3, mb: 1 }}
                  />
                ))}
              </FormGroup>
            </Paper>

            <Box display='grid' gap='20px' gridTemplateColumns='repeat(auto-fit, minmax(280px, 1fr))' mt={3}>
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                  Require Training?
                </Typography>
                <RadioGroup
                  row
                  name='requireTraining'
                  value={surveyData.requireTraining || 'No'}
                  onChange={handleSurveyChange}
                >
                  <FormControlLabel value='Yes' control={<Radio sx={{ color: '#3b82f6' }} />} label='Yes' sx={{ color: '#374151', mr: 4 }} />
                  <FormControlLabel value='No' control={<Radio sx={{ color: '#3b82f6' }} />} label='No' sx={{ color: '#374151' }} />
                </RadioGroup>
              </Paper>

              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                  Dedicated CRM Admin?
                </Typography>
                <RadioGroup row name='hasAdmin' value={surveyData.hasAdmin || 'No'} onChange={handleSurveyChange}>
                  <FormControlLabel value='Yes' control={<Radio sx={{ color: '#3b82f6' }} />} label='Yes' sx={{ color: '#374151', mr: 4 }} />
                  <FormControlLabel value='No' control={<Radio sx={{ color: '#3b82f6' }} />} label='No' sx={{ color: '#374151' }} />
                </RadioGroup>
              </Paper>
            </Box>

            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9fafb', borderRadius: 2, mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                Need Data Migration Help?
              </Typography>
              <RadioGroup
                row
                name='needMigrationHelp'
                value={surveyData.needMigrationHelp || 'No'}
                onChange={handleSurveyChange}
              >
                <FormControlLabel value='Yes' control={<Radio sx={{ color: '#3b82f6' }} />} label='Yes' sx={{ color: '#374151', mr: 4 }} />
                <FormControlLabel value='No' control={<Radio sx={{ color: '#3b82f6' }} />} label='No' sx={{ color: '#374151' }} />
              </RadioGroup>
            </Paper>

            <TextField
              fullWidth
              multiline
              rows={4}
              label='Specific features you must have'
              name='mustHaveFeatures'
              value={surveyData.mustHaveFeatures || ''}
              onChange={handleSurveyChange}
              sx={{
                ...fieldStyles,
                mt: 3,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyles['& .MuiOutlinedInput-root'],
                  alignItems: 'flex-start',
                  paddingTop: '12px',
                },
              }}
            />
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Left Panel - Progress */}
      <div className='hidden lg:flex lg:w-1/3 bg-gradient-to-l from-gray-50 to-blue-400 p-8 flex-col justify-between'>
        <div>
          <Link href="/">
            <img src={logo} alt='woxox-logo' className='h-8 w-auto mb-12 cursor-pointer' />
          </Link>
          
          <div className='space-y-6'>
            <div className={`flex items-center space-x-4 ${activeTab >= 0 ? 'text-white' : 'text-blue-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${activeTab >= 0 ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                1
              </div>
              <div>
                <div className='font-semibold'>Business Info</div>
                <div className='text-sm text-gray-500'>Tell us about your business</div>
              </div>
            </div>

            <div className={`flex items-center space-x-4 ${activeTab >= 1 ? 'text-white' : 'text-blue-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${activeTab >= 1 ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                2
              </div>
              <div>
                <div className='font-semibold'>Survey</div>
                <div className='text-sm text-blue-200'>Help us understand your needs</div>
              </div>
            </div>

            <div className={`flex items-center space-x-4 text-blue-200`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-500 text-white`}>
                3
              </div>
              <div>
                <div className='font-semibold'>Verify</div>
                <div className='text-sm text-blue-200'>Submit your certification details</div>
              </div>
            </div>
          </div>
        </div>

        <div className='text-blue-200 text-sm'>
          Step {activeTab + 1} of 3
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className='flex-1 flex items-center justify-center p-6'>
        <Box maxWidth='800px' width='100%'>
          {activeTab === 0 && (
            <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '1px solid #e5e7eb' }}>
              <Typography variant="h4" sx={{ mb: 1, color: '#1f2937', fontWeight: 700 }}>
                Business Info
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: '#6b7280' }}>
                Tell us about your business so we can get started.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Box display='grid' gap='20px' gridTemplateColumns='repeat(auto-fit, minmax(280px, 1fr))'>
                  <TextField
                    fullWidth
                    type='text'
                    label='Business Name *'
                    name='company_name'
                    value={formData.company_name}
                    onChange={handleChange}
                    error={!!errors.company_name}
                    helperText={errors.company_name}
                    required
                    sx={fieldStyles}
                  />
                  
                  <TextField
                    fullWidth
                    type='url'
                    label='Business Website'
                    name='website'
                    value={formData.website}
                    onChange={handleChange}
                    placeholder='www.mywebsite.com'
                    sx={fieldStyles}
                  />

                  <TextField
                    fullWidth
                    type='text'
                    label='Zip Code *'
                    name='postal_code'
                    value={formData.postal_code}
                    onChange={handleChange}
                    required
                    sx={fieldStyles}
                  />

                  <FormControl fullWidth sx={fieldStyles}>
                    <InputLabel id='service-type-label'>Type of Service *</InputLabel>
                    <Select
                      labelId='service-type-label'
                      name='buisness_industry'
                      value={formData.buisness_industry}
                      onChange={handleChange}
                      label='Type of Service *'
                      required
                    >
                      <MenuItem value='Home Renovations'>Home Renovations</MenuItem>
                      <MenuItem value='Construction'>Construction</MenuItem>
                      <MenuItem value='Consulting'>Consulting</MenuItem>
                      <MenuItem value='Technology'>Technology</MenuItem>
                      <MenuItem value='Healthcare'>Healthcare</MenuItem>
                      <MenuItem value='Education'>Education</MenuItem>
                      <MenuItem value='Other'>Other</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    type='text'
                    label='Name *'
                    name='contact_name'
                    value={formData.contact_name || ''}
                    onChange={handleChange}
                    placeholder='Your Name'
                    required
                    sx={fieldStyles}
                  />

                  <TextField
                    fullWidth
                    type='email'
                    label='Email *'
                    name='email_address'
                    value={formData.email_address}
                    onChange={handleChange}
                    error={!!errors.email_address}
                    helperText={errors.email_address}
                    placeholder='youremail@gmail.com'
                    required
                    sx={fieldStyles}
                  />

                  <TextField
                    fullWidth
                    type='tel'
                    label='Phone Number *'
                    name='phone_number'
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder='+91 1234567890 '
                    required
                    sx={fieldStyles}
                  />

                  <TextField
                    fullWidth
                    type='text'
                    label='Business Address *'
                    name='office_address'
                    value={formData.office_address}
                    onChange={handleChange}
                    placeholder='123 Contractor Lane, Suite 100, New Delhi, DL 10004'
                    required
                    sx={{ ...fieldStyles, gridColumn: { xs: '1', md: 'span 2' } }}
                  />

                  <TextField
                    fullWidth
                    type='text'
                    label='City'
                    name='city'
                    value={formData.city}
                    onChange={handleChange}
                    sx={fieldStyles}
                  />

                  <TextField
                    fullWidth
                    type='text'
                    label='State'
                    name='state'
                    value={formData.state}
                    onChange={handleChange}
                    sx={fieldStyles}
                  />

                  <TextField
                    fullWidth
                    type='text'
                    label='Country'
                    name='country'
                    value={formData.country}
                    onChange={handleChange}
                    sx={fieldStyles}
                  />

                  <TextField
                    fullWidth
                    type='text'
                    label='GST Number'
                    name='gst_number'
                    value={formData.gst_number}
                    onChange={handleChange}
                    sx={fieldStyles}
                  />

                  {/* Profile Image Upload */}
                  <Box sx={{ gridColumn: { xs: '1', md: 'span 2' }, mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                      Upload Business License *
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        border: '2px dashed #d1d5db', 
                        borderRadius: 2, 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          backgroundColor: '#f3f4f6'
                        }
                      }}
                      onClick={() => document.getElementById('profile-image-upload').click()}
                    >
                      <input
                        accept='image/*,.pdf,.doc,.docx'
                        style={{ display: 'none' }}
                        id='profile-image-upload'
                        type='file'
                        onChange={handleImageChange}
                      />
                      
                      {imagePreview ? (
                        <Box>
                          <img
                            src={imagePreview}
                            alt='Business license preview'
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              margin: '0 auto'
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 2, color: '#059669' }}>
                            ✓ File Uploaded - Business_License.pdf (200KB)
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            Click to upload or drag and drop SVG, PNG, JPG or GIF (max. 800x400px)
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Box sx={{ mb: 2 }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', color: '#9ca3af' }}>
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1, color: '#374151' }}>
                            <strong>Click to upload</strong> or drag and drop
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            SVG, PNG, JPG or GIF (max. 800x400px)
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {errors.profileImage && (
                      <Typography variant="caption" sx={{ color: '#ef4444', mt: 1, display: 'block' }}>
                        {errors.profileImage}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box display='flex' justifyContent='space-between' alignItems='center' mt={4}>
                  <Button 
                    variant='text' 
                    sx={{
                      color: '#6b7280',
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Back
                  </Button>
                  
                  <Button 
                    type='submit' 
                    variant='contained' 
                    disabled={!isFormValid}
                    sx={{
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '16px',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#111827',
                        boxShadow: 'none',
                      },
                      '&:disabled': {
                        backgroundColor: '#e5e7eb',
                        color: '#9ca3af',
                      }
                    }}
                  >
                    Next and Save
                  </Button>
                </Box>
              </form>
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '1px solid #e5e7eb', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1 }}>
                {renderSurveyStep()}
              </Box>

              <Box display='flex' justifyContent='space-between' alignItems='center' mt={4}>
                <Button 
                  variant='text' 
                  onClick={surveyStep === 1 ? () => setActiveTab(0) : handlePrevSurveyStep}
                  sx={{
                    color: '#6b7280',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Back
                </Button>
                
                {surveyStep < 3 ? (
                  <Button 
                    variant='contained' 
                    onClick={handleNextSurveyStep}
                    sx={{
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '16px',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#111827',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    variant='contained' 
                    onClick={handleSurveySubmit}
                    disabled={isLoading}
                    sx={{
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '16px',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#111827',
                        boxShadow: 'none',
                      },
                      '&:disabled': {
                        backgroundColor: '#e5e7eb',
                        color: '#9ca3af',
                      }
                    }}
                  >
                    {isLoading ? 'Creating Company...' : 'Next and Save'}
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </div>
    </div>
  )
}
 export default Page;