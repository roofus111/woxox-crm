'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Tab from '@mui/material/Tab'
import { CircularProgress } from '@mui/material'
import Tabs from '@mui/material/Tabs'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/useSocket'
import { toast } from 'react-toastify'
import { Tooltip } from '@mui/material'

import InvoiceListTable from '@/views/apps/leadView/view/user-right/overview/InvoiceListTable'
import NotificationsTab from '@/views/apps/leadView/view/user-right/notifications/index'
import ActivityTab from './ActivityTab'
import NotesComponent from './NotesComponent'
import LeadActions from './LeadActions'
import ActivityHappen from './ActivityHappen'
import {
  getPersonalWhatsAppStatus,
  sendPersonalWhatsAppMessage,
} from '@/utils/personalWhatsappApi'

// Styled component for the resizable handle
const ResizeHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: '6px',
  cursor: 'col-resize',
  background: 'transparent',
  zIndex: 1,
  '&:hover': {
    background: theme.palette.divider
  }
}))

// Styled component for the purple header
const PurpleHeader = styled(Box)(({ theme }) => ({
  background: '#5B61E5',
  color: 'white',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  height: '100px',
  marginLeft: '12px',
  marginRight: '12px'
}))

// Activity timeline item with connecting lines
const ActivityItem = styled(Box)(({ theme, isActive }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  position: 'relative',
  flex: 1,
  '&:not(:last-child)::after': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: '50%',
    right: '-50%',
    height: '2px',
    background: isActive ? '#6366f1' : '#e5e7eb',
    zIndex: 0
  }
}))

const ActivityNumber = styled(Box)(({ theme, isActive }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: isActive ? '#6366f1' : '#e5e7eb',
  color: isActive ? 'white' : '#6b7280',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  position: 'relative',
  zIndex: 1
}))

// Color palette for tags
const TAG_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#000000',
  '#6b7280',
  '#9ca3af'
]

  const handleDrawerDataUpdate = () => {
    setDrawerRefreshTrigger(prev => prev + 1);
  };

const ResizableDrawer = ({
  open,
  onClose,
  title = 'Lead Details',
  children,
  defaultWidth = 1400,
  minWidth = 800,
  maxWidth = 2200,
  profileImage = null,
  userName = 'Unknown Lead',
  leadData,
  leadId,
  onStatusChange,
  onAssignSuccess,
  onSave,
  onDataUpdate={handleDrawerDataUpdate}
}) => {
  console.log('ResizableDrawer leadData:', leadData)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const router = useRouter()
  const params = useParams()
  const locale = params?.lang || 'en'
  const resolvedLeadId = leadId || leadData?._id

  const { socket } = useSocket()

  // State for drawer width (desktop only)
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(defaultWidth)
  const [activeTab, setActiveTab] = useState(0)

  // Tag management states
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [activeTagTab, setActiveTagTab] = useState(0) // 0 for All Tags, 1 for Add New Tag
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [allTags, setAllTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [leadTags, setLeadTags] = useState([])
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0])
  const [tagSearchTerm, setTagSearchTerm] = useState('')
  const [loadingTags, setLoadingTags] = useState(false)
  const [savingTags, setSavingTags] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [status, setStatus] = useState(leadData?.status)
  const openstatus = Boolean(anchorEl)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [assigningUser, setAssigningUser] = useState(false)
  const [assignAnchorEl, setAssignAnchorEl] = useState(null)
  const assignmentOpen = assignAnchorEl
  const [currentAssignedTo, setCurrentAssignedTo] = useState(leadData?.assignedTo)
  const [leftSidebarTab, setLeftSidebarTab] = useState(0)
  const [waDialogOpen, setWaDialogOpen] = useState(false)
  const [waPhone, setWaPhone] = useState('')
  const [waMessage, setWaMessage] = useState('')
  const [waSending, setWaSending] = useState(false)
  const [waConnected, setWaConnected] = useState(false)

  const leadStatuses = ['New', 'Contacted', 'Interested', 'Not Interested', 'Converted', 'Duplicate', 'Lost']

  const handleClick = event => {
    console.log('Status chip clicked')
    setAnchorEl(event.currentTarget)
  }

  const handleStatusClose = () => {
    setAnchorEl(null)
  }

  const getStatusColor = status => {
    switch (status) {
      case 'New':
        return '#2196f3' // Blue
      case 'Contacted':
        return '#03a9f4' // Light Blue
      case 'In Progress':
        return '#ff9800' // Orange
      case 'Interested':
        return '#4caf50' // Green
      case 'Not Interested':
        return '#f44336' // Red
      case 'Converted':
        return '#8bc34a' // Light Green
      case 'Lost':
        return '#9e9e9e' // Grey
      case 'Duplicate':
        return '#795548' // Brown
      default:
        return '#6366f1' // Default purple
    }
  }

  useEffect(() => {
    console.log('LeadData status changed to:', leadData?.status)
    setStatus(leadData?.status)
  }, [leadData?.status])

