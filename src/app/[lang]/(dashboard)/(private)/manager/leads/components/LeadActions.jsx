import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Divider,
    CircularProgress,
    Grid,
    FormControlLabel,
    Checkbox,
    Select,
    MenuItem,
    Avatar,
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'

import FormLayoutsCollapsible from '@/app/[lang]/(dashboard)/(private)/manager/leads/FormLayoutsCollapsible'
import { useData } from '@/contexts/DataContext'
import CustomInput from '@/views/apps/leadView/view/user-left-overview/CustomInput'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const FollowUpDateInput = React.forwardRef(function FollowUpDateInput(props, ref) {
    return <CustomInput {...props} ref={ref} label='Date & Time *' />
})

const LeadActions = ({
    userData,    // object containing { firstName, email, phone, district, createdAt, profile, additionalFields, leadId, etc. }
    phone,
    status,
    onStatusChange,
    leadId,
    onCall,
    onWhatsApp,
    onDataUpdate, 
    onActivityUpdate, // NEW: Callback to refresh activity timeline
    onCloseDrawer,
    leadStatuses = ['Interested', 'Not Interested', 'Converted', 'Duplicate', 'Lost']
}) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const dataContext = useData()
    const updateData = dataContext?.updateData

    // --------------------------------------------
    // 1) CALLER MODE STATE & HANDLERS (with "Add More Information")
    // --------------------------------------------
    const [openCallModal, setOpenCallModal] = useState(false)
    const [callFormData, setCallFormData] = useState({ notes: '' })
    const [loadingCallSubmit, setLoadingCallSubmit] = useState(false)

    // "Add More Information" dialog - shared between caller mode and user icon
    const [openMoreInfo, setOpenMoreInfo] = useState(false)

    const handleCallClick = (phoneNumber) => {
        // 1) Open the Caller Mode dialog immediately
        setOpenCallModal(true)

        // 2) After 1 second, initiate the tel: link
        setTimeout(() => {
            window.location.href = `tel:${phoneNumber}`
        }, 1000)
    }

    const handleCloseCallModal = () => {
        setOpenCallModal(false)
        setCallFormData({ notes: '' })
    }

    const handleCallSubmit = async () => {
        setLoadingCallSubmit(true)
        try {
            const token = localStorage.getItem('token')
            const notes = (callFormData.notes || '').toString().trim()

            // If the user typed a note, send it as a lead activity
            if (notes !== '') {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/leadactivity`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            leadId: leadId?.toString() || '',
                            action: 'note_added',
                            details: notes,
                        }),
                    }
                )
                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.message || 'Failed to add note')
                }
            }

            // If current status was 'New', auto‑set it to 'Contacted'
            if (status === 'New') {
                const resp2 = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${leadId}/status`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ status: 'Contacted' }),
                    }
                )
                if (!resp2.ok) {
                    const d = await resp2.json()
                    throw new Error(d.message || 'Failed to update status')
                }
                const json = await resp2.json()
                if (onStatusChange) {
                    onStatusChange(json.lead.status)
                }
            }

            toast.success('Call notes submitted', { position: 'bottom-right' })
            handleCloseCallModal()

            // Notify parent component to refresh data
            if (onDataUpdate) {
                onDataUpdate()
            }

            // NEW: Refresh activity timeline
            if (onActivityUpdate) {
                onActivityUpdate()
            }
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Error during call submit', {
                position: 'bottom-right',
            })
        } finally {
            setLoadingCallSubmit(false)
        }
    }

    const handleNotPicked = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leadactivity/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    leadId: leadId?.toString() || '',
                    action: 'notPicked',
                }),
            })
            if (!response.ok) {
                const d = await response.json()
                throw new Error(d.message || 'Failed to mark Not Picked')
            }
            toast.success('Marked as Not Picked', { position: 'bottom-right' })
            handleCloseCallModal()

            // Notify parent component to refresh data
            if (onDataUpdate) {
                onDataUpdate()
            }

            // NEW: Refresh activity timeline
            if (onActivityUpdate) {
                onActivityUpdate()
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred. Please try again.', {
                position: 'bottom-right',
            })
        }
    }

    // Handlers for "Add More Information" / "Edit Profile" - shared function
    const handleOpenMoreInfo = () => setOpenMoreInfo(true)
    const handleCloseMoreInfo = () => {
        setOpenMoreInfo(false)
        // Notify parent component to refresh data after profile update
        if (onDataUpdate) {
            onDataUpdate()
        }
    }

    // Enhanced handler for profile save - ensures dialog closes and data refreshes
