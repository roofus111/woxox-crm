
"use client"
import classnames from 'classnames'


import { useState, useEffect } from "react";
// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import io from 'socket.io-client';
// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { ToastContainer, toast } from "react-toastify";
import { useSession } from 'next-auth/react'
// Vars
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
  // {
  //   avatarImage: '/images/avatars/3.png',
  //   title: 'Bernard Woods',
  //   subtitle: 'You have new message from Bernard Woods',
  //   time: 'May 18, 8:26 AM',
  //   read: true
  // },
  // {
  //   avatarIcon: 'ri-bar-chart-line',
  //   avatarColor: 'info',
  //   title: 'Monthly report generated',
  //   subtitle: 'July month financial report is generated',
  //   time: 'Apr 24, 10:30 AM',
  //   read: true
  // },
  // {
  //   avatarText: 'MG',
  //   avatarColor: 'success',
  //   title: 'Application has been approved 🚀',
  //   subtitle: 'Your Meta Gadgets project application has been approved.',
  //   time: 'Feb 17, 12:17 PM',
  //   read: true
  // },
  // {
  //   avatarIcon: 'ri-mail-line',
  //   avatarColor: 'error',
  //   title: 'New message from Harry',
  //   subtitle: 'You have new message from Harry',
  //   time: 'Jan 6, 1:48 PM',
  //   read: true
  // }
]

const NavbarContent = () => {
  const { data: session } = useSession()
  useEffect(() => {
    const socket = io('http://localhost:8000', {
      // Reconnect automatically
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 10
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('register', session?.user?.id); // Send the user ID to register
    });

    socket.on('followUpAlert', function (data) {
      toast(`Reminder: ${data.message}`);
    });

    socket.on('welcome', function (data) {
      toast(data.message); // Display welcome message
    });

    // Handle socket connection error
    socket.on('connect_error', (err) => {
      console.error('Connection failed: ', err);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('followUpAlert');
      socket.off('welcome');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [session?.user?.id]); // Dependencies ensure effect runs only if userID changes


  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        {/* <NavSearch /> */}
      </div>
      <div className='flex items-center'>
        {/* <LanguageDropdown />
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} /> */}
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