const handleStatusChange = async newStatus => {
  console.log('Changing status to:', newStatus);

  // Optimistically update the UI immediately
  setStatus(newStatus);

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No authorization token found.');
      setStatus(leadData?.status);
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${leadData._id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    if (!response.ok) {
      toast.error('Something went wrong');
      setStatus(leadData?.status);
      return;
    }

    const data = await response.json();
    console.log('Status update response:', data);

    // Ensure the status is set correctly
    setStatus(data.lead.status);
    toast.success(`Lead Status changed to ${data.lead.status}`);
    handleStatusClose();

    // Call parent update function if available
     if (typeof onStatusChange === 'function') {
     onStatusChange(leadData._id, data.lead.status);
   } else {
     console.warn('ResizableDrawer: onStatusChange prop is not a function or not provided.');
   }
  } catch (error) {
    console.error('Failed to update lead status:', error);
    toast.error('Failed to update lead status');
    setStatus(leadData?.status);
  }
}

  const displayName = leadData?.name || userName
  const phoneNumber = leadData?.phone || 'N/A'
  const email = leadData?.email || 'N/A'
  const district = leadData?.district || 'N/A'
  const createdDate = leadData?.createdAt ? new Date(leadData.createdAt).toLocaleDateString() : 'N/A'
  const assignedToName = currentAssignedTo?.firstName
    ? `${currentAssignedTo.firstName} ${currentAssignedTo.lastName || ''}`.trim()
    : 'N/A'

  // Initialize lead tags when leadData changes
  useEffect(() => {
    if (leadData?.tags) {
      setLeadTags(leadData.tags)
    }
  }, [leadData])

  // Fetch all available tags
  useEffect(() => {
    if (tagModalOpen) {
      fetchAllTags()
    }
  }, [tagModalOpen])

  const fetchAllTags = async () => {
    setLoadingTags(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAllTags([])
        return
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/alltags`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (Array.isArray(response.data)) {
        setAllTags(response.data)
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        setAllTags(response.data.data)
      } else {
        setAllTags([])
      }
    } catch (err) {
      console.error('Error fetching tags', err)
      setAllTags([])
      if (err.response?.status !== 401) {
        toast.error('Failed to load tags. Please try again.')
      }
    } finally {
      setLoadingTags(false)
    }
  }

  const handleMouseDown = e => {
    if (isMobile) return
    setIsDragging(true)
    setStartX(e.clientX)
    setStartWidth(width)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  }

  const fetchActiveUsers = async () => {
    setLoadingUsers(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/users/active`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setActiveUsers(response.data.data)
      } else {
        console.error('Unexpected users response format:', response.data)
        toast.error('Failed to load users')
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      toast.error('Failed to load users. Please try again.')
    }
    setLoadingUsers(false)
  }

  useEffect(() => {
    setCurrentAssignedTo(leadData?.assignedTo)
  }, [leadData?.assignedTo])

  const handleAssignUser = async userId => {
    setAssigningUser(true)
    try {
      const token = localStorage.getItem('token')

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/assignlead/${leadId}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data && response.data.assignedTo) {
        const assignedUser = activeUsers.find(u => u._id === userId)
        if (assignedUser) {
          toast.success(`Lead assigned to ${assignedUser.firstName} ${assignedUser.lastName}`)
          setCurrentAssignedTo(assignedUser)

          if (socket) {
            socket.emit('send_notification', {
              to: response.data.assignedTo._id,
              title: 'New Lead',
              message: 'You have been assigned a new lead',
              type: 'lead_assignment'
            })
          }
        }
        setAssignmentModalOpen(false)
        if (typeof onAssignSuccess === 'function') {
                onAssignSuccess(leadId, assignedUser);
              }
            } else {
              toast.error('Failed to assign lead');
            }
          } catch (err) {
            console.error('Error assigning lead:', err);
            toast.error('Failed to assign lead. Please try again.');
          }
          setAssigningUser(false);
        };

  const handleMouseMove = e => {
    if (!isDragging) return
    const newWidth = startWidth + (startX - e.clientX)
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleTagTabChange = (event, newValue) => {
    setActiveTagTab(newValue)
    if (newValue === 1) {
      // Reset form when switching to Add New Tag
      setNewTagName('')
      setSelectedColor(TAG_COLORS[0])
    }
  }

  const handleTagModalOpen = () => {
    setTagModalOpen(true)
    setActiveTagTab(0)
    setSelectedTags([...leadTags])
  }

  const handleTagModalClose = () => {
    setTagModalOpen(false)
    setTagSearchTerm('')
    setNewTagName('')
    setSelectedColor(TAG_COLORS[0])
  }

  const handleTagSelection = tag => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t._id === tag._id)
      if (exists) {
        return prev.filter(t => t._id !== tag._id)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/createtag`,
        {
          name: newTagName.trim(),
          color: selectedColor
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Fixed: Check for response.data.tag instead of response.data.success
      if (response.data && response.data.tag) {
        const newTag = response.data.tag
        // Fixed: Add to allTags state first, then to selectedTags
        setAllTags(prev => [...prev, newTag])
        setSelectedTags(prev => [...prev, newTag])
        setNewTagName('')
        setSelectedColor(TAG_COLORS[0])
        setActiveTagTab(0)
        toast.success('Tag created successfully!')
      } else {
        toast.error('Failed to create tag')
      }
    } catch (err) {
      console.error('Error creating tag:', err)
      toast.error('Failed to create tag. Please try again.')
    }
  }

  const handleSaveTags = async () => {
    setSavingTags(true)
    try {
      const token = localStorage.getItem('token')
      // Determine which tags are actually new
      const newTagIds = selectedTags.filter(st => !leadTags.some(lt => lt._id === st._id)).map(st => st._id)

      if (newTagIds.length === 0) {
        toast.info('No new tags to add!')
        setSavingTags(false)
        return
      }

      const payload = { tags: newTagIds }

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${leadId}/tags/add`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.tags) {
        // merge new tags into leadTags
        setLeadTags(prev => [...prev, ...selectedTags.filter(st => newTagIds.includes(st._id))])
        toast.success('Tags added successfully!')
        handleTagModalClose()
      } else {
        toast.error('Failed to add tags')
      }
    } catch (err) {
      console.error('Error adding tags:', err)
      toast.error(err.response?.data?.message || 'Failed to update tags. Please try again.')
    }
    setSavingTags(false)
  }

  const handleRemoveTag = async tagToRemove => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${leadId}/tags/remove`,
        { tags: [tagToRemove._id] },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 200 || response.status === 204) {
        setLeadTags(prevTags => prevTags.filter(t => t._id !== tagToRemove._id))
        toast.success('Tag removed successfully!')
      }
    } catch (error) {
      console.error('Error removing tag:', error)
      toast.error('Failed to remove tag. Please try again.')
    }
  }

  const handleDataUpdate = useCallback(() => {
    // Add your parent data refresh logic here
    // For example, refetch lead data, update state, etc.
    console.log('Refreshing parent data...')

    // If you have a fetch function for the main lead data:
    // fetchLeadData()

    // Or increment a trigger to force re-renders:
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const handleActivityUpdate = useCallback(() => {
    // This will be passed to ActivityTab to refresh timeline
    console.log('Triggering activity timeline refresh...')
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Get first letter of user name for avatar fallback
  const getInitials = name => {
    if (!name) return 'A'
    return name.charAt(0).toUpperCase()
  }

  const getAssignedPersonInitials = assignedTo => {
    if (!assignedTo?.firstName) return 'U'
    return assignedTo.firstName.charAt(0).toUpperCase()
  }

  const formatFieldName = fieldKey => {
    // Remove prefix (e.g., "profile.", "education.", etc.)
    const cleanKey = fieldKey.includes('.') ? fieldKey.split('.').pop() : fieldKey

    // Convert camelCase to readable format
    return cleanKey
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/Of/g, 'of') // Fix "Of" to "of"
      .trim()
  }

  // Helper function to get additional fields
  const getAdditionalFields = leadData => {
    if (!leadData?.additionalFields) return []

    return Object.entries(leadData.additionalFields)
      .filter(([key, value]) => value && value.toString().trim()) // Filter out empty values
      .map(([key, value]) => ({
        label: formatFieldName(key),
        value: value.toString(),
        key: key
      }))
  }

  // Filter tags based on search term
  const filteredTags = allTags.filter(tag => tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()))

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100vw' : '80vw',
          maxWidth: isMobile ? '100vw' : `80vw`,
          // minWidth: isMobile ? '100vw' : `${minWidth}px`,
          transition: isDragging ? 'none' : 'width 0.2s',
          bgcolor: '#E9EAEE',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }
      }}
    >
      {!isMobile && <ResizeHandle onMouseDown={handleMouseDown} />}

      {/* Scrollable Container for all content */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: isMobile ? 'column' : 'row',
          height: isMobile ? 'auto' : 'calc(100vh - 64px)',
          overflow: isMobile ? 'visible' : 'hidden'
        }}
      >
        <Box
          sx={{
            width: isMobile ? '100%' : '30%',
            // On mobile, full-width and let height auto; borderRight only on desktop
            bgcolor: '#E9EAEE',
            overflowY: 'auto',
            borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
            borderBottom: isMobile ? '1px solid #e5e7eb' : 'none',
            display: 'flex',
            flexDirection: 'column'
          }}
        >

          {/* Back button for mobile - outside header */}
{isMobile && (
  <Box
    sx={{
      position: 'absolute',
      top: 16,
      left: 16,
      zIndex: 1001,
      bgcolor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '50%',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <IconButton
      onClick={onClose}
      sx={{
        color: 'white',
        p: 1,
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <i className='ri-arrow-left-line' style={{ fontSize: '1.2rem' }}></i>
    </IconButton>
  </Box>
)}

          {/* Purple Header */}
          <PurpleHeader
            sx={{
              flexShrink: 0,
              marginLeft: 0,
              marginRight: 0,
              height: '80px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 8, position: 'relative', overflow: 'visible' }}
              >
                <Avatar
                  src={currentAssignedTo?.profileImage}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'white',
                    color: '#6366f1',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    position: 'relative',
                    top: -5,
                    zIndex: 1000
                  }}
                  onClick={e => {
                    setAssignAnchorEl(e.currentTarget)
                    fetchActiveUsers()
                  }}
                >
                  {!currentAssignedTo?.profileImage && getAssignedPersonInitials(currentAssignedTo)}
                </Avatar>
                <Box sx={{ ml: 1, mb: 3 }}>
                  <Typography variant='body2' sx={{ opacity: 0.8, fontSize: '10px', color: 'white' }}>
                    Assigned to
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={e => {
                      setAssignAnchorEl(e.currentTarget)
                      fetchActiveUsers()
                    }}
                  >
                    {assignedToName || 'Click to assign'}
                  </Typography>
                </Box>
              </Box>
              <Menu
                anchorEl={assignAnchorEl}
                open={assignmentOpen}
                onClose={() => setAssignAnchorEl(null)}
                PaperProps={{ sx: { maxHeight: 300, minWidth: 200 } }}
              >
                {loadingUsers ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : activeUsers.length === 0 ? (
                  <MenuItem disabled>No users</MenuItem>
                ) : (
                  activeUsers.map(user => (
                    <MenuItem
                      key={user._id}
                      selected={leadData?.assignedTo?._id === user._id}
                      onClick={() => {
                        handleAssignUser(user._id)
                        setAssignAnchorEl(null)
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>{`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${user.firstName} ${user.lastName}`} secondary={user.email} />
                    </MenuItem>
                  ))
                )}
              </Menu>
            </Box>
          </PurpleHeader>

          {/* Profile Picture - overlapping the header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              top: isMobile ? -40 : -40,
              mb: isMobile ? -10 : -25,
              pl: isMobile ? 2 : 0,
              zIndex: 10,
              flexShrink: 0
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                bgcolor: '#1f2937',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Avatar
                src={leadData?.profileImage || profileImage}
                sx={{
                  width: '100%',
                  height: '100%',
                  fontSize: 32,
                  bgcolor: '#4b5563',
                  color: 'white'
                }}
              >
                {!leadData?.profileImage && getInitials(displayName)}
              </Avatar>
            </Box>
          </Box>

          {/* Profile Name */}
          <Box
            sx={{
              pt: 0,
              pb: 2,
              px: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                mt: isMobile ? 2 : 16,
                mb: 1,
                color: '#1f2937',
                textAlign: 'center',
                fontSize: '1.1rem'
              }}
            >
              {displayName}
            </Typography>
            {/* Action Buttons - Always visible at bottom */}
            <Box
              sx={{
                px: 3,
                pb: 3,
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              {leadData ? (
                <Box
                  sx={{
                    width: '100%',
                    transform: 'scale(0.85)',
                    transformOrigin: 'center'
                  }}
                >
                  <LeadActions
                    userData={leadData}
                    phone={leadData.phone}
                    status={leadData.status}
                    leadId={leadData._id}
                    onCall={num => (window.location.href = `tel:${num}`)}
                    onWhatsApp={async num => {
                      setWaPhone(num || leadData?.phone || '')
                      setWaMessage(
                        `Hi ${leadData?.name || ''}, this is regarding your enquiry.`
                      )
                      try {
                        const status = await getPersonalWhatsAppStatus()
                        setWaConnected(status.status === 'connected')
                      } catch {
                        setWaConnected(false)
                      }
                      setWaDialogOpen(true)
                    }}
                    onStatusChange={newStatus => setStatus(newStatus)}
                    onDataUpdate={onDataUpdate}
                    onActivityUpdate={handleActivityUpdate}
                    onCloseDrawer={() => {
                      onClose();
                      onDataUpdate();
                    }}
                  />
                </Box>
              ) : (
                <CircularProgress size={20} />
              )}
            </Box>

            {/* Status and Campaign */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                mt: -2,
                mb: 3,
                width: '100%'
              }}
            >
              <Chip
                label={status || leadData?.status || 'N/A'}
                size='small'
                icon={<i className='ri-user-follow-line'></i>}
                onClick={handleClick}
                sx={{
                  bgcolor: getStatusColor(status || leadData?.status),
                  color: 'white',
                  fontWeight: 600,
                  width: '85%',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  height: 38,
                  '& .MuiChip-icon': {
                    color: 'white',
                    fontSize: '0.9rem'
                  },
                  '&:hover': {
                    opacity: 0.8,
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />

              {/* Status Menu - Keep the same */}
              <Menu
                id='lead-status-menu'
                anchorEl={anchorEl}
                open={openstatus}
                onClose={handleStatusClose}
                MenuListProps={{
                  'aria-labelledby': 'lead-status-button'
                }}
              >
                {leadStatuses.map(leadStatus => {
                  const currentStatus = status || leadData?.status
                  const isDisabled =
                    (currentStatus === 'Interested' && leadStatus === 'Not Interested') ||
                    (currentStatus === 'Converted' && leadStatus !== 'Lost')

                  return (
                    <MenuItem
                      key={leadStatus}
                      onClick={() => handleStatusChange(leadStatus)}
                      disabled={isDisabled}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      {leadStatus}
                    </MenuItem>
                  )
                })}
              </Menu>
            </Box>
          </Box>

          {/* Tab Navigation */}
          <Box
            sx={{
              px: 2,
              mb: 2,
              flexShrink: 0,
              mx: 2,
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={leftSidebarTab}
              onChange={(event, newValue) => setLeftSidebarTab(newValue)}
              variant='fullWidth'
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  minHeight: 40,
                  py: 1
                },
                '& .Mui-selected': {
                  color: '#6366f1',
                  bgcolor: '#f0f0ff'
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  backgroundColor: '#6366f1',
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab label='Lead Details' />
              <Tab label='Personal Info' />
            </Tabs>
          </Box>
          <Box
            sx={{
              flex: 1,
              px: 2,
              overflowY: 'auto'
            }}
          >
            {leftSidebarTab === 0 ? (
              // Lead Details Tab
              <Box>
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginTop: 2 }}>
                      <i className='ri-flag-fill' style={{ color: '#6366f1', fontSize: '1.3rem' }}></i>
                      {leadData?.campaignid?._id ? (
                        <Button
                          size='small'
                          sx={{ textTransform: 'none', fontWeight: 600, p: 0, minWidth: 0 }}
                          onClick={() => router.push(`/${locale}/manager/leads/${leadData.campaignid._id}`)}
                        >
                          {leadData.campaignid.name || 'Campaign'}
                        </Button>
                      ) : (
                        <h1 className='text-sm font-semibold text-gray-600 ml-1'>
                          {leadData?.campaignid?.name || 'N/A'}
                        </h1>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                      {leadData?.campaignid?.Pipeline && (
                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={<i className='ri-flow-chart' />}
                          onClick={() =>
                            router.push(
                              `/${locale}/manager/workflow/${leadData.campaignid.Pipeline?._id || leadData.campaignid.Pipeline}`
                            )
                          }
                        >
                          Pipeline
                        </Button>
                      )}
                      {resolvedLeadId && (
                        <>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-calendar-check-line' />}
                            onClick={() => router.push(`/${locale}/manager/followup?leadId=${resolvedLeadId}`)}
                          >
                            Follow-ups
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-coupon-2-line' />}
                            onClick={() =>
                              router.push(`/${locale}/manager/tickets?leadId=${resolvedLeadId}&create=1`)
                            }
                          >
                            Ticket
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-history-line' />}
                            onClick={() =>
                              router.push(`/${locale}/manager/activitylog?leadId=${resolvedLeadId}`)
                            }
                          >
                            Activity
                          </Button>
                          {leadData?.Customer && (
                            <Button
                              size='small'
                              variant='outlined'
                              startIcon={<i className='ri-contacts-book-line' />}
                              onClick={() =>
                                router.push(
                                  `/${locale}/manager/customer?customerId=${leadData.Customer?._id || leadData.Customer}`
                                )
                              }
                            >
                              Contact
                            </Button>
                          )}
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-money-dollar-circle-line' />}
                            onClick={() =>
                              router.push(`/${locale}/manager/saleRequest?leadId=${resolvedLeadId}`)
                            }
                          >
                            Sales
                          </Button>
                        </>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                      <i className='ri-map-pin-fill' style={{ color: '#6366f1', fontSize: '1.3rem' }}></i>
                      <h1 className='text-sm font-semibold text-gray-600 ml-1'>{district}</h1>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                      <i className='ri-calendar-fill' style={{ color: '#6366f1', fontSize: '1.3rem' }}></i>
                      <h1 className='text-sm font-semibold text-gray-600 ml-1'>{createdDate}</h1>
                    </Box>
                    {leadData?.source && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-links-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                        <Typography
                          variant='caption'
                          sx={{
                            color: '#374151',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        >
                          <strong>Source:</strong> {leadData.source}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Additional Fields if any */}
                  {getAdditionalFields(leadData).length > 0 && (
                    <>
                      <Box
                        sx={{
                          p: 2.5,
                          bgcolor: 'white',
                          borderRadius: 2,
                          mb: 2,
                          ml: -2
                        }}
                      >
                        <Typography
                          variant='subtitle2'
                          sx={{
                            color: '#6366f1',
                            mb: 2,
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          Additional Information
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5
                          }}
                        >
                          {getAdditionalFields(leadData)
                            .slice(0, 5)
                            .map(field => (
                              <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='ri-information-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                                <Typography
                                  variant='caption'
                                  sx={{
                                    color: '#374151',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <strong>{field.label}:</strong> {field.value}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      </Box>
                    </>
                  )}
                  <>
                    <Box
                      sx={{
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'left',
                        marginTop: 2
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.8,
                          marginTop: 2,
                          flexWrap: 'wrap',
                          alignItems: 'left',
                          justifyContent: 'left',
                          maxWidth: '100%'
                        }}
                      >
                        {/* Display first 3 tags */}
                        {leadTags?.slice(0, 3).map(tag => (
                          <Chip
                            key={tag._id}
                            label={tag.name}
                            size='small'
                            sx={{
                              bgcolor:
                                tag.color || ['#e5e7eb', '#fca5a5', '#fdba74', '#fde68a'][leadTags.indexOf(tag) % 4],
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              height: 24
                            }}
                            onDelete={() => handleRemoveTag(tag)}
                            deleteIcon={<i className='ri-close-line' style={{ fontSize: '0.7rem' }} />}
                          />
                        ))}

                        {/* Enhanced tooltip for remaining tags */}
                        {leadTags?.length > 3 && (
                          <Tooltip
                            title={
                              <Box sx={{ p: 1 }}>
                                <Typography variant='body2' sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
                                  Additional Tags:
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {leadTags.slice(3).map(tag => (
                                    <Box key={tag._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: '50%',
                                          bgcolor: tag.color || '#6b7280',
                                          flexShrink: 0
                                        }}
                                      />
                                      <Typography variant='caption' sx={{ color: 'white', fontSize: '0.75rem' }}>
                                        {tag.name}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            }
                            placement='top'
                            arrow
                            PopperProps={{
                              sx: {
                                '& .MuiTooltip-tooltip': {
                                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                                  maxWidth: 250,
                                  fontSize: '0.75rem'
                                },
                                '& .MuiTooltip-arrow': {
                                  color: 'rgba(0, 0, 0, 0.9)'
                                }
                              }
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'pointer',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: 'rgba(99, 102, 241, 0.1)'
                                }
                              }}
                            >
                              <i
                                className='ri-price-tag-3-fill'
                                style={{
                                  fontSize: '0.8rem',
                                  color: '#6366f1'
                                }}
                              />
                              <Typography
                                variant='caption'
                                sx={{
                                  color: '#6366f1',
                                  fontSize: '0.7rem',
                                  fontWeight: 500
                                }}
                              >
                                +{leadTags.length - 3} more
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {/* Add tag button */}
                        <IconButton
                          size='small'
                          sx={{
                            color: '#6b7280',
                            width: 32,
                            height: 32
                          }}
                          onClick={handleTagModalOpen}
                        >
                          <i className='ri-price-tag-3-fill' style={{ fontSize: '1rem' }}></i>
                        </IconButton>
                      </Box>
                    </Box>
                  </>
                </Box>
              </Box>
            ) : (
              // Personal Info Tab
              <Box>
                {/* Contact Details */}
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    mb: 2
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{
                      color: '#6366f1',
                      mb: 2,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    Contact Information
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                      <i className='ri-phone-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                      <Typography
                        variant='caption'
                        sx={{
                          color: '#374151',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          lineHeight: 1.4
                        }}
                      >
                        <strong>Phone:</strong> {phoneNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                      <i className='ri-mail-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                      <Typography
                        variant='caption'
                        sx={{
                          color: '#374151',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          lineHeight: 1.4,
                          wordBreak: 'break-all'
                        }}
                      >
                        <strong>Email:</strong> {email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                      <i className='ri-map-pin-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                      <Typography
                        variant='caption'
                        sx={{
                          color: '#374151',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          lineHeight: 1.4
                        }}
                      >
                        <strong>District:</strong> {district}
                      </Typography>
                    </Box>
                    {leadData?.address && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <i
                          className='ri-home-fill'
                          style={{ color: '#6366f1', fontSize: '1rem', marginTop: '2px' }}
                        ></i>
                        <Typography
                          variant='caption'
                          sx={{
                            color: '#374151',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            lineHeight: 1.4
                          }}
                        >
                          <strong>Address:</strong> {leadData.address}
                        </Typography>
                      </Box>
                    )}
                    {leadData?.age && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-user-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                        <Typography
                          variant='caption'
                          sx={{
                            color: '#374151',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            lineHeight: 1.4
                          }}
                        >
                          <strong>Age:</strong> {leadData.age}
                        </Typography>
                      </Box>
                    )}
                    {leadData?.gender && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-user-2-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                        <Typography
                          variant='caption'
                          sx={{
                            color: '#374151',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            lineHeight: 1.4
                          }}
                        >
                          <strong>Gender:</strong> {leadData.gender}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Personal Details if available */}
                {(leadData?.dateOfBirth || leadData?.occupation || leadData?.education) && (
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      mb: 2
                    }}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{
                        color: '#6366f1',
                        mb: 2,
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    >
                      Personal Details
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5
                      }}
                    >
                      {leadData?.dateOfBirth && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='ri-cake-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                          <Typography
                            variant='caption'
                            sx={{
                              color: '#374151',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              lineHeight: 1.4
                            }}
                          >
                            <strong>Date of Birth:</strong> {new Date(leadData.dateOfBirth).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {leadData?.occupation && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='ri-briefcase-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                          <Typography
                            variant='caption'
                            sx={{
                              color: '#374151',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              lineHeight: 1.4
                            }}
                          >
                            <strong>Occupation:</strong> {leadData.occupation}
                          </Typography>
                        </Box>
                      )}
                      {leadData?.education && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='ri-graduation-cap-fill' style={{ color: '#6366f1', fontSize: '1rem' }}></i>
                          <Typography
                            variant='caption'
                            sx={{
                              color: '#374151',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              lineHeight: 1.4
                            }}
                          >
                            <strong>Education:</strong> {leadData.education}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <Dialog
            open={tagModalOpen}
            onClose={handleTagModalClose}
            maxWidth='sm'
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                minHeight: 500
              }
            }}
          >
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 0,
                color: '#6366f1',
                fontWeight: 600,
                fontSize: '1.25rem'
              }}
            >
              Tags
              <IconButton onClick={handleTagModalClose} size='small'>
                <i className='ri-close-line' />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              {/* Tab Headers */}
              <Box sx={{ borderBottom: '1px solid #e5e7eb' }}>
                <Tabs
                  value={activeTagTab}
                  onChange={handleTagTabChange}
                  variant='fullWidth'
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      py: 2
                    },
                    '& .Mui-selected': {
                      // color: 'white',
                      color: '#6366f1'
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none'
                    }
                  }}
                >
                  <Tab label='All Tags' />
                  <Tab label='Add New Tag' />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 3, minHeight: 300 }}>
                {activeTagTab === 0 ? (
                  // All Tags Tab
                  <Box>
                    {/* Search Bar */}
                    <TextField
                      fullWidth
                      placeholder='Search Tags'
                      value={tagSearchTerm}
                      onChange={e => setTagSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <i
                            className='ri-search-line'
                            style={{
                              marginRight: 8,
                              color: '#9ca3af'
                            }}
                          />
                        )
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#f9fafb'
                        }
                      }}
                    />

                    {/* Tags List */}
                    <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                      {loadingTags ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <Typography>Loading tags...</Typography>
                        </Box>
                      ) : filteredTags.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: '#9ca3af' }}>
                          <Typography>No tags found</Typography>
                        </Box>
                      ) : (
                        filteredTags.map(tag => (
                          <Box
                            key={tag._id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              py: 1.5,
                              px: 1,
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: '#f3f4f6'
                              }
                            }}
                          >
                            <Checkbox
                              checked={selectedTags.some(t => t._id === tag._id)}
                              onChange={() => handleTagSelection(tag)}
                              sx={{
                                color: '#6366f1',
                                '&.Mui-checked': {
                                  color: '#6366f1'
                                }
                              }}
                            />
                            <Chip
                              label={tag.name}
                              size='small'
                              sx={{
                                bgcolor: tag.color,
                                color: 'white',
                                fontWeight: 500,
                                ml: 1
                              }}
                            />
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                ) : (
                  // Add New Tag Tab
                  <Box>
                    <TextField
                      fullWidth
                      placeholder='Enter Tag Name'
                      value={newTagName}
                      onChange={e => setNewTagName(e.target.value)}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#f9fafb'
                        }
                      }}
                    />

                    <Typography
                      variant='body2'
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: '#6366f1'
                      }}
                    >
                      Tag Color:
                    </Typography>

                    {/* Color Picker */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        mb: 4
                      }}
                    >
                      {TAG_COLORS.map(color => (
                        <Box
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: color,
                            cursor: 'pointer',
                            border: selectedColor === color ? '3px solid #374151' : '2px solid transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                        />
                      ))}
                    </Box>

                    {/* Preview */}
                    {newTagName && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant='body2' sx={{ mb: 1, color: '#6b7280' }}>
                          Preview:
                        </Typography>
                        <Chip
                          label={newTagName}
                          size='small'
                          sx={{
                            bgcolor: selectedColor,
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              {activeTagTab === 0 ? (
                // All Tags Actions
                <>
                  <Button
                    onClick={handleTagModalClose}
                    variant='outlined'
                    sx={{
                      borderColor: '#d1d5db',
                      color: '#6b7280',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTags}
                    variant='contained'
                    disabled={savingTags}
                    sx={{
                      bgcolor: '#6366f1',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#5b5bd6'
                      }
                    }}
                  >
                    {savingTags ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                // Add New Tag Actions
                <>
                  <Button
                    onClick={() => setActiveTagTab(0)}
                    variant='outlined'
                    sx={{
                      borderColor: '#d1d5db',
                      color: '#6b7280',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateNewTag}
                    variant='contained'
                    disabled={!newTagName.trim()}
                    sx={{
                      bgcolor: '#6366f1',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#5b5bd6'
                      },
                      '&:disabled': {
                        bgcolor: '#d1d5db'
                      }
                    }}
                  >
                    Save
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        </Box>

        {/* Tabs */}
        <Box
          sx={{
            width: isMobile ? '100%' : '70%',
            display: 'flex',
            flexDirection: 'column',
            // On mobile, allow flexible height
            height: isMobile ? 'auto' : '100%'
          }}
        >
          <div className='mt-8'>
            <ActivityHappen id={leadId} />
          </div>
          <Box sx={{ borderRadius: '20px', flexShrink: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant='fullWidth'
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  py: 2
                },
                '& .Mui-selected': {
                  color: '#6366f1',
                  bgcolor: '#f0f0ff'
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              <Tab label='ACTIVITIES' />
              <Tab label='NOTES' />
              <Tab label='DOCUMENTS' />
              <Tab label='BILLINGS' />
            </Tabs>
          </Box>

          {/* Content based on active tab */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              bgcolor: '#f1f5f9',
              overflowY: 'auto'
            }}
          >
            {activeTab === 0 && <ActivityTab leadId={leadId} onRefresh={refreshTrigger} />}
            {activeTab === 1 && (
              <NotesComponent
                leadId={leadId}
                onNoteAdded={newNote => {
                  console.log('New note added:', newNote)
                }}
              />
            )}
            {activeTab === 2 && <InvoiceListTable id={leadId} />}
            {activeTab === 3 && <NotificationsTab id={leadId} />}
          </Box>
        </Box>
      </Box>

      <Dialog open={waDialogOpen} onClose={() => setWaDialogOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Send WhatsApp</DialogTitle>
        <DialogContent>
          {waConnected ? (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Sending from your linked personal WhatsApp.
            </Typography>
          ) : (
            <Typography variant='body2' color='warning.main' sx={{ mb: 2 }}>
              Your WhatsApp is not linked. Connect it under My WhatsApp, or open the web chat instead.
            </Typography>
          )}
          <TextField
            fullWidth
            label='Phone'
            value={waPhone}
            onChange={e => setWaPhone(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label='Message'
            value={waMessage}
            onChange={e => setWaMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWaDialogOpen(false)}>Cancel</Button>
          <Button
            variant='outlined'
            onClick={() => {
              const digits = String(waPhone || '').replace(/\D/g, '')
              window.open(`https://wa.me/${digits}?text=${encodeURIComponent(waMessage || '')}`, '_blank')
              setWaDialogOpen(false)
            }}
          >
            Open WhatsApp Web
          </Button>
          <Button
            variant='contained'
            disabled={!waConnected || waSending || !waPhone || !waMessage}
            onClick={async () => {
              setWaSending(true)
              try {
                await sendPersonalWhatsAppMessage({
                  phone: waPhone,
                  message: waMessage,
                  leadId,
                })
                toast.success('WhatsApp message sent')
                setWaDialogOpen(false)
              } catch (err) {
                toast.error(err.message || 'Failed to send')
              } finally {
                setWaSending(false)
              }
            }}
          >
            {waSending ? <CircularProgress size={20} /> : 'Send from my WhatsApp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  )
}

export { ActivityItem, ActivityNumber }

export default ResizableDrawer
