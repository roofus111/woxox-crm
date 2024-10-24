'use client'
import React, { useState, useEffect, useRef } from 'react'
import Grid from '@mui/material/Grid'
import axios from 'axios'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import OptionMenu from '@core/components/option-menu'
import dynamic from 'next/dynamic'
import CustomAvatar from '@core/components/mui/Avatar'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import UserLeftOverview from '@views/apps/leadView/view/user-left-overview'
import UserRight from '@views/apps/leadView/view/user-right'
import { DataProvider } from '@/contexts/DataContext'
import { Box, Menu, MenuItem, FormControl, InputLabel, Select } from '@mui/material'
import debounce from 'lodash.debounce'
const OverViewTab = dynamic(() => import('@views/apps/leadView/view/user-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/leadView/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/leadView/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/leadView/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/leadView/view/user-right/connections'))

const Transactions = (props) => {
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState({})
  console.log(props.campaign);

  const handleClickOpen = item => {
    setOpen(true)
    setViewItem(item)
  }

  const tabContentList = data => ({
    overview: <OverViewTab props={data} />,
    security: <SecurityTab props={data} />,
    // 'billing-plans': <BillingPlans data={data} />,
    notifications: <NotificationsTab props={data} />,
    connections: <ConnectionsTab />
  })

  const handleClose = () => {
    setOpen(false)
    fetchItems(1, searchTerm)
  }

  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const loader = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchItems(page, searchTerm)
  }, [page])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    })

    if (loader.current) {
      observer.observe(loader.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('triggered')
      setPage(1) // Reset to page 1 to handle new search terms correctly
      fetchItems(1, searchTerm)
    }, 300) // 300ms debounce time

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleObserver = entities => {
    const target = entities[0]
    if (target.isIntersecting) {
      setPage(prev => prev + 1)
    }
  }

  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
  }

  const resetSearch = () => {
    setSearchTerm('')
    inputRef.current.value = '' // Clear the input field
    setPage(1)
    fetchItems(1, '') // Fetch without any search term
  }

  const fetchItems = async (page, searchTerm = '',) => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }

    // const qualification = encodeURIComponent(props.campaign)
    const response = await fetch(
      // `http://localhost:8000/api/leads/getleads/${props.campaign}`,
      `http://localhost:8000/api/leads/search?page=${page}&search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(status)}&assignedTo=${encodeURIComponent(assignee)}&campaign=${props.campaign}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const newData = await response.json()
    console.log(newData)

    if (page === 1) {
      setLoading(false)
      setItems(newData.leads) // Reset items if it's a new search or reset
    } else {
      setLoading(false)
      setItems(prev => [...prev, ...newData.leads]) // Append items if it's just lazy loading more
    }
  }


  const callHandler = (x) => {
    console.log('triggeresd', x)
  }

  const [open2, setOpen2] = useState(false)

  const handleClickOpen2 = () => {
    setOpen2(true)
  }

  const handleClose2 = () => {
    setOpen2(false)
  }
  const handleFilter = () => {
    setPage(1)
    fetchItems(page, searchTerm)
  }

  const [assignee, setAssignee] = useState('')
  const [status, setStatus] = useState('')
  return (
    <>
      <Card>
        <Grid container spacing={6} marginLeft={3} marginTop={3} marginRight={3}>
          <Grid xs={12} item md={4}>
            <h2>All Leads</h2>
          </Grid>
          <Grid item xs={10} md={4}>
            <Box display={'flex'}>
              <TextField
                fullWidth
                label='Search'
                variant='standard'
                type='text'
                ref={inputRef}
                onChange={handleSearchChange}
              />
              <Button onClick={resetSearch} color='primary' variant='standard'>
                Reset
              </Button>{' '}
            </Box>
          </Grid>
          <Grid xs={12} item md={4}>
            <Button onClick={handleClickOpen2}> Filter</Button>
          </Grid>
        </Grid>
        <CardContent className='flex flex-col gap-3'>
          {items &&
            items.map((item, index) => (
              <Box
                key={index}
                className='flex items-center gap-4'
                onClick={() => handleClickOpen(item)}
                sx={{
                  transition: 'padding 0.3s linear, backgroundColor 0.3s linear',
                  '&:hover': {
                    padding: '9px',
                    backgroundColor: '#f7f7f7', // Darken background on hover
                    transitionTimingFunction: 'linear',
                    transitionDuration: '0.3s', // Corrected property name and value format
                    cursor: 'pointer' // Indicates a clickable element
                  }
                }}
              >
                <CustomAvatar variant='rounded' src={item.avatarSrc} size={38} />
                <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                  <div className='flex flex-col gap-0.5'>
                    <Typography color='text.primary' className='font-medium'>
                      {item.name}
                    </Typography>
                    <div className='flex items-center gap-2'>
                      <i className='ri-flag-line text-base text-textSecondary' />
                      <Typography variant='body2'>{item.campaign}</Typography>
                    </div>
                  </div>
                  <Chip label={item.status} color={item.chipColor} size='small' variant='tonal' />
                </div>
              </Box>
            ))}

          <div ref={loader} style={{ height: '50px' }}>
            {loading ? <p> Loading more... </p> : null}
          </div>
        </CardContent>
      </Card>
      {/* Filter Modal */}
      <Dialog maxWidth='xs' fullWidth open={open2} onClose={handleClose2}>
        <DialogTitle>Filter the Leads</DialogTitle>
        <DialogContent className='!pbs-2'>
          <Box component='form' className='flex gap-4'>
            <FormControl className='mie-4 mbe-4' fullWidth>
              <InputLabel id='demo-dialog-select-label'>Assigned</InputLabel>
              <Select
                label='Assigned'
                labelId='demo-dialog-select-label'
                id='demo-dialog-select'
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {props.user.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor='outlined-age-native-basic'>Status</InputLabel>
              <Select label='Status' labelId='demo-dialog-select-label' id='demo-dialog-select' value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'New'}>New</MenuItem>
                <MenuItem value={'Contacted'}>Contacted</MenuItem>
                <MenuItem value={'Interested'}>Interested</MenuItem>
                <MenuItem value={"Not Interested"}>Not Interested</MenuItem>
                <MenuItem value={"Converted"}>Converted</MenuItem>
                <MenuItem value={"Pending"}>Pending</MenuItem>
                <MenuItem value={"In Progress"}>In Progress</MenuItem>
                <MenuItem value={"Won"}>Won</MenuItem>
                <MenuItem value={"Lost"}>Lost</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose2} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleFilter} variant='contained'>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      {/* Lead Details */}
      <Dialog fullScreen open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'><Button onClick={handleClose}><i className="ri-arrow-left-s-line" /> </Button>Lead Details</DialogTitle>
        <DialogContent>


          <Grid container spacing={6}>
            <DataProvider>
              <Grid item xs={12} lg={4} md={5}>
                <UserLeftOverview data={viewItem} />
              </Grid>
              <Grid item xs={12} lg={8} md={7}>
                <UserRight tabContentList={tabContentList({ viewItem })} />
              </Grid>
            </DataProvider>
          </Grid>
        </DialogContent>
        {/* <DialogActions className='p-3'>
          <Button onClick={handleClose} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button onClick={() => callHandler(viewItem)} variant='contained' color='success'>
            Call
          </Button>
        </DialogActions> */}
      </Dialog >
    </>
  )
}

export default Transactions
