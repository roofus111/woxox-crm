'use client'
import React, { useState, useEffect, useRef } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CustomAvatar from '@core/components/mui/Avatar'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { Box, MenuItem, FormControl, InputLabel, Select, InputAdornment, IconButton } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import { toast } from 'react-toastify'
import { useSearchParams } from 'next/navigation'
import Tooltip from '@mui/material/Tooltip'
import ResizableDrawer from '../../../src/app/[lang]/(dashboard)/(private)/manager/leads/components/ResizableDrawer'

const Transactions = (props) => {
  const [viewItem, setViewItem] = useState({})
  const [openDrawer, setOpenDrawer] = useState(false)

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
      `${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const newData = await response.json()
    handleClickOpen(newData)
  }

  const handleClickOpen = item => {
    setOpenDrawer(true)
    setViewItem(item)
  }

  const handleCloseDrawer = () => {
    setOpenDrawer(false)
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


  const [sortOrder, setSortOrder] = useState(1)

  const [insights, setInsights] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    interestedLeads: 0,
    convertedLeads: 0,
    notInterestedLeads: 0,
    pendingLeads: 0,
    inProgressLeads: 0,
    wonLeads: 0,
    lostLeads: 0
  })

  const [selectedTags, setSelectedTags] = useState([])
  const [allTags, setAllTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/alltags`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await response.json()

        if (Array.isArray(data)) {
          setAllTags(data)
        } else if (data && data.success && Array.isArray(data.data)) {
          setAllTags(data.data)
        } else {
          console.error("Unexpected tags response format:", data)
          toast.error("Unexpected tags format received")
        }
      } catch (err) {
        console.error("Error fetching tags", err)
        toast.error("Failed to load tags. Please try again.")
      }
      setLoadingTags(false)
    }
    fetchTags()
  }, [])

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
      setPage(1) // Reset to page 1 to handle new search terms correctly
      fetchItems(1, searchTerm)
    }, 300) // 300ms debounce time

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleObserver = entities => {
    console.log("triggered");

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
    setSelectedTags([])
    inputRef.current.value = ''
    setPage(1)
    fetchItems(1, '')
  }

  const fetchItems = async (page, searchTerm = '') => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }

    // Create tags string for query
    const tagsString = selectedTags.map(tag => tag._id).join(',')

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/leads/search?page=${page}&search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(status)}&assignedTo=${encodeURIComponent(assignee)}&campaign=${props.campaign}&sort=updatedAt&order=${sortOrder}${tagsString ? `&tags=${encodeURIComponent(tagsString)}` : ''}`,
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

    setInsights(newData.insights)
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
    handleClose2()
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

  const handleSort = (event) => {
    setSortField(event.target.value)
    setPage(1)
    fetchItems(1, searchTerm)
  }

  const handleSortOrder = () => {
    setSortOrder(prev => prev * -1) // Toggle between 1 and -1
    setPage(1)
    fetchItems(1, searchTerm)
  }

  const InsightCard = ({ title, count, status, color }) => (
    <Card
      onClick={() => {
        setStatus(status)
        setPage(1)
        fetchItems(1, searchTerm)
      }}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        },
        backgroundColor: status === status ? `${color}10` : 'background.paper',
        borderLeft: `4px solid ${color}`
      }}
    >
      <CardContent>
        <Typography variant="h6" color="text.secondary" fontSize={14}>
          {title}
        </Typography>
        <Typography variant="h4" color="text.primary" mt={1}>
          {count}
        </Typography>
      </CardContent>
    </Card>
  )

  const getTagLabel = (tag) => (tag ? tag.name : '')
  const normalizeItemTags = (itemTags) => {
    if (!itemTags || !Array.isArray(itemTags)) return []
    return itemTags.map(t => {
      if (typeof t === 'object') return t
      const found = allTags.find(tag => tag._id === t)
      return found || { _id: t, name: t, color: '#ccc' }
    })
  }

  return (
    <>
      <Typography variant="h5" padding={2}>Lead Manager</Typography>

      {/* Insights Section */}
      {/* <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Total Leads"
              count={insights.totalLeads}
              color="#666CFF"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="New"
              count={insights.newLeads}
              status="New"
              color="#0080FF"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Contacted"
              count={insights.contactedLeads}
              status="Contacted"
              color="#9747FF"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Interested"
              count={insights.interestedLeads}
              status="Interested"
              color="#00C853"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Not Interested"
              count={insights.notInterestedLeads}
              status="Not Interested"
              color="#FF4C51"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Converted"
              count={insights.convertedLeads}
              status="Converted"
              color="#00BFA5"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Pending"
              count={insights.pendingLeads}
              status="Pending"
              color="#FFA000"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="In Progress"
              count={insights.inProgressLeads}
              status="In Progress"
              color="#1E88E5"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Won"
              count={insights.wonLeads}
              status="Won"
              color="#00C853"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <InsightCard
              title="Lost"
              count={insights.lostLeads}
              status="Lost"
              color="#FF4C51"
            />
          </Grid>
        </Grid>
      </Box> */}

      <Grid container spacing={2} padding={3}>
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

            <IconButton onClick={handleSortOrder} color="primary">
              <i className={`ri-sort-${sortOrder === 1 ? 'asc' : 'desc'}`}></i>
            </IconButton>
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
      </Grid>


      <CardContent className='flex flex-col gap-3'>
        {items &&
          items.map((item, index) => {
            // Convert item.tags (an array of tag IDs or objects) to an array of tag names.
            const tagNames = item.tags && Array.isArray(item.tags)
              ? item.tags.map(t => {
                if (typeof t === 'object') return t.name
                const found = allTags.find(tag => tag._id === t)
                return found ? found.name : t
              })
              : []
            return (
              <Box
                key={index}
                className='flex items-center gap-4'
                onClick={() => handleClickOpen(item)}
                sx={{
                  textAlign: 'left',
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
                    {/* Name and Tags inline */}
                    <div className='flex items-center gap-2'>
                      <Typography color='text.primary' className='font-medium'>
                        {item.name} {item.reshared && (
                          <Tooltip title="Shared Lead">
                            <i className='ri-user-shared-2-line text-base text-textSecondary' />
                          </Tooltip>
                        )}
                      </Typography>
                      {item.tags && item.tags.length > 0 && (
                        <div className='flex gap-1'>
                          <Chip
                            size='small'
                            icon={<i className="ri-price-tag-3-fill" style={{ color: item.tags[0].color }}></i>}
                            label={tagNames[0] || ''}
                          />
                          {item.tags.length > 1 && (
                            <Tooltip title={
                              <span>
                                {item.tags.map((tag, index) => (
                                  <span key={index} style={{ display: "inline-flex", alignItems: "center", marginRight: 4 }}>
                                    <i className="ri-price-tag-3-fill" style={{ marginRight: 4, color: tag.color }}></i>
                                    {tag.name}
                                  </span>
                                ))}
                              </span>
                            }>
                              <Chip
                                size='small'
                                icon={<i className="ri-price-tag-3-fill"></i>}
                                label={`+${tagNames.length - 1}`}
                              />
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Campaign below name */}
                    <div className='flex items-center gap-2'>
                      <i className='ri-flag-line text-base text-textSecondary' />
                      <Typography className='text-xs'>
                        {item.campaign ? item.campaign : item.campaignid?.name}
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-2'>
                    <Chip label={item.status} color={item.chipColor} size='small' variant='tonal' />
                    <p className='text-xs'>{item.assignedTo ? 'Assigned To: ' + item.assignedTo?.firstName : null}</p>
                  </div>
                </div>
              </Box>
            )
          })}

        <div ref={loader} style={{ height: '50px' }}>
          {loading ? <p> Loading more... </p> : null}
        </div>
      </CardContent>

      {/* Filter Modal */}
      <Dialog maxWidth='xs' fullWidth open={open2} onClose={handleClose2}>
        <DialogTitle>Filter the Leads</DialogTitle>
        <DialogContent className='!pbs-2'>
          <Box component='form' className='flex flex-col gap-4'>
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
            <FormControl fullWidth>
              <Autocomplete
                multiple
                id="tags-filter"
                options={allTags}
                value={selectedTags}
                onChange={(event, newValue) => setSelectedTags(newValue)}
                getOptionLabel={getTagLabel}
                loading={loadingTags}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Filter by Tags"
                    placeholder="Select Tags"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTags ? <span>Loading...</span> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="ri-price-tag-3-fill" style={{ color: option.color || '#ccc', marginRight: '8px' }} />
                      {option.name}
                    </div>
                  </li>
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      key={option._id}
                      label={option.name}
                      {...getTagProps({ index })}
                      icon={<i className="ri-price-tag-3-fill" style={{ color: option.color }}></i>}
                      size="small"
                    />
                  ))
                }
              />
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
      <ResizableDrawer
        open={openDrawer}
        onClose={handleCloseDrawer}
        defaultWidth={600}
        minWidth={800}
        maxWidth={1200}
        leadData={viewItem}
        leadId={viewItem._id}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Lead Details
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {viewItem.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Status:</strong> {viewItem.status}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Campaign:</strong> {viewItem.campaign ? viewItem.campaign : viewItem.campaignid?.name}
          </Typography>
          {viewItem.assignedTo && (
            <Typography variant="body1" gutterBottom>
              <strong>Assigned To:</strong> {viewItem.assignedTo.firstName}
            </Typography>
          )}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" onClick={handleCloseDrawer}>
              Close
            </Button>
          </Box>
        </Box>
      </ResizableDrawer>
    </>
  )
}

export default Transactions
