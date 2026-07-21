import React from 'react'
import { useState, useEffect } from 'react'
import { Typography, Box, IconButton, Chip, Button } from '@mui/material'
import axios from 'axios'
import Moment from 'react-moment'
import { toast } from 'react-toastify'
import { useData } from '@/contexts/DataContext'

const UpcomingActivities = ({ id, onActivityUpdate }) => {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [displayCount, setDisplayCount] = useState(4) // Start with 4 items

    const contextData = useData()
    const { data1, updateData } = contextData || {}

    useEffect(() => {
        let isMounted = true // To prevent setting state after unmount
        const token = localStorage.getItem('token')

        if (!token) {
            setError('No authorization token found.')
            setLoading(false)
            return
        }

        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                if (isMounted) {
                    setData(response.data)
                    console.log(response.data)
                    setLoading(false)
                }
            })
            .catch(error => {
                console.error('Failed to fetch data:', error)
                if (isMounted) {
                    setError('Failed to fetch data.')
                    setLoading(false)
                }
            })

        return () => {
            // Cleanup logic
            isMounted = false
        }
    }, [data1, id])

    const handleMarkAsDone = async (itemId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Closed' })
            })

            const responseData = await response.json()

            if (response.ok) {
                updateData && updateData({ refresh: true })
                toast.success('Marked as Done')

                // Call the callback to refresh the timeline
                if (onActivityUpdate) {
                    onActivityUpdate()
                }
            } else {
                setError(responseData.message || 'An error occurred. Please try again.')
                toast.error(responseData.message || 'An error occurred. Please try again.')
            }
        } catch (error) {
            setError('An error occurred. Please try again.')
            toast.error('An error occurred. Please try again.')
        }
    }

    const handleLoadMore = () => {
        setDisplayCount(prevCount => prevCount + 4)
    }

    if (loading) {
        return (
            <div>
                <Typography variant="h6" sx={{ color: '#6366f1', mb: 3, fontWeight: 600 }}>
                    Upcoming Activity
                </Typography>
                <Box sx={{ bgcolor: 'white', borderRadius: 2, mb: 4, p: 3 }}>
                    <Typography>Loading...</Typography>
                </Box>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <Typography variant="h6" sx={{ color: '#6366f1', mb: 3, fontWeight: 600 }}>
                    Upcoming Activity
                </Typography>
                <Box sx={{ bgcolor: 'white', borderRadius: 2, mb: 4, p: 3 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </div>
        )
    }

    const filteredData = data?.filter(item => item.status !== 'Closed') || []
    const displayedData = filteredData.slice(0, displayCount)
    const hasMore = filteredData.length > displayCount

    return (
        <div>
            <Typography variant="h6" sx={{ color: '#6366f1', mb: 3, fontWeight: 600 }}>
                Upcoming Activity
            </Typography>

            {/* Upcoming Activities List */}
            <Box sx={{ bgcolor: 'white', borderRadius: 2, mb: 4, overflow: 'hidden' }}>
                {filteredData.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                        <Typography color="text.secondary">No upcoming activities found.</Typography>
                    </Box>
                ) : (
                    <>
                        {displayedData.map((item, index) => (
                            <Box key={item._id} sx={{
                                p: 3,
                                borderBottom: index < displayedData.length - 1 ? '1px solid #f3f4f6' : hasMore ? '1px solid #f3f4f6' : 'none',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2
                            }}>
                                {/* Calendar Icon */}
                                <Box sx={{
                                    minWidth: 40,
                                    height: 40,
                                    bgcolor: '#e0e7ff',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mt: 0.5
                                }}>
                                    <i className="ri-calendar-line" style={{ color: '#6366f1', fontSize: '18px' }} />
                                </Box>

                                {/* Activity Details */}
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600 }}>
                                            <Moment format='MMM DD YYYY hh:mm A'>{item.nextFollowUpDate}</Moment>
                                        </Typography>
                                        <Chip
                                            label={item.status}
                                            size="small"
                                            sx={{
                                                bgcolor: item.status === 'Pending' ? '#fef3c7' : '#dcfce7',
                                                color: item.status === 'Pending' ? '#92400e' : '#166534',
                                                fontWeight: 600,
                                                fontSize: '11px',
                                                ml: 2
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                        {item.notes}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                        Created By: {item.createdBy?.name} → {item.assignedTo?.name}
                                    </Typography>
                                    <br />
                                    <Typography variant="caption" sx={{ color: '#9ca3af', ml: 'auto' }}>
                                        <Moment fromNow>{item.updatedAt}</Moment>
                                    </Typography>
                                </Box>

                                {/* Tick Button */}
                                <IconButton
                                    onClick={() => handleMarkAsDone(item._id)}
                                    sx={{
                                        bgcolor: '#f0fdf4',
                                        color: '#16a34a',
                                        width: 36,
                                        height: 36,
                                        '&:hover': {
                                            bgcolor: '#dcfce7'
                                        }
                                    }}
                                >
                                    <i className="ri-check-line" style={{ fontSize: '18px' }} />
                                </IconButton>
                            </Box>
                        ))}

                        {/* Load More Button */}
                        {hasMore && (
                            <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid #f3f4f6' }}>
                                <Button
                                    onClick={handleLoadMore}
                                    variant="outlined"
                                    sx={{
                                        color: '#6366f1',
                                        borderColor: '#6366f1',
                                        '&:hover': {
                                            backgroundColor: '#f0f0ff',
                                            borderColor: '#5855eb'
                                        },
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Load More Activities ({filteredData.length - displayCount} remaining)
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </div>
    )
}

export default UpcomingActivities