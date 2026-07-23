'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
// (media query unused after sidebar removal)

// Third-party Imports
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'

// Component Imports
import Calendar from './Calendar'
import AddEventSidebar from './AddEventSidebar'

// Slice Imports
import { setEvents, setEventsLoading, setEventsError } from '@/redux-store/slices/calendar'

// CalendarColors Object
const calendarsColor = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info'
}

const mapFollowUpToEvent = (followUp) => {
  const lead = followUp.leadId
  const leadName =
    lead?.name ||
    [lead?.first_name, lead?.last_name].filter(Boolean).join(' ') ||
    'Lead'
  const start = followUp.followUpDate || followUp.nextFollowUpDate
  if (!start) return null

  return {
    id: String(followUp._id),
    title: `${leadName} · ${followUp.status || 'Follow-up'}`,
    start,
    end: followUp.nextFollowUpDate || start,
    allDay: false,
    url: '',
    extendedProps: {
      calendar: 'Business',
      description: followUp.notes || followUp.completionNote || '',
      leadId: lead?._id || lead,
      followUpId: followUp._id,
      status: followUp.status
    }
  }
}

const AppCalendar = () => {
  // States
  const [calendarApi, setCalendarApi] = useState(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)

  // Hooks
  const dispatch = useDispatch()
  const calendarStore = useSelector(state => state.calendarReducer)
  const params = useParams()
  const router = useRouter()
  const locale = params?.lang || 'en'

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  useEffect(() => {
    const loadFollowUps = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) return

      dispatch(setEventsLoading(true))
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await axios.get(`${apiUrl}/api/followups/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const list = Array.isArray(response.data) ? response.data : []
        const events = list.map(mapFollowUpToEvent).filter(Boolean)
        dispatch(setEvents(events))
      } catch (error) {
        console.error('Failed to load follow-ups for calendar:', error)
        dispatch(setEventsError(error.response?.data?.message || 'Failed to load follow-ups'))
        dispatch(setEvents([]))
      }
    }

    loadFollowUps()
  }, [dispatch])

  // When an event is selected with a lead, open follow-up list filtered by lead
  // (navigation handled in handleEventNavigate)

  const handleEventNavigate = event => {
    const leadId = event?.extendedProps?.leadId
    if (leadId) {
      router.push(`/${locale}/manager/followup?leadId=${leadId}`)
    }
  }

  return (
    <>
      <div className='p-5 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
        {calendarStore.loadError ? (
          <p className='text-sm text-red-600 mb-3'>{calendarStore.loadError}</p>
        ) : null}
        <Calendar
          dispatch={dispatch}
          calendarApi={calendarApi}
          calendarStore={calendarStore}
          setCalendarApi={setCalendarApi}
          calendarsColor={calendarsColor}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          onFollowUpNavigate={handleEventNavigate}
        />
      </div>
      <AddEventSidebar
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={calendarStore}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
    </>
  )
}

export default AppCalendar
