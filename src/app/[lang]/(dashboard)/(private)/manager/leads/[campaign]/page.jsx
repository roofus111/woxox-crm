'use client'
import { useParams } from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react';

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    TextField,
    Select,
    MenuItem,
    CircularProgress,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    DialogActions,
    ListItemText
} from '@mui/material'
import ResizableDrawer from '../components/ResizableDrawer'
import { toast } from 'react-toastify'
import axios from 'axios'
import { getLocalizedUrl } from '@/utils/i18n'
import { useRouter } from 'next/navigation'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
    PaperProps: {
        style: {
            inlineSize: 250,
            maxBlockSize: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
        }
    }
}
const DynamicPage = () => {
    const params = useParams()
    const router = useRouter()
    const campaignId = params.campaign
    const [data, setData] = useState([])
    const [selected, setSelected] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({ field: '', direction: 'asc' })
    const [filterStatus, setFilterStatus] = useState('')
    const [campaignData, setCampaignData] = useState({})
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedLead, setSelectedLead] = useState(null)
    const [leadData, setLeadData] = useState(null)
    const [loadingLead, setLoadingLead] = useState(false)
    const [drawerRefreshTrigger, setDrawerRefreshTrigger] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Initialize pagination with default values
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        perPage: 100,
        hasMore: false
    })
    const [perPageOption, setPerPageOption] = useState(100)
    const [goToPage, setGoToPage] = useState('')

    const fetch = async (page = 1, perPage = perPageOption) => {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token || !process.env.NEXT_PUBLIC_API_URL) {
            toast.error('Missing configuration')
            setLoading(false)
            return
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/leadsbycampaign/${campaignId}`, {
                params: {
                    page,
                    perPage,
                    status: filterStatus,
                    search: searchTerm
                },
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.status === 200) {
                setData(response.data.data.leads)
                setPagination(response.data.data.pagination)
                if (response.data.data.leads.length > 0) {
                    setCampaignData(response.data.data.leads[0].campaignid)
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch campaign data.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
    fetch(1);
    }, [campaignId, filterStatus, searchTerm, drawerRefreshTrigger]);

    useEffect(() => {
    fetch(pagination.currentPage || 1);
    }, [campaignId, filterStatus, searchTerm, refreshKey]);

    const triggerRefresh = () => {
        fetch(pagination.currentPage || 1);
    }

    const handleSelect = id => {
        setSelected(prevSelected => {
            const newSelected = new Set(prevSelected)
            if (newSelected.has(id)) {
                newSelected.delete(id)
            } else {
                newSelected.add(id)
            }
            return newSelected
        })
    }

    const handleSelectAll = checked => {
        if (checked) {
            setSelected(new Set(filteredData.map(lead => lead._id)))
        } else {
            setSelected(new Set())
        }
    }

    const isSelected = id => selected.has(id)

    const handleSearch = e => {
        setSearchTerm(e.target.value.toLowerCase())
    }

    const handleSort = field => {
        const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        setSortConfig({ field, direction })

        const sortedData = [...data].sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1
            return 0
        })
        setData(sortedData)
    }

    const handleFilter = e => {
        setFilterStatus(e.target.value)
    }
    const [assign, setAssign] = useState('')
    const handleAssignee = e => {
        setAssign(e.target.value)
    }
    const handleView = id => {
        // Replace with the actual logic for handling the view action
        toast.info(`Viewing details for lead ID: ${id}`)
    }

    const filteredData = data?.length ? data
        .filter(lead =>
        (lead.name?.toLowerCase().includes(searchTerm) ||
            lead.email?.toLowerCase().includes(searchTerm))
        )
        .filter(lead => (filterStatus ? lead.status === filterStatus : true))
        : [];

    const [personName, setPersonName] = useState([])
    const [personNameNative, setPersonNameNative] = useState([])

    const handleChange = event => {
        setPersonName(event.target.value)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem('token')
            console.log(personName)

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/assign/${campaignId}`,
                personName, // Ensure the body structure matches expected API input
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            // Check if the request was successful
            // if (response.status !== 200) {
            //     toast.error(response.data.message || 'Unknown error occurred.')
            //     return // Stop further execution in case of HTTP error
            // }

            toast.success(response.data)
            handleClose()
            fetch()
        } catch (error) {
            // Handle errors from Axios, including network errors and server errors
            if (error.response) {
                // Server responded with a status code outside the range of 2xx
                toast.error(error.response.data.message || 'Error occurred.')
            } else if (error.request) {
                // Request was made, but no response was received
                toast.error('No response from server.')
            } else {
                // Something else went wrong in setting up the request
                toast.error(error.message || 'An unexpected error occurred.')
            }
        }
    }

    const fetchLeadDetails = async (leadId) => {
        console.log('=== fetchLeadDetails called ===');
        console.log('Lead ID:', leadId);

        setLoadingLead(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('No authorization token found.')
                return
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log('Full API response:', response.data);

            // Fix: Extract the lead data from the nested structure
            if (response.data && response.data.lead) {
                console.log('Setting leadData to:', response.data.lead);
                setLeadData(response.data.lead);
            } else {
                console.log('Setting leadData to full response:', response.data);
                setLeadData(response.data);
            }

        } catch (error) {
            console.error('Failed to fetch lead details:', error)
            toast.error('Failed to load lead details')
        } finally {
            setLoadingLead(false)
        }
    }

    const handleViewClick = async (lead) => {
        setSelectedLead(lead)
        setDrawerOpen(true)
        await fetchLeadDetails(lead._id)
    }

    const handleDrawerClose = () => {
        setDrawerOpen(false)
        setSelectedLead(null)
        setLeadData(null)
    }

    const handleSubmit2 = async (e) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem('token')


            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/assign-multiple/${assign}`,
                { leadIds: Array.from(selected) }, // Convert Set to Array here
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            // Check if the request was successful
            if (response.status !== 200) {
                toast.error(response.data.message || 'Unknown error occurred.')
                return // Stop further execution in case of HTTP error
            }
            toast.success(response.data)
            handleClose2()
            fetch()
        } catch (error) {
            // Handle errors from Axios, including network errors and server errors
            if (error.response) {
                // Server responded with a status code outside the range of 2xx
                toast.error(error.response.data.message || 'Error occurred.')
            } else if (error.request) {
                // Request was made, but no response was received
                toast.error('No response from server.')
            } else {
                // Something else went wrong in setting up the request
                toast.error(error.message || 'An unexpected error occurred.')
            }
        }
    }
    const [open, setOpen] = useState(false)
    const handleClose = () => setOpen(false)
    const handleClickOpen = () => setOpen(true)

    const [open2, setOpen2] = useState(false)
    const handleClose2 = () => setOpen2(false)
    const handleClickOpen2 = () => setOpen2(true)

    const [assigner, setAssigner] = useState([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                setAssigner(response.data) // Update data if component is still mounted
                console.log(response.data)
            })
            .catch(error => {
                console.error('Failed to fetch data:', error)
            })
    }, [])

    const deleteLead = async (lead) => {
        console.log(lead);
        try {
            const token = localStorage.getItem('token')
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/deleteMultiLeads`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add Authorization header
                },
                data: { ids: lead }, // Pass IDs in the request body
            });
            console.log('Delete response:', response.data);
            toast('Items deleted successfully');
            fetch()
            // Optionally update the UI here
        } catch (error) {
            console.error('Error deleting items:', error);
            toast('Failed to delete items');
        }
    }
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef(null);
    

    const handleMouseDown = (id) => {
        setIsDragging(true);
        dragStartRef.current = id;
        handleSelect(id);
    };

    const handleMouseEnter = (id) => {
        if (isDragging) {
            handleSelect(id);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
    };

    useEffect(() => {
        window.addEventListener("mouseup", handleMouseUp);
        return () => window.removeEventListener("mouseup", handleMouseUp);
    }, []);

    const selectedCount = selected.size

    // Add pagination handler
    const handlePageChange = (page) => {
        fetch(page)
    }

    const handlePerPageChange = (e) => {
        const newPerPage = parseInt(e.target.value)
        setPerPageOption(newPerPage)
        fetch(1, newPerPage)
    }

    const handleGoToPageChange = (e) => {
        setGoToPage(e.target.value)
    }

    const handleGoToPageSubmit = (e) => {
        e.preventDefault()
        const pageNumber = parseInt(goToPage)
        if (pageNumber && pageNumber > 0 && pageNumber <= pagination.totalPages) {
            fetch(pageNumber)
            setGoToPage('')
        } else {
            toast.error(`Please enter a valid page number between 1 and ${pagination.totalPages}`)
        }
    }

    useEffect(() => {
        if (drawerOpen) {
            console.log('Drawer opened with data:', {
                selectedLead,
                leadData,
                leadId: selectedLead?._id,
                profileImage: leadData?.profileImage,
                userName: leadData?.name || selectedLead?.name || "Unknown Lead"
            });
        }
    }, [drawerOpen, selectedLead, leadData]);

    return (
        <>
            <Box sx={{ padding: 4 }}>
                <h1>Campaign: {campaignData?.name || 'Loading...'}</h1>
                <p>{campaignData?.description || ''}</p>
                <br />
                <Box sx={{ marginBottom: 2, display: 'flex', gap: 2 }}>
                    <TextField label='Search' variant='outlined' value={searchTerm} onChange={handleSearch} fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} onChange={handleFilter} label='Status'>
                            <MenuItem value=''>All</MenuItem>
                            <MenuItem value='New'>New</MenuItem>``
                            <MenuItem value='Contacted'>Contacted</MenuItem>
                            <MenuItem value='Interested'>Interested</MenuItem>
                            <MenuItem value='Not Interested'>Not Interested</MenuItem>``
                            <MenuItem value='Converted'>Converted</MenuItem>
                        </Select>
                    </FormControl>
                    {selectedCount === 0 ? (
                        <Button onClick={handleClickOpen}>Assign Unassigned</Button>
                    ) : (
                        <>
                            <Button onClick={() => deleteLead(Array.from(selected))} style={{ color: 'red' }}>Delete</Button>
                            <Button onClick={handleClickOpen2}>Assign Selected {selectedCount} Leads</Button>
                        </>
                    )}
                </Box>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1000 }}>
                                <TableRow>
                                    <TableCell>
                                        <Checkbox
                                            indeterminate={selectedCount > 0 && selectedCount < filteredData.length}
                                            checked={selectedCount === filteredData.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)} />
                                    </TableCell>
                                    <TableCell onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                                        Date {sortConfig.field === 'createdAt' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                    </TableCell>
                                    <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                        Name {sortConfig.field === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                    </TableCell>
                                    <TableCell onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                        Email {sortConfig.field === 'email' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                    </TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Assigned To</TableCell>
                                    <TableCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                        Status {sortConfig.field === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                    </TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map(lead => (
                                    <TableRow
                                        key={lead._id}
                                        selected={isSelected(lead._id)}
                                        // onMouseDown={() => handleMouseDown(lead._id)}
                                        // onMouseEnter={() => handleMouseEnter(lead._id)}
                                        sx={{ cursor: 'pointer', backgroundColor: isSelected(lead._id) ? '#f0f8ff' : 'inherit' }}
                                    >
                                        <TableCell onMouseDown={() => handleMouseDown(lead._id)}
                                            onMouseEnter={() => handleMouseEnter(lead._id)}>
                                            <Checkbox checked={isSelected(lead._id)} />
                                        </TableCell>
                                        <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{lead.name}</TableCell>
                                        <TableCell>{lead.email}</TableCell>
                                        <TableCell>{lead.phone}</TableCell>
                                        <TableCell>
                                            {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '---'}
                                        </TableCell>
                                        <TableCell>{lead.status}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant='contained'
                                                color='primary'
                                                onClick={() => handleViewClick(lead)}
                                                disabled={loadingLead && selectedLead?._id === lead._id}
                                            >
                                                {loadingLead && selectedLead?._id === lead._id ? (
                                                    <CircularProgress size={16} color="inherit" />
                                                ) : (
                                                    'View'
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                )}

                {/* Replace the pagination controls with enhanced version */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                    <Button
                        disabled={!pagination || pagination.currentPage === 1}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                        Previous
                    </Button>

                    <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                        Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
                    </Typography>

                    <Button
                        disabled={!pagination || !pagination.hasMore}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                        Next
                    </Button>

                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel id="per-page-select-label">Per Page</InputLabel>
                        <Select
                            labelId="per-page-select-label"
                            id="per-page-select"
                            value={perPageOption}
                            label="Per Page"
                            onChange={handlePerPageChange}
                            size="small"
                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                            <MenuItem value={100}>100</MenuItem>
                            <MenuItem value={250}>250</MenuItem>
                        </Select>
                    </FormControl>

                    <form onSubmit={handleGoToPageSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TextField
                            label="Go to page"
                            variant="outlined"
                            size="small"
                            value={goToPage}
                            onChange={handleGoToPageChange}
                            sx={{ width: '100px' }}
                            type="number"
                            inputProps={{ min: 1, max: pagination?.totalPages || 1 }}
                        />
                        <Button type="submit" variant="contained" size="small">Go</Button>
                    </form>
                </Box>

                {/* D */}
                <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
                    <DialogTitle id='form-dialog-title'>Assign leads</DialogTitle>
                    <DialogContent>
                        <div>
                            <Typography className='mbe-2 font-medium' color='text.primary'>
                                Select counsellors
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel id='demo-multiple-checkbox-label'>Tag</InputLabel>
                                <Select
                                    multiple
                                    label='Tag'
                                    value={personName}
                                    MenuProps={MenuProps}
                                    onChange={handleChange}
                                    id='demo-multiple-checkbox'
                                    labelId='demo-multiple-checkbox-label'
                                    renderValue={personName => `${personName.length} people selected`}
                                >
                                    {assigner.map(name => (
                                        <MenuItem key={name._id} value={name}>
                                            <Checkbox checked={personName.indexOf(name) > -1} />
                                            <ListItemText color='black' primary={name.firstName + " " + name.lastName} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} variant='outlined' color='secondary'>
                            Disagree
                        </Button>
                        <Button onClick={handleSubmit} variant='contained'>
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog><Dialog open={open2} onClose={handleClose2} aria-labelledby='form-dialog-title'>
                    <DialogTitle id='form-dialog-title'>Assign leads</DialogTitle>
                    <DialogContent>
                        <div>
                            <Typography className='mbe-2 font-medium' color='text.primary'>
                                Select counsellors
                            </Typography>
                            <FormControl fullWidth>
                                <Select value={assign} onChange={handleAssignee}>
                                    {assigner.map((item) => {
                                        return <MenuItem value={item._id}>{item.firstName + " " + item.lastName}</MenuItem>;
                                    })}
                                </Select>
                            </FormControl>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose2} variant='outlined' color='secondary'>
                            Disagree
                        </Button>
                        <Button onClick={handleSubmit2} variant='contained'>
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box >
            <ResizableDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                title="Lead Details"
                leadData={leadData}
                leadId={selectedLead?._id}
                profileImage={leadData?.profileImage}
                userName={leadData?.name || selectedLead?.name || "Unknown Lead"}
                defaultWidth={800}
                minWidth={400}
                maxWidth={1200}
                onDataUpdate={() => setDrawerRefreshTrigger(prev => prev + 1)}
                 onAssignSuccess={(leadId, newAssignedUser) => {                  
                    setData(prev =>
                    prev.map(lead =>
                      lead._id === leadId
                        ? { ...lead, assignedTo: newAssignedUser }
                        : lead
                    )
                  );
                }}
                onStatusChange={(leadId, newStatus) => {
                    console.log('DynamicPage.onStatusChange called with:', leadId, newStatus);
                    // Option A: local update
                    setData(prev =>
                    prev.map(lead =>
                        lead._id === leadId
                        ? { ...lead, status: newStatus }
                        : lead
                    )
                    );
                    // Optionally, if you prefer re-fetch:
                    // setRefreshKey(prev => prev + 1);
                }}
            />
        </>
    )
}

export default DynamicPage
