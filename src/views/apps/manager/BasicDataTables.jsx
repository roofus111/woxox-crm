'use client'

// React Imports
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'


// Utility Imports
import { getLocalizedUrl } from '@/utils/i18n'

// FollowUpCard Component for each follow-up
const FollowUpCard = ({ followUp, locale, onClose }) => {
  const [submitting, setSubmitting] = useState(false)

  // Dynamic Chip color based on status
  const getStatusColor = status => {
    switch (status) {
      case 'Closed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Open':
        return 'primary'
      default:
        return 'default'
    }
  }

  const handleClose = async () => {
    setSubmitting(true)
    try {
      await onClose(followUp._id)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card sx={{ maxWidth: 600, m: 2, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ mr: 2 }}>{followUp.leadId.name}</Box>
          <Chip size="small" label={followUp.status} color={getStatusColor(followUp.status)} />
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <i className="bi bi-calendar-event" style={{ verticalAlign: 'middle', marginRight: 8 }}></i>
              Date: <b>{new Date(followUp.nextFollowUpDate).toLocaleString()}</b>
            </Typography>
          </Grid>
          <Divider sx={{ my: 1.5 }} />
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <i className="bi bi-sticky-note" style={{ verticalAlign: 'middle', marginRight: 8 }}></i>
              Notes: {followUp.notes}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {followUp.status !== 'Closed' && (
          <Button size="small" color="success" variant="contained" onClick={handleClose} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Close'}
          </Button>
        )}
        <Button size="small" color="primary" variant="contained" startIcon={<Box component="i" className="bi bi-pencil-square" />}>
          <Link href={getLocalizedUrl(`/leads?Userid=${followUp.leadId._id}`, locale)} className="flex">
            View
          </Link>
        </Button>
      </CardActions>
    </Card>
  )
}

// Main Component
const BasicDataTables = () => {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const { lang: locale } = useParams()

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authorization token found.')
        setLoading(false)
        return
      }

      try {
        const response = await axios.get('http://localhost:8000/api/followups/', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(response.data)
      } catch (error) {
        setError('Failed to fetch data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Close FollowUp Handler
  const handleCloseFollowUp = async id => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8000/api/followups/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Closed' })
      })

      if (response.ok) {
        setData(prevData => prevData.map(followUp => (followUp._id === id ? { ...followUp, status: 'Closed' } : followUp)))
        setSnackbar({ open: true, message: 'Marked as Done', severity: 'success' })
      } else {
        const errorData = await response.json()
        setSnackbar({ open: true, message: errorData.message || 'An error occurred. Please try again.', severity: 'error' })
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'An error occurred. Please try again.', severity: 'error' })
    }
  }

  // Filter and sort data
  const pendingFollowUps = data
    .filter(followUp => followUp.status !== 'Closed')
    .sort((a, b) => new Date(a.nextFollowUpDate) - new Date(b.nextFollowUpDate))

  const archivedFollowUps = data
    .filter(followUp => followUp.status === 'Closed')
    .sort((a, b) => new Date(b.nextFollowUpDate) - new Date(a.nextFollowUpDate))

  // Handle Snackbar Close
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false })

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <>
      <Typography variant="h5" gutterBottom>Pending Follow-ups</Typography>
      {pendingFollowUps.map(followUp => (
        <FollowUpCard key={followUp._id} followUp={followUp} locale={locale} onClose={handleCloseFollowUp} />
      ))}
      <br />
      {archivedFollowUps.length > 0 && (
        <Accordion style={{ width: '100%' }}>
          <AccordionSummary expandIcon={<i class="ri-arrow-right-double-fill"></i>}>
            <Typography variant="h6">Archived Follow-ups</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {archivedFollowUps.map(followUp => (
              <FollowUpCard key={followUp._id} followUp={followUp} locale={locale} onClose={() => { }} />
            ))}
          </AccordionDetails>
        </Accordion>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>

  )
}

export default BasicDataTables
