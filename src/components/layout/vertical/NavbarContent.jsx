"use client"
import classnames from 'classnames'
import Link from 'next/link'
import './style.css'
// import { Assignment, CalendarToday, Notes, Person, Phone, Email } from '@material-ui/icons';
import { useState, useEffect } from "react";
// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import ChatNavIcon from '@components/layout/shared/ChatNavIcon'
import UserDropdown from '@components/layout/shared/UserDropdown'
import { io } from 'socket.io-client';
// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { ToastContainer, toast } from "react-toastify";
import { useSession } from 'next-auth/react'
import { useSocket } from '@/hooks/useSocket';

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import { Avatar, DialogContent, Divider, Grid, Typography, Button, DialogActions } from '@mui/material';
// Vars
import DatePicker from "react-datepicker";
import zIndex from '@mui/material/styles/zIndex';
import CustomInput from '@/views/apps/leadView/view/user-left-overview/CustomInput';
import { getLocalizedUrl } from '@/utils/i18n'
import { useRouter } from 'next/navigation'
const shortcuts = [
  {
    url: '/apps/calendar',
    icon: 'ri-calendar-line',
    title: 'Calendar',
    subtitle: 'Appointments'
  },
  {
    url: '/apps/invoice/list',
    icon: 'ri-file-list-3-line',
    title: 'Invoice App',
    subtitle: 'Manage Accounts'
  },
  {
    url: '/apps/user/list',
    icon: 'ri-user-3-line',
    title: 'Users',
    subtitle: 'Manage Users'
  },
  {
    url: '/apps/roles',
    icon: 'ri-computer-line',
    title: 'Role Management',
    subtitle: 'Permissions'
  },
  {
    url: '/dashboards/crm',
    icon: 'ri-pie-chart-2-line',
    title: 'Dashboard',
    subtitle: 'User Dashboard'
  },
  {
    url: '/pages/account-settings',
    icon: 'ri-settings-4-line',
    title: 'Settings',
    subtitle: 'Account Settings'
  }
]

const notifications = [
  {
    avatarImage: '/images/avatars/1.png',
    title: 'Welcome to the Woxox CRM Beta Program🎉',
    subtitle: 'To improve the system, report issues - Admin',
    time: '1h ago',
    read: false
  },
  {
    title: 'New Patches',
    subtitle: 'Coming Sonn',
    time: '1m ago',
    read: false
  },
  {
    avatarImage: '/images/avatars/3.png',
    title: 'Bernard Woods',
    subtitle: 'You have new message from Bernard Woods',
    time: 'May 18, 8:26 AM',
    read: true
  },
  {
    avatarIcon: 'ri-bar-chart-line',
    avatarColor: 'info',
    title: 'Monthly report generated',
    subtitle: 'July month financial report is generated',
    time: 'Apr 24, 10:30 AM',
    read: true
  },
  {
    avatarText: 'MG',
    avatarColor: 'success',
    title: 'Application has been approved 🚀',
    subtitle: 'Your Meta Gadgets project application has been approved.',
    time: 'Feb 17, 12:17 PM',
    read: true
  },
  {
    avatarIcon: 'ri-mail-line',
    avatarColor: 'error',
    title: 'New message from Harry',
    subtitle: 'You have new message from Harry',
    time: 'Jan 6, 1:48 PM',
    read: true
  }
]

const NavbarContent = () => {
  const router = useRouter()
  const { alertData, open, setOpen } = useSocket();
  const { data: session } = useSession()
  const [openDialog, setOpenDialog] = useState(false); // Control dialog visibility
  const [selectedDate, setSelectedDate] = useState(null); // Store the selected date

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleReschedule = async () => {
    if (selectedDate) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${alertData.details._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ nextFollowUpDate: selectedDate })
        })
        if (response.ok) {
          toast.success("Successfully rescheduled")
        } else {
          toast.error("Something went wrong")
        }
      } catch (error) {
        toast.error("Oops.. Something Went Wrong")
      }
    }
    handleCloseDialog();
  };
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <Dialog aria-labelledby='simple-dialog-title' open={open} onClose={() => setOpen(false)}>
        <DialogTitle id='simple-dialog-title'>📅 Follow-Up Alert</DialogTitle>
        <DialogContent>
          {alertData && (
            <div>
              <Typography variant="h6" gutterBottom>
                {alertData.message}
              </Typography>

              <Divider style={{ margin: '16px 0' }} />

              {/* Displaying follow-up details in a Grid layout */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {/* <Assignment style={{ verticalAlign: 'middle', marginRight: 8 }} /> */}
                    <strong>Customer Name:</strong> {alertData.details.leadId.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {/* <CalendarToday style={{ verticalAlign: 'middle', marginRight: 8 }} /> */}
                    <strong>Status:</strong> {alertData.details.status}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {/* <Notes style={{ verticalAlign: 'middle', marginRight: 8 }} /> */}
                    <strong>Notes:</strong> {alertData.details.notes}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {/* <CalendarToday style={{ verticalAlign: 'middle', marginRight: 8 }} /> */}
                    <strong>Created At:</strong> {new Date(alertData.details.followUpDate).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider style={{ margin: '16px 0' }} />

              {/* Displaying assigned person's info */}
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar>
                    {alertData?.details?.assignedTo?.firstName?.[0] || "?"}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">
                    {`${alertData?.details?.assignedTo?.firstName || "Unknown"} ${alertData?.details?.assignedTo?.lastName || ""}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {alertData?.details?.assignedTo?.email || "No email available"}
                  </Typography>
                </Grid>
                <Grid item>
                  <> <Button variant="outlined" color="primary" onClick={handleOpenDialog}>
                    Reschedule
                  </Button> <space />
                    <Button variant='contained' type="button" onClick={() => router.push(getLocalizedUrl(`/${session?.user?.role == 'admin' ? 'manager' : session?.user?.role}/followup`, 'en'))}>
                      View
                    </Button> </>

                </Grid>

                {/* Reschedule Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                  <DialogTitle>Reschedule Task</DialogTitle>
                  <DialogContent >
                    <br />
                    <DatePicker
                      // style={{ zIndex: '9999' }}
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      placeholderText="Select a new date and time"
                      className="custom-datepicker"
                      portalId="datepicker-portal" // Render in portal
                      popperClassName="custom-datepicker-popper" // Custom class for dropdown
                      customInput={<CustomInput label='Date & Time' />}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={handleReschedule} color="primary" disabled={!selectedDate}>
                      Confirm
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            </div>
          )}
        </DialogContent>
      </Dialog>


      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        {/* <NavSearch /> */}
      </div>
      <div className='flex items-center'>
        {/* <LanguageDropdown /> */}
        <ModeDropdown />
        {/* <ShortcutsDropdown shortcuts={shortcuts} /> */}
        <ChatNavIcon />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
