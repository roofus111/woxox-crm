'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
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
import { toast } from 'react-toastify'
import axios from 'axios'


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
    const campaignId = params.campaign
    const [data, setData] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({ field: '', direction: 'asc' })
    const [filterStatus, setFilterStatus] = useState('')

    const fetch = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
            toast.error('Authorization token is missing.')
            setLoading(false)
            return
        }

        if (!process.env.NEXT_PUBLIC_API_URL) {
            toast.error('API URL is not configured.')
            setLoading(false)
            return
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/leadsbycampaign/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.status === 200) {
                setData(response.data)
            } else {
                toast.error('Unexpected response from the server.')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch campaign data.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch()
    }, [campaignId])

    const handleSelect = id => {
        setSelected(prevSelected =>
            prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
        )
    }

    const handleSelectAll = checked => {
        setSelected(checked ? data.map(lead => lead._id) : [])
    }

    const isSelected = id => selected.includes(id)

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

    const handleView = id => {
        // Replace with the actual logic for handling the view action
        toast.info(`Viewing details for lead ID: ${id}`)
    }

    const filteredData = data
        .filter(lead => lead.name.toLowerCase().includes(searchTerm) || lead.email.toLowerCase().includes(searchTerm))
        .filter(lead => (filterStatus ? lead.status === filterStatus : true))

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
            if (response.status !== 200) {
                toast.error(response.data.message || 'Unknown error occurred.')
                return // Stop further execution in case of HTTP error
            }

            toast.success(response.data)
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



    return (
        <><Box sx={{ padding: 4 }}>
            <h1>Lead Information {campaignId}</h1>

            <Box sx={{ marginBottom: 2, display: 'flex', gap: 2 }}>
                <TextField label='Search' variant='outlined' value={searchTerm} onChange={handleSearch} fullWidth />
                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={filterStatus} onChange={handleFilter} label='Status'>
                        <MenuItem value=''>All</MenuItem>
                        <MenuItem value='Contacted'>Contacted</MenuItem>``
                        <MenuItem value='Follow-up'>Follow-up</MenuItem>
                        <MenuItem value='Interested'>Interested</MenuItem>
                    </Select>
                </FormControl>
                {selected.length === 0 ? (
                    <Button onClick={handleClickOpen}>Assign Unassigned</Button>
                ) : (
                    <>
                        <Button onClick={onUnassigned}>Delete</Button>
                        <Button onClick={onUnassigned}>Assign Selected Leads</Button>
                    </>
                )}
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < filteredData.length}
                                        checked={selected.length === filteredData.length}
                                        onChange={e => handleSelectAll(e.target.checked)} />
                                </TableCell>
                                <TableCell onClick={() => handleSort('createdAt')}>
                                    Date {sortConfig.field === 'createdAt' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSort('name')}>
                                    Name {sortConfig.field === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSort('email')}>
                                    Email {sortConfig.field === 'email' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Assigned To</TableCell>
                                <TableCell onClick={() => handleSort('status')}>
                                    Status {sortConfig.field === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map(lead => (
                                <TableRow key={lead._id} selected={isSelected(lead._id)}>
                                    <TableCell>
                                        <Checkbox checked={isSelected(lead._id)} onChange={() => handleSelect(lead._id)} />
                                    </TableCell>
                                    <TableCell>{lead.createdAt}</TableCell>
                                    <TableCell>{lead.name}</TableCell>
                                    <TableCell>{lead.email}</TableCell>
                                    <TableCell>{lead.phone}</TableCell>
                                    <TableCell>
                                        {lead.assignedTo ? lead.assignedTo.firstName + ' ' + lead.assignedTo.lastName : '---'}
                                    </TableCell>
                                    <TableCell>{lead.status}</TableCell>
                                    <TableCell>
                                        <Button variant='contained' color='primary' onClick={() => handleView(lead._id)}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
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
            </Dialog></>
    )
}

export default DynamicPage
