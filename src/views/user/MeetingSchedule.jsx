'use client'
import React, { useState, useEffect, useRef } from 'react'
import Grid from '@mui/material/Grid'
import axios from 'axios'
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
import { Box, MenuItem, FormControl, InputLabel, Select, Tooltip, Autocomplete, useTheme, useMediaQuery } from '@mui/material'
import { toast } from 'react-toastify'
import { useSearchParams } from 'next/navigation'
import ResizableDrawer from '../../../src/app/[lang]/(dashboard)/(private)/manager/leads/components/ResizableDrawer'

const Transactions = (props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  // UI states and dialog controls
  const [openDrawer, setOpenDrawer] = useState(false)
  const [open2, setOpen2] = useState(false)
  const [viewItem, setViewItem] = useState({})

  // Data & filtering states
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [assignee, setAssignee] = useState('')
  const [status, setStatus] = useState('')
  const [allTags, setAllTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)

  const loader = useRef(null)
  const inputRef = useRef(null)
  const searchParams = useSearchParams()
  const userId = searchParams.get('Userid')

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      'New': 'primary',
      'Contacted': 'info',
      'Interested': 'success',
      'Not Interested': 'error',
      'Converted': 'success',
      'Pending': 'warning',
      'In Progress': 'info',
      'Processing': 'info',
      'Won': 'success',
      'Lost': 'error',
      'Duplicate': 'default'
    }
    return statusColors[status] || 'default'
  }

  // Helper function to generate random background colors for avatars
  const getRandomAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#FFB6C1', '#87CEEB', '#F0E68C', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
    ]
    if (!name) return colors[0]
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  useEffect(() => {
    if (userId) {
      console.log("URL parameter detected")
      toast.error("UserID detected")
    }
  }, [userId])

  // Simple drawer handler - opens plain drawer
  const handleClickOpen = item => {
    setOpenDrawer(true)
    setViewItem(item)
  }

