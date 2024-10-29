'use client'
import React, { useState, useEffect, useRef } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
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
import { Box, MenuItem, FormControl, InputLabel, Select, InputAdornment, IconButton } from '@mui/material'
const OverViewTab = dynamic(() => import('@views/apps/leadView/view/user-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/leadView/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/leadView/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/leadView/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/leadView/view/user-right/connections'))
import { toast } from 'react-toastify'
import { useSearchParams } from 'next/navigation'
const Transactions = (props) => {
  const [open, setOpen] = useState(false)
  const [viewItem, setViewItem] = useState({})

  const searchParams = useSearchParams();
  const userId = searchParams.get('Userid');

  useEffect(() => {
    if (userId) {
      fetchItemById(userId)
    }
  }, [userId]);


  const fetchItemById = async (userId) => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }
    const response = await fetch(
<<<<<<< HEAD
      `https://app.canbridge.in/api/leads/leads/${userId}`,
=======
      `http://13.127.160.185:8000/api/leads/leads/${userId}`,
>>>>>>> production
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const newData = await response.json()
    handleClickOpen(newData)
  }

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
<<<<<<< HEAD
      // `https://app.canbridge.in/api/leads/getleads/${props.campaign}`,
      `https://app.canbridge.in/api/leads/search?page=${page}&search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(status)}&assignedTo=${encodeURIComponent(assignee)}&campaign=${props.campaign}`,
=======
      // `http://13.127.160.185:8000/api/leads/getleads/${props.campaign}`,
      `http://13.127.160.185:8000/api/leads/search?page=${page}&search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(status)}&assignedTo=${encodeURIComponent(assignee)}&campaign=${props.campaign}`,
>>>>>>> production
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'default';
      case 'new':
        return 'info';
      case 'pending':
        return 'warning';
      case 'converted':
        return 'success';
      case 'lost':
        return 'error';
      default:
        return 'default';
    }
  };

  const [assignee, setAssignee] = useState('')
  const [status, setStatus] = useState('')
  return (
    <> <Typography variant="h5" padding={2}>{props.campaign ? `Leads by ${decodeURIComponent(props.campaign)} Campaign` : "All Leads"}</Typography>
      <Card style={{ marginBottom: '5px' }}> <Grid container spacing={2} padding={3}>
        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center">
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              type="text"
              ref={inputRef}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ri-search-2-line"></i>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={resetSearch} aria-label="Clear search">
                      <i className="ri-close-line"></i>
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <IconButton onClick={handleClickOpen2} color="primary">
              <i class="ri-filter-line"></i>
            </IconButton>
          </Box>
        </Grid>
        {/* <Grid item xs={12} md={4}>
            <Button variant="contained" color="primary" onClick={handleClickOpen2}>
              Filter
            </Button>
          </Grid> */}
      </Grid></Card>

      <Card>

        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {items && items.map((item, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                padding={2}
                bgcolor="#f0f0f0"
                borderRadius={2}
                onClick={() => handleClickOpen(item)}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                    cursor: 'pointer'
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <i class="ri-account-box-fill"></i>                  <Box display="flex" flexDirection="column">
                    <Typography variant="subtitle1" color="textPrimary">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.campaign}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={item.status} color={getStatusColor(item.status)} size="small" variant="contained" />
              </Box>
            ))}
            <div style={{ height: '50px' }}>
              {loading && <Typography>Loading more...</Typography>}
            </div>
          </Box>
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
