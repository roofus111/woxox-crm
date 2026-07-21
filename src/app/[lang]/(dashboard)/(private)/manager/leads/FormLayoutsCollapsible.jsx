'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Accordion from '@mui/material/Accordion'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Radio from '@mui/material/Radio'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// Component Imports
import CustomInputHorizontal from '@core/components/custom-inputs/Horizontal'
import { LogLevels } from 'consola'
import { toast } from 'react-toastify'

// Vars
const data = [
  {
    title: 'Standard 3-5 Days',
    meta: 'Free',
    content: 'Friday, 15 Nov - Monday, 18 Nov',
    isSelected: true,
    value: 'standard'
  },
  {
    title: 'Express',
    meta: '$5.00',
    content: 'Friday, 15 Nov - Sunday, 17 Nov',
    value: 'express'
  },
  {
    title: 'Overnight',
    meta: '$10.00',
    content: 'Friday, 15 Nov - Saturday, 16 Nov',
    value: 'overnight'
  }
]

const FormLayoutsCollapsible = ({  props, handleClose, onSave, onCancel }) => {
  // Vars
  const initialSelectedOption = data.filter(item => item.isSelected)[data.filter(item => item.isSelected).length - 1]
    .value
  console.log(props, "props here");

  // States
  const [expanded, setExpanded] = useState('panel1')
  console.log(handleClose);



  const [cardData, setCardData] = useState({
    fullName: props.name || '',
    phone: props.phone || '',
    email: props.email || '',
    age: props.profile?.age || '',
    address: props.profile?.address || '',
    pinCode: props.profile?.pinCode || '',
    state: props.profile?.state || '',
    city: props.profile?.city || '',
    country: props.profile?.country || '',
    sslcJoinYear: props.profile?.sslcJoinYear || '',
    sslcPassOutYear: props.profile?.sslcPassOutYear || '',
    sslcScore: props.profile?.sslcScore || '',
    hscJoinYear: props.profile?.hscJoinYear || '',
    hscPassOutYear: props.profile?.hscPassOutYear || '',
    hscScore: props.profile?.hscScore || '',
    ieltsScore: props.profile?.ieltsScore || '',
    pteToeflScore: props.profile?.pteToeflScore || '',
    germanScore: props.profile?.germanScore || '',
    xiiEnglishScore: props.profile?.xiiEnglishScore || '',
    careerGapFrom: props.profile?.careerGapFrom || '',
    careerGapTo: props.profile?.careerGapTo || '',
    experienceFrom: props.profile?.experienceFrom || '',
    experienceTo: props.profile?.experienceTo || '',
    backlogs: props.profile?.backlogs || '',
    targetIntake: props.profile?.targetIntake || '',
    programOfInterest: props.profile?.programOfInterest || '',
    countryOfInterest: props.profile?.countryOfInterest || '',
    visaRefusal: props.profile?.visaRefusal || '',
    tuitionFeePreference: props.profile?.tuitionFeePreference || ''
  })

  const handleExpandChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleOptionChange = prop => {
    if (typeof prop === 'string') {
      setSelectedOption(prop)
    } else {
      setSelectedOption(prop.target.value)
    }
  }

  const handleReset = () => {
    setCardData({
      fullName: '',
      phone: '',
      address: '',
      pinCode: '',
      state: '',
      city: '',
      country: '',
      addressType: '',
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      // Example API call to submit the form
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/updateprofile/${props._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cardData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Lead Updated successfully!')
        
        // Call the onSave callback if provided (this will handle data refresh and dialog closing)
        if (onSave) {
          onSave()
        } else if (handleClose) {
          // Fallback to handleClose if onSave is not provided
          handleClose()
        }
      } else {
        toast.error(data.message || 'An error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An error occurred. Please try again.')
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (handleClose) {
      handleClose()
    }
  }

  return (

    <>
      <Accordion expanded={expanded === 'panel1'} onChange={handleExpandChange('panel1')}>
        <AccordionSummary>
          <Typography>Personal Details</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className='pbs-5'>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Full Name'
                value={cardData.fullName}
                onChange={e => setCardData({ ...cardData, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Age'
                value={cardData.age}
                onChange={e => setCardData({ ...cardData, age: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
              disabled
                fullWidth
                label='Phone'
                value={cardData.phone}
                onChange={e => setCardData({ ...cardData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Email'
                value={cardData.email}
                onChange={e => setCardData({ ...cardData, email: e.target.value })}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Address Section */}
      <Accordion expanded={expanded === 'panel2'} onChange={handleExpandChange('panel2')}>
        <AccordionSummary>
          <Typography>Address</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className='pbs-5'>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Address'
                value={cardData.address}
                onChange={e => setCardData({ ...cardData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='PinCode'
                value={cardData.pinCode}
                onChange={e => setCardData({ ...cardData, pinCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State'
                value={cardData.state}
                onChange={e => setCardData({ ...cardData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                value={cardData.city}
                onChange={e => setCardData({ ...cardData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  label='Country'
                  value={cardData.country}
                  onChange={e => setCardData({ ...cardData, country: e.target.value })}
                >
                  <MenuItem value='India'>India</MenuItem>

                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Education Section */}
      <Accordion expanded={expanded === 'panel3'} onChange={handleExpandChange('panel3')}>
        <AccordionSummary>
          <Typography>Education</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className='pbs-5'>
          {/* SSLC */}
          <Grid container spacing={5}>
            <Grid item xs={12} sm={3}>
              <Typography>SSLC</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='Join Year'
                value={cardData.sslcJoinYear}
                onChange={e => setCardData({ ...cardData, sslcJoinYear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='Pass Out Year'
                value={cardData.sslcPassOutYear}
                onChange={e => setCardData({ ...cardData, sslcPassOutYear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='Score %'
                value={cardData.sslcScore}
                onChange={e => setCardData({ ...cardData, sslcScore: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Repeat similar blocks for other degrees (e.g., HSC, Bachelors, etc.) */}
          <Grid container spacing={5}>
            <Grid item xs={12} sm={3}>
              <Typography>HSC</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='Join Year'
                value={cardData.hscJoinYear}
                onChange={e => setCardData({ ...cardData, hscJoinYear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='Pass Out Year'
                value={cardData.hscPassOutYear}
                onChange={e => setCardData({ ...cardData, hscPassOutYear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='Score %'
                value={cardData.hscScore}
                onChange={e => setCardData({ ...cardData, hscScore: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Continue similar structure for Bachelors, Masters, etc. */}
        </AccordionDetails>
      </Accordion>

      {/* Language Section */}
      <Accordion expanded={expanded === 'panel4'} onChange={handleExpandChange('panel4')}>
        <AccordionSummary>
          <Typography>Language</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className='pbs-5'>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <Typography>IELTS</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type='number'
                label='Score'
                value={cardData.ieltsScore}
                onChange={e => setCardData({ ...cardData, ieltsScore: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>PTE / TOEFL</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type='number'
                label='Score'
                value={cardData.pteToeflScore}
                onChange={e => setCardData({ ...cardData, pteToeflScore: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>German</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type='number'
                label='Score'
                value={cardData.germanScore}
                onChange={e => setCardData({ ...cardData, germanScore: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>XII English Mark</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type='number'
                label='Score'
                value={cardData.xiiEnglishScore}
                onChange={e => setCardData({ ...cardData, xiiEnglishScore: e.target.value })}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Others Section */}
      <Accordion expanded={expanded === 'panel5'} onChange={handleExpandChange('panel5')}>
        <AccordionSummary>
          <Typography>Others</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className='pbs-5'>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <Typography>Career Gap</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='From'
                value={cardData.careerGapFrom}
                onChange={e => setCardData({ ...cardData, careerGapFrom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='To'
                value={cardData.careerGapTo}
                onChange={e => setCardData({ ...cardData, careerGapTo: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography>Experience</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='From'
                value={cardData.experienceFrom}
                onChange={e => setCardData({ ...cardData, experienceFrom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='To'
                value={cardData.experienceTo}
                onChange={e => setCardData({ ...cardData, experienceTo: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography>Backlogs</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type='number'
                label='Number of Backlogs'
                value={cardData.backlogs}
                onChange={e => setCardData({ ...cardData, backlogs: e.target.value })}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Admission Details Section */}
      <Accordion expanded={expanded === 'panel6'} onChange={handleExpandChange('panel6')}>
        <AccordionSummary>
          <Typography>Admission Details</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className='pbs-5'>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Target Intake'
                value={cardData.targetIntake}
                onChange={e => setCardData({ ...cardData, targetIntake: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Program of Interest'
                value={cardData.programOfInterest}
                onChange={e => setCardData({ ...cardData, programOfInterest: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Country of Interest'
                value={cardData.countryOfInterest}
                onChange={e => setCardData({ ...cardData, countryOfInterest: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Visa Refusal'
                value={cardData.visaRefusal}
                onChange={e => setCardData({ ...cardData, visaRefusal: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Tuition Fee Preference'
                value={cardData.tuitionFeePreference}
                onChange={e => setCardData({ ...cardData, tuitionFeePreference: e.target.value })}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Button onClick={handleCancel} sx={{ margin: 5 }} variant='outlined' color='secondary'>
        Cancel
      </Button>
      <Button sx={{ margin: 5 }} onClick={handleSubmit} variant='contained'>
        Save
      </Button>
    </>
  )
}

export default FormLayoutsCollapsible