const handleProfileSave = async () => {
    try {
        // First, refresh parent data
        if (onDataUpdate) {
            await onDataUpdate()
        }
        
        // Then refresh activity timeline if available
        if (onActivityUpdate) {
            await onActivityUpdate()
        }
        
        // Close the dialog after data is refreshed
        setOpenMoreInfo(false)
        
        // Close drawer if needed
        if (onCloseDrawer) {
            onCloseDrawer()
        }
        
        // Show success message
        toast.success('Profile updated successfully', { position: 'bottom-right' })
    } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('Error updating profile', { position: 'bottom-right' })
    }
        
        // Show success message
        toast.success('Profile updated successfully', { position: 'bottom-right' })
    }

    // NEW: Handler for User Icon click - opens the same "Complete Profile" dialog
    const handleUserIconClick = () => {
        handleOpenMoreInfo()
    }

    // --------------------------------------------
    // 2) FOLLOW UP STATE & HANDLERS
    // --------------------------------------------
    const [openFollowupModal, setOpenFollowupModal] = useState(false)
    const [dateTime, setDateTime] = useState(new Date())
    const [followupData, setFollowupData] = useState({ notes: '' })
    const [isAssignVisible, setIsAssignVisible] = useState(false)
    const [assignTo, setAssignTo] = useState('')
    const [teamMembers, setTeamMembers] = useState([])
    const [transferLeadOwnership, setTransferLeadOwnership] = useState(true)
    const [loadingFollowupSubmit, setLoadingFollowupSubmit] = useState(false)
    const [errorFollowup, setErrorFollowup] = useState('')

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('token')
                const resp = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const list = Array.isArray(resp.data) ? resp.data : (resp.data?.data || resp.data?.users || [])
                setTeamMembers(list)
            } catch (err) {
                console.error('Failed to fetch team members:', err)
            }
        }
        fetchMembers()
    }, [])

    const handleFollowupOpen = () => setOpenFollowupModal(true)
    const handleFollowupClose = () => {
        setOpenFollowupModal(false)
        setFollowupData({ notes: '' })
        setIsAssignVisible(false)
        setAssignTo('')
        setTransferLeadOwnership(true)
        setDateTime(new Date())
        setErrorFollowup('')
    }

    const handleFollowupSubmit = async () => {
        if (!leadId) {
            setErrorFollowup('Lead ID is missing')
            toast.error('Cannot create follow up without a lead ID', { position: 'bottom-right' })
            return
        }

        if (!dateTime || Number.isNaN(new Date(dateTime).getTime())) {
            setErrorFollowup('Please pick a follow-up date and time')
            toast.error('Please pick a follow-up date and time', { position: 'bottom-right' })
            return
        }

        if (isAssignVisible && !String(assignTo || '').trim()) {
            setErrorFollowup('Select who should handle this follow-up')
            toast.error('Select who should handle this follow-up', { position: 'bottom-right' })
            return
        }

        setErrorFollowup('')
        setLoadingFollowupSubmit(true)
        try {
            const token = localStorage.getItem('token')
            const scheduledAt = new Date(dateTime).toISOString()
            const body = {
                leadId: String(leadId),
                // Scheduled slot drives calendar + reminders
                followUpDate: scheduledAt,
                nextFollowUpDate: scheduledAt,
                status: 'Pending',
                notes: followupData.notes || '',
                transferLeadOwnership: Boolean(isAssignVisible && transferLeadOwnership),
            }
            if (isAssignVisible && assignTo && String(assignTo).trim()) {
                body.assignedTo = String(assignTo).trim()
            }

            console.log('>>> follow‑up payload:', body)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok) {
                console.error('Follow‑up API error:', data)
                throw new Error(data.message || data.error || 'Failed to create follow up')
            }

            toast.success(
                body.assignedTo && body.transferLeadOwnership
                    ? 'Follow-up scheduled — lead handed to assignee'
                    : 'New Follow Up added',
                { position: 'bottom-right' }
            )
            handleFollowupClose()

            // Refresh UpcomingActivities (watches DataContext data1)
            if (updateData) {
                updateData({ refresh: true, at: Date.now() })
            }

            // Notify parent component to refresh data
            if (onDataUpdate) {
                onDataUpdate()
            }

            // NEW: Refresh activity timeline
            if (onActivityUpdate) {
                onActivityUpdate()
            }
        } catch (err) {
            console.error('Follow‑up submission error:', err)
            const errorMessage = err.message || 'An error occurred. Please try again.'
            setErrorFollowup(errorMessage)
            toast.error(errorMessage, { position: 'bottom-right' })
        } finally {
            setLoadingFollowupSubmit(false)
        }
    }

    // --------------------------------------------
    // 3) UPLOAD DOCUMENT STATE & HANDLERS
    // --------------------------------------------
    const [openUploadModal, setOpenUploadModal] = useState(false)
    const [file, setFile] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [docData, setDocData] = useState({ docName: '' })

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0]
        if (!selectedFile) return

        if (selectedFile.size > MAX_FILE_SIZE) {
            setErrorMessage('File size exceeds 5MB')
            return
        }

        setErrorMessage('')
        setFile(Object.assign(selectedFile, { preview: URL.createObjectURL(selectedFile) }))
    }, [])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
    })

    const handleChangeFile = () => {
        setFile(null)
        setErrorMessage('')
    }

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage('Please select a file to upload')
            return
        }
        if (!docData.docName.trim()) {
            setErrorMessage('Document Type is required')
            return
        }
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('files', file)
        formData.append('docName', docData.docName.trim())
        formData.append('leadId', leadId)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`, // no Content-Type header when sending FormData
                },
                body: formData,
            })
            const data = await response.json()
            if (response.ok) {
                toast.success('File uploaded successfully', { position: 'bottom-right' })
                setFile(null)
                setDocData({ docName: '' })
                setOpenUploadModal(false)

                // Notify parent component to refresh data
                if (onDataUpdate) {
                    onDataUpdate()
                }
            } else {
                setErrorMessage(data.error || 'Upload failed')
            }
        } catch (error) {
            console.error(error)
            setErrorMessage('An error occurred during the upload.')
        }
    }

    // --------------------------------------------
    // 4) UI: Icon Row & Dialogs
    // --------------------------------------------
    const ActionButton = styled(IconButton)(({ theme }) => ({
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#6b7280',
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1px solid #e5e7eb',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        [theme.breakpoints.down('sm')]: {
            width: 40,
            height: 40,
            '& svg': {
                fontSize: '16px !important',
            },
        },
    }))

    return (
        <>
            {/* ================================================= */}
            {/* 4-Button Row: WhatsApp, Phone (Caller), User (Edit Profile), Calendar (Follow Up) */}
            {/* ================================================= */}
            <Box sx={{ px: { xs: 1, sm: 3 }, pb: 3, flexShrink: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 },
                        mt: 1,
                        flexWrap: 'nowrap', // Prevent wrapping
                        '& > button': {
                            flex: '0 0 auto', // Don't allow buttons to grow or shrink
                            minWidth: { xs: 40, sm: 48 }, // Ensure minimum width
                        },
                    }}
                >
                    {/* WhatsApp */}
                    <ActionButton
                        onClick={() => onWhatsApp(phone)}
                        color="success"
                        sx={{ bgcolor: '#e8f5e8' }}
                    >
                        <i
                            className="ri-whatsapp-fill"
                            style={{
                                color: '#25D366',
                                fontSize: isMobile ? '16px' : '20px'
                            }}
                        />
                    </ActionButton>

                    {/* Phone → Caller Mode */}
                    <ActionButton
                        onClick={() => handleCallClick(phone)}
                        color="primary"
                        sx={{ bgcolor: '#e3f2fd' }}
                    >
                        <i className="ri-phone-line" style={{ fontSize: isMobile ? 16 : 20, color: '#2196f3' }} />
                    </ActionButton>

                    {/* User → Edit Profile (Complete Profile Dialog) */}
                    <ActionButton 
                        onClick={handleUserIconClick}
                        sx={{ 
                            bgcolor: '#f3e5f5',
                            '&:hover': {
                                bgcolor: '#e1bee7',
                            }
                        }}
                    >
                        <i 
                            className="ri-user-line" 
                            style={{ 
                                fontSize: isMobile ? 16 : 20, 
                                color: '#9c27b0' 
                            }} 
                        />
                    </ActionButton>

                    {/* Calendar → Add Follow Up */}
                    <ActionButton onClick={handleFollowupOpen}>
                        <i className="ri-calendar-line" style={{ fontSize: isMobile ? 16 : 20 }} />
                    </ActionButton>
                </Box>
            </Box>

            {/* ================================================= */}
            {/* 4) CALLER MODE DIALOG (fullScreen) including:        */}
            {/*    • Customer Details                              */}
            {/*    • "Add More Information" (opens Complete Profile)*/}
            {/*    • "Add Caller Note" + "Add Follow up" + "Upload Document" buttons */}
            {/*    • "Not Picked" + "Submit"                       */}
            {/* ================================================= */}
            <Dialog
                fullScreen
                open={openCallModal}
                onClose={handleCloseCallModal}
                aria-labelledby="caller-mode-title"
            >
                <DialogTitle id="caller-mode-title">Caller Mode</DialogTitle>
                <DialogContent>
                    <Card>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* ——— Customer Details Header ——— */}
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h5">Customer Details</Typography>
                                {/* "Add more information" button */}
                                <Button
                                    onClick={handleOpenMoreInfo}
                                    variant="outlined"
                                    startIcon={<i className="ri-file-info-line"></i>}
                                >
                                    Add More Information
                                </Button>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* ——— Customer Details Fields ——— */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    <Typography color="text.primary" sx={{ fontWeight: 500 }}>
                                        Full Name:
                                    </Typography>
                                    <Typography>{userData.name}</Typography>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    <Typography color="text.primary" sx={{ fontWeight: 500 }}>
                                        Email:
                                    </Typography>
                                    <Typography>{userData.email}</Typography>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    <Typography color="text.primary" sx={{ fontWeight: 500 }}>
                                        Phone:
                                    </Typography>
                                    <Typography>{userData.phone}</Typography>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    <Typography color="text.primary" sx={{ fontWeight: 500 }}>
                                        District:
                                    </Typography>
                                    <Typography>{userData.district}</Typography>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    <Typography color="text.primary" sx={{ fontWeight: 500 }}>
                                        Created At:
                                    </Typography>
                                    <Typography>{new Date(userData.createdAt).toLocaleString()}</Typography>
                                </div>
                                {/* If there are additional "moreData" fields (Enquiry Data), you could map them here exactly as in UserDetails.jsx */}
                            </div>

                            <Divider sx={{ my: 1 }} />

                            {/* ——— "Add Caller Note" TextField ——— */}
                            <TextField
                                fullWidth
                                multiline
                                variant="standard"
                                label="Add Caller Note"
                                placeholder="Type your notes..."
                                value={callFormData.notes}
                                onChange={(e) =>
                                    setCallFormData({ ...callFormData, notes: e.target.value })
                                }
                            />

                            {/* ——— Buttons: Add Follow Up & Upload Document ———  */}
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button
                                    onClick={handleFollowupOpen}
                                    variant="outlined"
                                    startIcon={<i className="ri-calendar-line"></i>}
                                >
                                    Add Follow Up
                                </Button>
                                <Button
                                    onClick={() => setOpenUploadModal(true)}
                                    variant="outlined"
                                    startIcon={<i className="ri-folder-upload-line"></i>}
                                >
                                    Upload Document
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </DialogContent>

                <DialogActions sx={{ pr: 3, pb: 2 }}>
                    <Button
                        onClick={handleNotPicked}
                        variant="outlined"
                        color="error"
                        disabled={loadingCallSubmit}
                    >
                        Not Picked
                    </Button>
                    <Button
                        onClick={handleCallSubmit}
                        variant="contained"
                        disabled={loadingCallSubmit}
                    >
                        {loadingCallSubmit ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ================================================= */}
            {/* 5) "Complete Profile" Dialog (Add More Information / Edit Profile)  */}
            {/*    This dialog is now shared between caller mode and user icon click */}
            {/* ================================================= */}
            <Dialog open={openMoreInfo} onClose={handleCloseMoreInfo} fullWidth maxWidth="md">
                <DialogTitle>
                    {/* Dynamic title based on context */}
                    {openCallModal ? 'Complete Profile' : 'Edit User Profile'}
                </DialogTitle>
                <DialogContent>
                    <FormLayoutsCollapsible 
                        props={userData} 
                        handleClose={handleCloseMoreInfo}
                        onSave={handleProfileSave}
                        onCancel={handleCloseMoreInfo}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseMoreInfo}
                        variant="outlined"
                        color="secondary"
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ================================================= */}
            {/* 6) Upload Documents Dialog */}
            {/* ================================================= */}
            <Dialog open={openUploadModal} onClose={() => setOpenUploadModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Upload Documents</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
                        {/* Document Type Input */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Document Type"
                                value={docData.docName}
                                onChange={(e) => setDocData({ ...docData, docName: e.target.value })}
                            />
                        </Grid>
                        {/* Dropzone */}
                        <Grid item xs={12}>
                            <Box
                                {...getRootProps({
                                    className: 'dropzone',
                                    style: {
                                        border: '2px dotted gray',
                                        padding: 24,
                                        borderRadius: 8,
                                        textAlign: 'center',
                                    },
                                })}
                            >
                                <input {...getInputProps()} />
                                {file ? (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6">{file.name}</Typography>
                                        <Button onClick={handleChangeFile}>Change</Button>
                                    </Box>
                                ) : (
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Avatar
                                            variant="rounded"
                                            sx={{ bgcolor: 'grey.200', mb: 1 }}
                                        >
                                            <i className="ri-folder-upload-line"></i>
                                        </Avatar>
                                        <Typography variant="h6" mb={1}>
                                            Drop PDF or image here, or click to browse
                                        </Typography>
                                        <Typography color="text.secondary">
                                            (Max size: 5 MB)
                                        </Typography>
                                        {errorMessage && (
                                            <Typography color="error" mt={1}>
                                                {errorMessage}
                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenUploadModal(false)}
                        variant="outlined"
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} variant="contained">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ================================================= */}
            {/* 7) Add Follow‑Up Dialog (same as before)  */}
            {/* ================================================= */}
            <Dialog
                open={openFollowupModal}
                onClose={handleFollowupClose}
                aria-labelledby="followup-title"
                disableEnforceFocus
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="followup-title">Add Follow Up</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Schedule (date & time)
                            </Typography>
                            <AppReactDatepicker
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                selected={dateTime}
                                id="followup-date-time-picker"
                                dateFormat="MM/dd/yyyy h:mm aa"
                                onChange={(date) => setDateTime(date)}
                                customInput={<FollowUpDateInput />}
                                portalId="followup-datepicker-portal"
                                minDate={new Date()}
                            />
                            <Typography variant="caption" color="text.secondary">
                                This time appears on Calendar and drives reminders.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label="Notes"
                                placeholder="Meeting agenda, GMeet link, talking points…"
                                value={followupData.notes}
                                onChange={(e) =>
                                    setFollowupData({ ...followupData, notes: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isAssignVisible}
                                        onChange={(e) => {
                                            setIsAssignVisible(e.target.checked)
                                            if (!e.target.checked) {
                                                setAssignTo('')
                                            } else {
                                                setTransferLeadOwnership(true)
                                            }
                                        }}
                                    />
                                }
                                label="Assign to others (manager / teammate)"
                            />
                        </Grid>
                        {isAssignVisible && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                        Who should handle this?
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={assignTo}
                                        onChange={(e) => setAssignTo(e.target.value)}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            <em>Select teammate</em>
                                        </MenuItem>
                                        {teamMembers.map((member) => (
                                            <MenuItem key={member._id} value={member._id}>
                                                {[member.firstName, member.lastName].filter(Boolean).join(' ') || member.name || member.email}
                                                {member.role ? ` · ${member.role}` : ''}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={transferLeadOwnership}
                                                onChange={(e) => setTransferLeadOwnership(e.target.checked)}
                                            />
                                        }
                                        label="Hand this lead to the assignee (they become the lead owner)"
                                    />
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Use this when booking a GMeet or handoff so the manager/authority owns the lead.
                                    </Typography>
                                </Grid>
                            </>
                        )}
                        {errorFollowup && (
                            <Grid item xs={12}>
                                <Typography color="error" variant="body2">
                                    {errorFollowup}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                    <div id="followup-datepicker-portal" />
                </DialogContent>
                <DialogActions sx={{ pr: 3, pb: 2 }}>
                    <Button
                        onClick={handleFollowupClose}
                        variant="outlined"
                        color="secondary"
                        disabled={loadingFollowupSubmit}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleFollowupSubmit}
                        variant="contained"
                        disabled={loadingFollowupSubmit}
                    >
                        {loadingFollowupSubmit ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default LeadActions