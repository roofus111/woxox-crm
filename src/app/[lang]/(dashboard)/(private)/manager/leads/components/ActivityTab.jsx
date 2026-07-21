import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, IconButton, Button } from '@mui/material'
import { LuPhoneMissed } from "react-icons/lu";
import axios from 'axios'
import Moment from 'react-moment'
import { useData } from '@/contexts/DataContext'
import UpcomingActivities from './UpcomingActivities'
import ActivityHappen from './ActivityHappen'

const ActivityTab = ({ leadId, onRefresh }) => {
    const theme = useTheme();
    const [upcomingActivities, setUpcomingActivities] = useState([
        {
            id: 1,
            date: 'Thu May 22 2025',
            time: '03:23 PM',
            status: 'Pending',
            description: 'Sooraj S : I am sharing a Prospect lead with you. Please review this lead.',
            createdBy: 'Sooraj S • Manu ML',
            timeAgo: '1 hour ago'
        },
        {
            id: 2,
            date: 'Fri May 23 2025',
            time: '10:00 AM',
            status: 'Pending',
            description: 'Follow up call scheduled for lead discussion and requirements gathering.',
            createdBy: 'David • Sarah K',
            timeAgo: '2 hours ago'
        },
        {
            id: 3,
            date: 'Mon May 26 2025',
            time: '02:30 PM',
            status: 'Pending',
            description: 'Demo presentation scheduled for product walkthrough.',
            createdBy: 'John D • Mike R',
            timeAgo: '1 day ago'
        }
    ])

    // New states for UserActivityTimeline logic
    const [timelineData, setTimelineData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Pagination states
    const [visibleItems, setVisibleItems] = useState(4)

    // Safely destructure data1 with fallback
    const dataContext = useData()
    const data1 = dataContext?.data1

    const refreshTimeline = useCallback(() => {
        setRefreshTrigger(prev => prev + 1)
    }, [])

    const isTimestamp = (str) => {
        // Check if it's a string of digits and reasonable timestamp length
        if (!/^\d{10,13}$/.test(str)) return false;
        
        const num = parseInt(str);
        
        if (str.length === 10) {
            return num >= 1000000000 && num <= 2147483647;
        } else if (str.length === 13) {
            return num >= 1000000000000 && num <= 2147483647000;
        }
        
        return false;
    };

    // Helper function to format timestamp
    const formatTimestamp = (timestamp) => {
        try {
            // Convert to number and handle both seconds and milliseconds
            let ts = parseInt(timestamp)
            if (ts.toString().length === 10) {
                ts = ts * 1000 // Convert seconds to milliseconds
            }
            return new Date(ts).toLocaleString()
        } catch (error) {
            return timestamp // Return original if conversion fails
        }
    }

    // Helper function to extract and format follow-up dates from text
    const formatFollowUpText = (text) => {
        if (!text) return text;

        // Look for timestamp patterns in the text, but be more specific
        // This regex looks for standalone numbers (not part of phone numbers)
        const timestampPattern = /(?:^|\s)(\d{10,13})(?:\s|$)/g;
        
        let formattedText = text;
        let match;
        
        while ((match = timestampPattern.exec(text)) !== null) {
            const potentialTimestamp = match[1];
            
            if (isTimestamp(potentialTimestamp)) {
                const formattedDate = formatTimestamp(potentialTimestamp);
                // Replace the matched timestamp with formatted date, preserving surrounding spaces
                formattedText = formattedText.replace(match[0], match[0].replace(potentialTimestamp, formattedDate));
            }
        }
        
        return formattedText;
    };

    const formatFollowUpTextConservative = (text) => {
        if (!text) return text;

        // Only look for timestamps in specific contexts that are likely to be dates
        const contextPatterns = [
            /(?:scheduled|follow.?up|meeting|call|appointment|reminder|due|date|time|at|on|for)\s+(\d{10,13})/gi,
            /(\d{10,13})(?:\s+(?:scheduled|follow.?up|meeting|call|appointment|reminder|due|date|time))/gi
        ];
        
        let formattedText = text;
        
        contextPatterns.forEach(pattern => {
            formattedText = formattedText.replace(pattern, (match, timestamp) => {
                if (isTimestamp(timestamp)) {
                    const formattedDate = formatTimestamp(timestamp);
                    return match.replace(timestamp, formattedDate);
                }
                return match;
            });
        });
        
        return formattedText;
    };

    // Fetch timeline data (integrated from UserActivityTimeLine component)
    useEffect(() => {
        let isMounted = true

        if (!leadId || typeof leadId !== 'string' && typeof leadId !== 'number') {
            setError('Invalid lead ID provided.')
            setLoading(false)
            return
        }

        const fetchTimelineData = async () => {
            try {
                const token = localStorage.getItem('token')

                if (!token) {
                    if (isMounted) {
                        setError('Authentication required. Please log in again.')
                        setLoading(false)
                    }
                    return
                }

                if (isMounted) {
                    setLoading(true)
                    setError(null)
                }

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/leadactivity/${encodeURIComponent(leadId)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    }
                )

                if (isMounted) {
                    if (response.data && Array.isArray(response.data)) {
                        setTimelineData(response.data)
                    } else {
                        setTimelineData([])
                    }
                    setLoading(false)
                }
            } catch (error) {
                if (isMounted) {
                    let errorMessage = 'Unable to load activity timeline.'

                    if (error.code === 'ECONNABORTED') {
                        errorMessage = 'Request timed out. Please try again.'
                    } else if (error.response?.status === 401) {
                        errorMessage = 'Session expired. Please log in again.'
                    } else if (error.response?.status === 403) {
                        errorMessage = 'You do not have permission to view this data.'
                    } else if (error.response?.status === 404) {
                        errorMessage = 'Lead activity not found.'
                    } else if (error.response?.status >= 500) {
                        errorMessage = 'Server error. Please try again later.'
                    } else if (!navigator.onLine) {
                        errorMessage = 'No internet connection. Please check your network.'
                    }

                    setError(errorMessage)
                    setLoading(false)

                    if (process.env.NODE_ENV === 'development') {
                        console.error('Timeline fetch error:', {
                            status: error.response?.status,
                            message: error.message,
                            leadId: leadId
                        })
                    }
                }
            }
        }

        fetchTimelineData()

        return () => {
            isMounted = false
        }
    }, [leadId, data1, refreshTrigger])

    const handleMarkAsDone = (activityId) => {
        setUpcomingActivities(prev =>
            prev.map(activity =>
                activity.id === activityId
                    ? { ...activity, status: 'Completed' }
                    : activity
            )
        );
        console.log(`Activity ${activityId} marked as done for lead ${leadId}`);
    }

    // Handle Load More functionality
    const handleLoadMore = () => {
        setVisibleItems(prev => prev + 4)
    }

    // Enhanced status configuration matching the design from second file
    const getStatusConfig = (action, status) => {
        const configs = {
            // Delete action
            deleted: {
                icon: <i className="ri-delete-bin-line"></i>,
                color: '#ef4444',
                bgColor: '#fef2f2',
                textColor: '#b91c1c'
            },
            
            // Contact/Call related
            contacted: {
                icon: <i className="ri-phone-line"></i>,
                color: '#dc2626',
                bgColor: '#fef2f2', 
                textColor: '#b91c1c'
            },
            notPicked: {
                icon: <LuPhoneMissed size={16} />,
                color: '#dc2626',
                bgColor: '#fef2f2',
                textColor: '#b91c1c'
            },
            call_completed: {
                icon: <i className="ri-phone-line"></i>,
                color: '#dc2626',
                bgColor: '#fef2f2',
                textColor: '#b91c1c'
            },
            'call-backed': {
                icon: <i className="ri-phone-line"></i>,
                color: '#dc2626',
                bgColor: '#fef2f2',
                textColor: '#b91c1c'
            },

            // WhatsApp message
            whatsapp_sent: {
                icon: <i className="ri-whatsapp-line"></i>,
                color: '#25d366',
                bgColor: '#f0fdf4',
                textColor: '#15803d'
            },
            message_sent: {
                icon: <i className="ri-whatsapp-line"></i>,
                color: '#25d366',
                bgColor: '#f0fdf4',
                textColor: '#15803d'
            },

            // Status changes
            status_change: {
                icon: <i className="ri-arrow-up-down-line"></i>,
                color: '#3b82f6',
                bgColor: '#eff6ff',
                textColor: '#1d4ed8'
            },
            converted: {
                icon: <i className="ri-arrow-up-down-line"></i>,
                color: '#3b82f6',
                bgColor: '#eff6ff',
                textColor: '#1d4ed8'
            },
            interested: {
                icon: <i className="ri-arrow-up-down-line"></i>,
                color: '#3b82f6',
                bgColor: '#eff6ff',
                textColor: '#1d4ed8'
            },

            // Assignment
            assigned: {
                icon: <i className="ri-user-add-line"></i>,
                color: '#f59e0b',
                bgColor: '#fffbeb',
                textColor: '#d97706'
            },

            // Follow up
            followUp: {
                icon: <i className="ri-calendar-schedule-line"></i>,
                color: '#f59e0b',
                bgColor: '#fffbeb',
                textColor: '#d97706'
            },
            'follow-up': {
                icon: <i className="ri-calendar-schedule-line"></i>,
                color: '#f59e0b',
                bgColor: '#fffbeb',
                textColor: '#d97706'
            },

            // Meeting/Schedule
            rescheduled: {
                icon: <i className="ri-calendar-event-line"></i>,
                color: '#06b6d4',
                bgColor: '#f0f9ff',
                textColor: '#0284c7'
            },
            meeting_scheduled: {
                icon: <i className="ri-calendar-event-line"></i>,
                color: '#06b6d4',
                bgColor: '#f0f9ff',
                textColor: '#0284c7'
            },
            schedule: {
                icon: <i className="ri-calendar-event-line"></i>,
                color: '#8b5cf6',
                bgColor: '#faf5ff',
                textColor: '#7c3aed'
            },

            // Notes
            note_added: {
                icon: <i className="ri-sticky-note-line"></i>,
                color: '#10b981',
                bgColor: '#f0fdf4',
                textColor: '#059669'
            },
            'added-note': {
                icon: <i className="ri-sticky-note-line"></i>,
                color: '#10b981',
                bgColor: '#f0fdf4',
                textColor: '#059669'
            },

            // Converted status
            'is-converted': {
                icon: <i className="ri-money-dollar-circle-line"></i>,
                color: '#1f2937',
                bgColor: '#f9fafb',
                textColor: '#374151'
            },

            // Legacy support for existing actions
            won: {
                icon: <i className="ri-arrow-up-long-line"></i>,
                color: '#059669',
                bgColor: '#f0fdf4',
                textColor: '#059669'
            },
            lost: {
                icon: <i className="ri-arrow-down-long-line"></i>,
                color: '#dc2626',
                bgColor: '#fef2f2',
                textColor: '#dc2626'
            },
            email_sent: {
                icon: <i className="ri-mail-check-line"></i>,
                color: '#7c3aed',
                bgColor: '#faf5ff',
                textColor: '#7c3aed'
            },
            demo_completed: {
                icon: <i className="ri-video-chat-line"></i>,
                color: '#9333ea',
                bgColor: '#faf5ff',
                textColor: '#9333ea'
            },
            qualified: {
                icon: <i className="ri-star-line"></i>,
                color: '#ca8a04',
                bgColor: '#fffbeb',
                textColor: '#ca8a04'
            },

            // Default fallback
            default: {
                icon: <i className="ri-article-line"></i>,
                color: '#6b7280',
                bgColor: '#f9fafb',
                textColor: '#4b5563'
            }
        }

        return configs[action] || configs.default
    }

    useEffect(() => {
        if (onRefresh) {
            refreshTimeline()
        }
    }, [onRefresh, refreshTimeline])

    // Get custom title based on action type
    const getActivityTitle = (item) => {
        if (!item || !item.action) {
            return 'Activity Update'
        }

        const titleMap = {
            // Contact/Call related
            contacted: 'Contact Made',
            notPicked: 'Call Not Answered',
            call_completed: 'Call Completed',
            'call-backed': 'Call Back Received',
            
            // WhatsApp/Message
            whatsapp_sent: 'WhatsApp Message Sent',
            message_sent: 'Message Sent',
            
            // Status changes
            status_change: 'Status Updated',
            converted: 'Lead Converted',
            interested: 'Interest Shown',
            
            // Assignment
            assigned: 'Lead Assigned',

            updated: 'Lead Updated',
            'lead-updated': 'Lead Updated',
            
            // Follow up
            followUp: 'Follow-up Scheduled',
            'follow-up': 'Follow-up Scheduled',
            
            // Meeting/Schedule
            rescheduled: 'Meeting Rescheduled',
            meeting_scheduled: 'Meeting Scheduled',
            schedule: 'Activity Scheduled',
            
            // Notes
            note_added: 'Note Added',
            'added-note': 'Note Added',
            
            // Converted status
            'is-converted': 'Conversion Completed',
            
            // Delete
            deleted: 'Record Deleted',
            
            // Legacy actions
            won: 'Lead Won',
            lost: 'Lead Lost',
            email_sent: 'Email Sent',
            demo_completed: 'Demo Completed',
            qualified: 'Lead Qualified'
        }

        return titleMap[item.action] || item.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const formatActivityText = (item) => {
        if (!item) {
            return 'Unknown Activity'
        }

        // If API returns details, use them and format any timestamps
        if (item.details) {
            const details = String(item.details)
            
            // Special handling for note activities - include user name
            if (item.action === 'note_added' || item.action === 'added-note') {
                const userName = item.userId?.name || item.user_name || item.userName || item.createdBy || 'Unknown User'
                return `${userName}: ${details}`
            }
            
            // Special handling for follow-up activities
            if (item.action === 'follow-up' || item.action === 'followUp' || details.toLowerCase().includes('follow-up')) {
                return formatFollowUpText(details)
            }
            
            // Check if the entire details string is just a timestamp
            if (isTimestamp(details.trim())) {
                return `Activity scheduled for ${formatTimestamp(details.trim())}`
            }
            
            // Format any timestamps within the text
            return formatFollowUpText(details)
        }

        // If no details, fall back to action type
        if (item.action) {
            const actionText = String(item.action).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            
            // Add context for follow-up actions
            if (item.action === 'follow-up' || item.action === 'followUp') {
                return 'Follow-up activity created'
            }
            
            // For note actions without details, still show user name if available
            if (item.action === 'note_added' || item.action === 'added-note') {
                const userName = item.userId?.name || item.user_name || item.userName || item.createdBy || 'Unknown User'
                return `${userName} added a note`
            }
            
            return actionText
        }

        return 'Unknown Activity'
    }

    const TimelineItem = ({ item, config, isLast }) => {
        const activityTitle = getActivityTitle(item)
        const activityText = formatActivityText(item)
        
        const hasActivityText = activityText && activityText.trim()
        
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    position: 'relative',
                    mb: isLast ? 0 : 4,
                    pb: isLast ? 0 : 2,
                }}
            >
                {/* Vertical connecting line */}
                {!isLast && (
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '22px',
                            top: '44px',
                            bottom: '-24px',
                            width: '2px',
                            backgroundColor: '#e5e7eb',
                            zIndex: 1
                        }}
                    />
                )}

                {/* Icon container */}
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                        fontSize: '18px',
                        zIndex: 2,
                        position: 'relative',
                        mr: 2
                    }}
                >
                    {config.icon}
                </Box>

                {/* Content area */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#1f2937',
                            fontSize: '16px',
                            fontWeight: 600,
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                            mb: hasActivityText ? 1 : 0.5
                        }}
                    >
                        {activityTitle}
                    </Typography>

                    {/* Activity description - always visible */}
                    {hasActivityText && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#374151',
                                fontSize: '14px',
                                fontWeight: 400,
                                lineHeight: 1.5,
                                wordBreak: 'break-word',
                                mb: 1,
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 1,
                                p: 2
                            }}
                        >
                            {activityText}
                        </Typography>
                    )}

                    {/* Timestamp */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#9ca3af',
                            fontSize: '13px',
                            fontWeight: 400,
                        }}
                    >
                        {item.timestamp ? (
                            <Moment format="MMM DD YYYY [at] hh:mm a">
                                {item.timestamp}
                            </Moment>
                        ) : (
                            'No date available'
                        )}
                    </Typography>
                </Box>
            </Box>
        )
    }

    return (
        <Box>
            {/* Pass the refresh function to UpcomingActivities */}
            <UpcomingActivities id={leadId} onActivityUpdate={refreshTimeline} />

            <Typography 
                variant="h6" 
                sx={{ 
                    color: '#6366f1', 
                    mb: 3, 
                    fontWeight: 600,
                    fontSize: '18px'
                }}
            >
                Complete Activity Timeline
            </Typography>

            {/* Timeline Container - Updated design */}
            <Box sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                p: 4
            }}>
                {loading && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            Loading timeline...
                        </Typography>
                    </Box>
                )}

                {error && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <i className="ri-alert-line" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '8px' }} />
                        <Typography variant="body1" sx={{ color: '#ef4444', fontWeight: 500 }}>
                            {error}
                        </Typography>
                    </Box>
                )}

                {!loading && !error && timelineData && timelineData.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <i className="ri-file-text-line" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '8px' }} />
                        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            No activity found for this lead.
                        </Typography>
                    </Box>
                )}

                {!loading && !error && timelineData && timelineData.length > 0 && (
                    <Box>
                        {/* Display visible items */}
                        {timelineData.slice(0, visibleItems).map((item, index) => {
                            if (!item || typeof item !== 'object') {
                                return null
                            }

                            const config = getStatusConfig(item.action, item.status)
                            const isLast = index === Math.min(visibleItems, timelineData.length) - 1

                            return (
                                <TimelineItem
                                    key={item._id || item.id || index}
                                    item={item}
                                    config={config}
                                    isLast={isLast}
                                />
                            )
                        })}

                        {/* Load More button */}
                        {visibleItems < timelineData.length && (
                            <Box sx={{ textAlign: 'center', mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleLoadMore}
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
                                    Load More ({timelineData.length - visibleItems} remaining)
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default ActivityTab