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
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({ field: '', direction: 'asc' })
    const [filterStatus, setFilterStatus] = useState('')
    const [campaignData, setCampaignData] = useState({})

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
                setCampaignData(response.data[0]?.campaignid)
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
    const [assign, setAssign] = useState('')
    const handleAssignee = e => {
        setAssign(e.target.value)
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
    const handleSubmit2 = async (e) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem('token')


            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/assign-multiple/${assign}`,
                { leadIds: selected }, // Ensure the body structure matches expected API input
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



    return (
        <><><Box sx={{ padding: 4 }}>
            <h1>Campaign : {campaignData.name}</h1>
            <p>{campaignData.description}</p>
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
                {selected.length === 0 ? (
                    <Button onClick={handleClickOpen}>Assign Unassigned</Button>
                ) : (
                    <>
                        <Button>Delete</Button>
                        <Button onClick={handleClickOpen2}>Assign Selected Leads</Button>
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
                                        <Button variant='contained' color='primary' onClick={() => router.push(getLocalizedUrl(`/manager/leads/byid/${lead._id}`, 'en'))}>
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
            </Dialog></><Dialog open={open2} onClose={handleClose2} aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>Assign leads</DialogTitle>
                <DialogContent>
                    <div>
                        <Typography className='mbe-2 font-medium' color='text.primary'>
                            Select counsellors
                        </Typography>
                        <FormControl fullWidth>
                            <Select value={assign} onChange={handleAssignee}>
                                {assigner.map((item) => {
                                    return <MenuItem value={item._id}>{item.firstName + " " + item.lastName}</MenuItem>
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
            </Dialog></>
    )
}

export default DynamicPage