const handleCloseDrawer = () => {
  setOpenDrawer(false)
  // If you need to refetch, refetch all pages up to current page
  const refetchAllPages = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    const tagsString = selectedTags.map(tag => tag._id).join(',')
    let allLeads = []
    
    // Fetch all pages up to current page
    for (let p = 1; p <= page; p++) {
      const url =
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/search?page=${p}` +
        `&search=${encodeURIComponent(searchTerm)}` +
        `&status=${encodeURIComponent(status)}` +
        `&assignedTo=${encodeURIComponent(assignee)}` +
        (tagsString ? `&tags=${encodeURIComponent(tagsString)}` : '')

      try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        const newData = await response.json()
        let fetchedLeads = Array.isArray(newData.leads) ? newData.leads : []

        // Apply client-side filtering
        if (selectedTags.length > 0) {
          const selectedTagIds = selectedTags.map(tag => tag._id)
          fetchedLeads = fetchedLeads.filter(lead => {
            let leadTagIds = []
            if (lead.tags && Array.isArray(lead.tags)) {
              leadTagIds = lead.tags.map(t => (typeof t === 'object' ? t._id : t))
            }
            return selectedTagIds.every(id => leadTagIds.includes(id))
          })
        }

        allLeads = [...allLeads, ...fetchedLeads]
      } catch (err) {
        console.error("Error refetching leads: ", err)
        break
      }
    }
    
    setLeads(allLeads)
    setLoading(false)
  }
  
  refetchAllPages()
}

  // Fetch available tags for Autocomplete
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/alltags`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // Check if response is an array directly (as seen in Postman)
        if (Array.isArray(response.data)) {
          console.log("Fetched tags (array):", response.data)
          setAllTags(response.data)
        }
        // Or check if it's wrapped in a success property
        else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          console.log("Fetched tags (success.data):", response.data.data)
          setAllTags(response.data.data)
        }
        // If neither format works, log the issue
        else {
          console.error("Unexpected tags response format:", response.data)
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

  // Fetch items on page or search change
  useEffect(() => {
    fetchItems(page, searchTerm)
  }, [page])

  // Observer for infinite scroll
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

  // Debounce for searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchItems(1, searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Auto re-fetch when filters change (tags, assignee, status)
  useEffect(() => {
    setPage(1)
    fetchItems(1, searchTerm)
  }, [selectedTags, assignee, status])

  const handleObserver = (entities) => {
    const target = entities[0]
    if (target.isIntersecting && !loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const resetSearch = () => {
    setSearchTerm('')
    setSelectedTags([])
    setStatus('')
    setAssignee('')
    if (inputRef.current) inputRef.current.value = ''
    setPage(1)
    fetchItems(1, '')
  }

  // Fetch items from API with filters
  const fetchItems = async (page, searchTerm = '') => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    // Create a comma-separated string of tag IDs
    const tagsString = selectedTags.map(tag => tag._id).join(',')
    // Build the URL with a 'tags' query parameter as a comma-separated string.
    const url =
      `${process.env.NEXT_PUBLIC_API_URL}/api/leads/search?page=${page}` +
      `&search=${encodeURIComponent(searchTerm)}` +
      `&status=${encodeURIComponent(status)}` +
      `&assignedTo=${encodeURIComponent(assignee)}` +
      (tagsString ? `&tags=${encodeURIComponent(tagsString)}` : '')

    try {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const newData = await response.json()
      // Ensure newData.leads is an array; fallback to an empty array if not
      let fetchedLeads = Array.isArray(newData.leads) ? newData.leads : []

      // Client-side filtering to display only leads that contain all selected tags.
      if (selectedTags.length > 0) {
        const selectedTagIds = selectedTags.map(tag => tag._id)
        fetchedLeads = fetchedLeads.filter(lead => {
          // Get IDs of tags in the lead
          let leadTagIds = []
          if (lead.tags && Array.isArray(lead.tags)) {
            leadTagIds = lead.tags.map(t => (typeof t === 'object' ? t._id : t))
          }
          // Check that every selected tag is present in the lead's tags.
          return selectedTagIds.every(id => leadTagIds.includes(id))
        })
      }

      console.log(fetchedLeads)
      if (page === 1) {
        setLeads(fetchedLeads)
        setHasMore(fetchedLeads.length > 0)
      } else {
        setLeads(prev => [...prev, ...fetchedLeads])
        setHasMore(fetchedLeads.length > 0)
      }
    } catch (err) {
      console.error("Error fetching leads: ", err)
      toast.error("Failed to load leads. Please try again.")
    }
    setLoading(false)
  }

  // Helpers for tag display
  const getTagLabel = (tag) => (tag ? tag.name : '')
  const normalizeItemTags = (itemTags) => {
    if (!itemTags || !Array.isArray(itemTags)) return []
    return itemTags.map(t => {
      if (typeof t === 'object') return t
      const found = allTags.find(tag => tag._id === t)
      return found || { _id: t, name: t, color: '#ccc' }
    })
  }

  // Truncate text helper
  const truncateText = (text, maxLength = isMobile ? 15 : 25) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <>
      <Card>
        <Grid container spacing={isMobile ? 2 : 6} sx={{ margin: 0, width: '100%' }}>
          <Grid item xs={12} md={4} sx={{ paddingLeft: { xs: 2, md: 3 }, paddingTop: { xs: 2, md: 3 } }}>
            <Typography variant={isMobile ? "h6" : "h5"} component="h2">
              All Leads
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ paddingLeft: { xs: 2, md: 0 }, paddingRight: { xs: 2, md: 0 } }}>
            <Box display={'flex'} gap={1}>
              <TextField
                fullWidth
                label='Search'
                variant='standard'
                type='text'
                ref={inputRef}
                onChange={handleSearchChange}
                size={isMobile ? 'small' : 'medium'}
              />
              <Button 
                onClick={resetSearch} 
                color='primary' 
                variant='text'
                size={isMobile ? 'small' : 'medium'}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Reset
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ paddingLeft: { xs: 2, md: 0 }, paddingRight: { xs: 2, md: 3 } }}>
            <Button 
              onClick={() => setOpen2(true)}
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
              fullWidth={isMobile}
            >
              Filter
            </Button>
            {selectedTags.length > 0 && (
              <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                {selectedTags.map(tag => (
                  <Chip
                    key={tag._id}
                    size="small"
                    label={tag.name}
                    icon={<i className="ri-price-tag-3-fill" style={{ color: tag.color }}></i>}
                    onDelete={() => {
                      setSelectedTags(prev => prev.filter(t => t._id !== tag._id))
                    }}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
        <CardContent sx={{ padding: isMobile ? 1 : 3 }}>
          {Array.isArray(leads) && leads.map((item, index) => {
            const itemTags = normalizeItemTags(item.tags)
            return (
              <Box
                key={index}
                onClick={() => handleClickOpen(item)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 2 : 4,
                  padding: isMobile ? '8px' : '12px',
                  marginBottom: 1,
                  borderRadius: 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {item.avatarSrc ? (
                  <CustomAvatar 
                    variant='rounded' 
                    src={item.avatarSrc} 
                    size={isMobile ? 32 : 38} 
                  />
                ) : (
                  <Box
                    sx={{
                      width: isMobile ? 32 : 38,
                      height: isMobile ? 32 : 38,
                      borderRadius: 1,
                      backgroundColor: getRandomAvatarColor(item.name),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    {getInitials(item.name)}
                  </Box>
                )}
                
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    minWidth: 0, // Allow flex items to shrink
                  }}
                >
                  {/* Left side - Name, Tags, Campaign */}
                  <Box 
                    sx={{ 
                      flex: 1, 
                      minWidth: 0, // Allow shrinking
                      marginRight: isMobile ? 1 : 2 
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
                      <Tooltip title={item.name || ''} placement="top">
                        <Typography 
                          color='text.primary' 
                          sx={{ 
                            fontWeight: 'medium',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: isMobile ? '120px' : '200px'
                          }}
                        >
                          {truncateText(item.name)}
                        </Typography>
                      </Tooltip>
                      
                      {itemTags.length > 0 && !isMobile && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip
                            size='small'
                            icon={<i className="ri-price-tag-3-fill" style={{ color: itemTags[0].color }}></i>}
                            label={itemTags[0].name || ''}
                          />
                          {itemTags.length > 1 && (
                            <Tooltip title={
                              <Box>
                                {itemTags.slice(1).map((tag, idx) => (
                                  <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                    <i className="ri-price-tag-3-fill" style={{ marginRight: 4, color: tag.color }}></i>
                                    {tag.name}
                                  </Box>
                                ))}
                              </Box>
                            }>
                              <Chip
                                size='small'
                                icon={<i className="ri-price-tag-3-fill"></i>}
                                label={`+${itemTags.length - 1}`}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className='ri-flag-line' style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }} />
                      <Typography sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
                        {truncateText(item.campaign ? item.campaign : item.campaignid?.name, isMobile ? 20 : 30)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right side - Status and Assigned (Fixed position) */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end', 
                      gap: 0.5,
                      flexShrink: 0, // Prevent shrinking
                      minWidth: isMobile ? '80px' : '120px'
                    }}
                  >
                    <Chip 
                      label={item.status} 
                      color={getStatusColor(item.status)}
                      size='small' 
                      variant='filled'
                      sx={{
                        fontSize: isMobile ? '0.65rem' : '0.75rem',
                        height: isMobile ? '20px' : '24px',
                        fontWeight: 'medium'
                      }}
                    />
                    <Typography 
                      sx={{ 
                        fontSize: isMobile ? '0.65rem' : '0.75rem', 
                        color: 'rgba(0,0,0,0.6)',
                        textAlign: 'right',
                        lineHeight: 1.2
                      }}
                    >
                      {item.assignedTo 
                        ? truncateText(item.assignedTo?.firstName, isMobile ? 8 : 12)
                        : 'Unassigned'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )
          })}
          
          <div ref={loader} style={{ height: '50px', textAlign: 'center', padding: '20px' }}>
            {loading && <Typography color="text.secondary">Loading more...</Typography>}
            {!loading && leads.length === 0 && (
              <Typography color="text.secondary">No leads match your filters</Typography>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Modal */}
      <Dialog 
        maxWidth='sm' 
        fullWidth 
        open={open2} 
        onClose={() => setOpen2(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Filter the Leads</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Assigned</InputLabel>
                <Select
                  label='Assigned'
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  size="small"
                >
                  <MenuItem value=''><em>None</em></MenuItem>
                  {props.user && props.user.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label='Status'
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  size="small"
                >
                  <MenuItem value=''><em>None</em></MenuItem>
                  <MenuItem value={'New'}>New</MenuItem>
                  <MenuItem value={'Contacted'}>Contacted</MenuItem>
                  <MenuItem value={'Interested'}>Interested</MenuItem>
                  <MenuItem value={"Not Interested"}>Not Interested</MenuItem>
                  <MenuItem value={"Converted"}>Converted</MenuItem>
                  <MenuItem value={"Pending"}>Pending</MenuItem>
                  <MenuItem value={"In Progress"}>In Progress</MenuItem>
                  <MenuItem value={"Processing"}>Processing</MenuItem>
                  <MenuItem value={"Won"}>Won</MenuItem>
                  <MenuItem value={"Lost"}>Lost</MenuItem>
                  <MenuItem value={"Duplicate"}>Duplicate</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Autocomplete
              multiple
              id="tags-filter"
              options={allTags}
              value={selectedTags}
              onChange={(event, newValue) => setSelectedTags(newValue)}
              getOptionLabel={getTagLabel}
              loading={loadingTags}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Filter by Tags"
                  placeholder="Select Tags"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTags ? <span style={{ fontSize: '0.75rem' }}>Loading...</span> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <i className="ri-price-tag-3-fill" style={{ color: option.color || '#ccc', marginRight: '8px' }} />
                    {option.name}
                  </Box>
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpen2(false)} 
            variant='outlined' 
            size="small"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setOpen2(false)
              setPage(1)
              fetchItems(1, searchTerm)
            }} 
            variant='contained'
            size="small"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Plain Drawer - Simplified with basic lead info */}
      <ResizableDrawer
        open={openDrawer}
        onClose={handleCloseDrawer}
        defaultWidth={isMobile ? '100%' : 600}
        minWidth={isMobile ? '100%' : 800}
        maxWidth={isMobile ? '100%' : 1200}
        leadData={viewItem}
        leadId={viewItem._id}
      >
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
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
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCloseDrawer}
              fullWidth={isMobile}
            >
              Close
            </Button>
          </Box>
        </Box>
      </ResizableDrawer>
    </>
  )
}

export default Transactions