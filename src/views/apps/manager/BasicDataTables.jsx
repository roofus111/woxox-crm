'use client'

// React Imports
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import Link from 'next/link'
import './follow.css'
import { useSession } from 'next-auth/react'
// FullCalendar Imports
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import { toast } from 'react-toastify'
import { getLocalizedUrl } from '@/utils/i18n'
import { useRouter } from 'next/navigation'
// Utility Function for Formatting Date
const formatDate = date => {
  try {
    return new Date(date).toISOString().substring(0, 16) // ISO format for date inputs
  } catch {
    return ''
  }
}

const BasicDataTables = () => {
  const [data, setData] = useState([])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const { data: session } = useSession()
  // Fetch Follow-Up Data
  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setSnackbar({ open: true, message: 'No authorization token found.', severity: 'error' })
      setLoading(false)
      return
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(response.data)
      console.log(response.data);

    } catch {
      setSnackbar({ open: true, message: 'Failed to fetch follow-ups.', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle Completion of Follow-Up
  const handleCompleteFollowUp = async id => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${id}`,
        { status: 'Closed' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setData(prevData => prevData.map(item => (item._id === id ? { ...item, status: 'Closed' } : item)))
      setSnackbar({ open: true, message: 'Follow-up marked as completed.', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to complete follow-up.', severity: 'error' })
    } finally {
      setActionLoading(false)
      setDialogOpen(false)
    }
  }

  // Handle Rescheduling Follow-Up
  const handleRescheduleFollowUp = async id => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${id}`,
        { nextFollowUpDate: rescheduleDate },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setData(prevData => prevData.map(item => (item._id === id ? { ...item, nextFollowUpDate: rescheduleDate } : item)))
      setSnackbar({ open: true, message: 'Follow-up rescheduled successfully.', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to reschedule follow-up.', severity: 'error' })
    } finally {
      setActionLoading(false)
      setDialogOpen(false)
    }
  }

  // Open Dialog for Event Actions
  const handleEventClick = ({ event }) => {
    if (event.extendedProps.status === 'Closed') return
    setSelectedEvent(event)
    setRescheduleDate(formatDate(event.start))
    setDialogOpen(true)
  }

  // Handle Snackbar Close
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false })

  if (loading) return <CircularProgress />
  const now = new Date();


  // const handleSubmit = async id => {
  //   try {
  //     const token = localStorage.getItem('token')
  //     // Example API call to submit the form
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`
  //       },
  //       body: JSON.stringify({ status: 'Closed' })
  //     })

  //     const data = await response.json()

  //     if (response.ok) {
  //       setItems((prevItems) =>
  //         prevItems.map((item) =>
  //           item.id === id ? { ...item, ...newValues } : item
  //         )
  //       );
  //       toast.success('Marked as Done')
  //     } else {
  //       toast.error(data.message || 'An error occurred. Please try again.')
  //     }
  //   } catch (error) {
  //     toast.error('An error occurred. Please try again.')
  //   }
  // }
  return (
    <>
      <Typography variant="h4" gutterBottom>Follow-ups</Typography>
      <FullCalendar
        height="auto"
        plugins={[listPlugin]}
        initialView="listWeek"
        events={data.map((followUp) => ({
          id: followUp._id,
          title: `${followUp.leadId.name} - ${followUp.notes}`,
          start: followUp.nextFollowUpDate,
          extendedProps: {
            status: followUp.status == 'Pending' && new Date(followUp.nextFollowUpDate) < now ? 'Missed' : followUp.status,
          },
        }))}

        eventClassNames={({ event }) => {
          switch (event.extendedProps.status) {
            case 'Closed':
              return 'closed-follow-up';
            case 'Missed':
              return 'missed-follow-up';
            case 'Pending':
              return 'pending-follow-up';
            default:
              return '';
          }
        }}
        eventContent={(eventInfo) => {
          return (
            <div className="event-content" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {eventInfo.event.title}{" "}
                {eventInfo.event.extendedProps.status !== "Closed" ? (
                  <Button color='success' onClick={() => handleCompleteFollowUp(eventInfo.event.id)} >
                    <i className="ri-checkbox-circle-fill"></i>
                  </Button>
                ) : null}
              </span>

              <div>
                {eventInfo.event.extendedProps.status !== "Closed" ? (
                  <Button onClick={() => handleEventClick(eventInfo)}>Reshedule</Button>
                ) : null}
                <Button type="button" onClick={() => router.push(getLocalizedUrl(`/${session?.user?.role == 'admin' ? 'manager' : session?.user?.role}/leads?Userid=${eventInfo.event.id}`, 'en'))}>
                  View
                </Button></div>

            </div>
          );
        }}
        // eventClick={handleEventClick}
        headerToolbar={{
          left: 'title',
          center: '',
          right: 'today,prev,next',
        }}
        locale="en"
        ref={(calendarRef) => {
          if (calendarRef) {
            setTimeout(() => {
              const titleElement = document.querySelector('.fc-toolbar-title');
              if (titleElement) {
                titleElement.style.fontSize = '1rem'; // Decrease font size
                titleElement.style.fontWeight = 'Bold'; // Optional: Adjust font weight
              }
            }, 0);
          }
        }}
      />


      {/* Dialog for Actions */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Reschedule</DialogTitle>
        <DialogContent>
          {/* <Typography>Lead: {selectedEvent?.title}</Typography> */}
          <TextField
            label="Reschedule Date"
            type="datetime-local"
            value={rescheduleDate}
            onChange={e => setRescheduleDate(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          {/* <Button
            color="success"
            onClick={() => handleCompleteFollowUp(selectedEvent?.id)}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Complete Follow-Up'}
          </Button> */}
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            color="primary"
            onClick={() => handleRescheduleFollowUp(selectedEvent?.id)}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Reschedule'}
          </Button>

        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default BasicDataTables
