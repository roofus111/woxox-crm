'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Snackbar,
    Alert,
    CircularProgress,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Chip,
    Skeleton
} from '@mui/material';
import Link from 'next/link';
import './follow.css';
import { useSession } from 'next-auth/react';
// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import { toast } from 'react-toastify';
import { getLocalizedUrl } from '@/utils/i18n';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import debounce from 'lodash/debounce';
import { ErrorBoundary } from 'react-error-boundary';
import ResizableDrawer from '@/app/[lang]/(dashboard)/(private)/manager/leads/components/ResizableDrawer';

// Constants
const DEBOUNCE_DELAY = 300;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utility Function for Formatting Date
const formatDate = date => {
    try {
        return new Date(date).toISOString().substring(0, 16); // ISO format for date inputs
    } catch {
        return '';
    }
};

const listDayFormat = {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
    weekday: 'long',
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
            Something went wrong:
        </Typography>
        <Typography color="error" variant="body2" gutterBottom>
            {error.message}
        </Typography>
        <Button onClick={resetErrorBoundary} variant="contained" color="primary">
            Try again
        </Button>
    </Box>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
    </Box>
);

// Add this utility function at the top
const handleApiError = (error, setSnackbar) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setSnackbar({
            open: true,
            message: error.response.data.message || 'Server error occurred',
            severity: 'error'
        });
    } else if (error.request) {
        // The request was made but no response was received
        setSnackbar({
            open: true,
            message: 'No response from server',
            severity: 'error'
        });
    } else {
        // Something happened in setting up the request that triggered an Error
        setSnackbar({
            open: true,
            message: error.message || 'An error occurred',
            severity: 'error'
        });
    }
};

// Add a utility function to calculate stats for a group of events
const calculateDayStats = events => {
    return events.reduce((stats, event) => {
        const status = event.extendedProps.status;
        return {
            total: stats.total + 1,
            completed: stats.completed + (status === 'Closed' ? 1 : 0),
            pending: stats.pending + (status === 'Pending' ? 1 : 0),
            missed: stats.missed + (status === 'Missed' ? 1 : 0),
        };
    }, { total: 0, completed: 0, pending: 0, missed: 0 });
};

const BasicDataTables = () => {
    const [data, setData] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedLeadId, setSelectedLeadId] = useState(null)
    const [selectedLeadData, setSelectedLeadData] = useState(null)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const my = searchParams.get('my');

    // New state variable for insights
    const [insights, setInsights] = useState({
        totalFollowUps: 0,
        pendingFollowUps: 0,
        completedFollowUps: 0,
        missedFollowUps: 0,
        upcomingFollowUps: 0,
    });

    // State for filter by assignee
    const [selectedAssignee, setSelectedAssignee] = useState('all');
    const [uniqueAssignees, setUniqueAssignees] = useState([]);

    // New state for tag filtering
    const [selectedTag, setSelectedTag] = useState('all');
    const [uniqueTags, setUniqueTags] = useState([]);

    // Add new state for assigned by filter
    const [assignedByFilter, setAssignedByFilter] = useState('all');

    // Add new state for caching
    const [cache, setCache] = useState({
        data: null,
        timestamp: null
    });

    // Add refs for performance monitoring
    const renderCount = useRef(0);
    const filterTime = useRef(0);

    // Memoized filter function with performance tracking
    const applyFilters = useCallback((followUps) => {
        const startTime = performance.now();

        const filtered = followUps.filter(followUp => {
            const assigneeMatch =
                selectedAssignee === 'all' ||
                followUp.assignedTo?._id === selectedAssignee;

            const tags =
                (followUp.tags && followUp.tags.length > 0)
                    ? followUp.tags
                    : (followUp.leadId && followUp.leadId.tags)
                        ? followUp.leadId.tags
                        : [];

            const tagMatch =
                selectedTag === 'all' ||
                tags.some(tag => tag._id === selectedTag);

            const assignedByMatch =
                assignedByFilter === 'all' ||
                (assignedByFilter === 'me' && followUp.createdBy?._id === session?.user?.id) ||
                (assignedByFilter === 'others' && followUp.createdBy?._id !== session?.user?.id);
            console.log(assignedByFilter, followUp.assignedTo?._id, session?.user?.id);
            return assigneeMatch && tagMatch && assignedByMatch;
        });

        filterTime.current = performance.now() - startTime;
        return filtered;
    }, [selectedAssignee, selectedTag, assignedByFilter, session?.user?._id]);

    // Debounced filter handlers
    const debouncedSetAssignee = useCallback(
        debounce((value) => {
            setSelectedAssignee(value);
        }, DEBOUNCE_DELAY),
        []
    );

    const debouncedSetTag = useCallback(
        debounce((value) => {
            setSelectedTag(value);
        }, DEBOUNCE_DELAY),
        []
    );

    const debouncedSetAssignedBy = useCallback(
        debounce((value) => {
            setAssignedByFilter(value);
        }, DEBOUNCE_DELAY),
        []
    );

    // Memoize event handlers
    const handleSnackbarClose = useCallback(
        () => setSnackbar(prev => ({ ...prev, open: false })),
        []
    );

    const handleCompleteFollowUp = useCallback(async id => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${id}`,
                { status: 'Closed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(prevData =>
                prevData.map(item =>
                    item._id === id ? { ...item, status: 'Closed' } : item
                )
            );
            setSnackbar({ open: true, message: 'Follow-up marked as completed.', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to complete follow-up.', severity: 'error' });
        } finally {
            setActionLoading(false);
            setDialogOpen(false);
        }
    }, []);

    const fetchLeadDetails = useCallback(async (leadId) => {
        setDrawerLoading(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('No auth token')
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setSelectedLeadData(response.data.lead || response.data)
        } catch (err) {
            console.error('Error fetching lead details:', err)
            toast.error('Failed to load lead details.')
            setSelectedLeadData(null)
        } finally {
            setDrawerLoading(false)
        }
    }, [])

    const handleViewClick = useCallback(async (leadId) => {
        setSelectedLeadId(leadId)
        await fetchLeadDetails(leadId)
        setDrawerOpen(true)
    }, [fetchLeadDetails])

    const handleRescheduleFollowUp = useCallback(async id => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${id}`,
                { nextFollowUpDate: rescheduleDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(prevData =>
                prevData.map(item =>
                    item._id === id ? { ...item, nextFollowUpDate: rescheduleDate } : item
                )
            );
            setSnackbar({ open: true, message: 'Follow-up rescheduled successfully.', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to reschedule follow-up.', severity: 'error' });
        } finally {
            setActionLoading(false);
            setDialogOpen(false);
        }
    }, [rescheduleDate]);

    // Memoize insights calculation
    const calculateInsights = useCallback(followUps => {
        const now = new Date();
        setInsights({
            totalFollowUps: followUps.length,
            pendingFollowUps: followUps.filter(f => f.status === 'Pending').length,
            completedFollowUps: followUps.filter(f => f.status === 'Closed').length,
            missedFollowUps: followUps.filter(
                f => f.status === 'Pending' && new Date(f.nextFollowUpDate) < now
            ).length,
            upcomingFollowUps: followUps.filter(
                f => f.status === 'Pending' && new Date(f.nextFollowUpDate) > now
            ).length,
        });
    }, []);

    // Memoize assignee extraction
    const extractUniqueAssignees = useCallback(followUps => {
        const assignees = followUps.reduce((acc, followUp) => {
            if (followUp.assignedTo && !acc.some(a => a._id === followUp.assignedTo._id)) {
                acc.push(followUp.assignedTo);
            }
            return acc;
        }, []);
        setUniqueAssignees(assignees);
    }, []);

    // New function to extract unique tags from follow-ups
    const extractUniqueTags = useCallback(followUps => {
        const tagMap = {};
        followUps.forEach(followUp => {
            // Determine which tags to use:
            const tags =
                (followUp.tags && followUp.tags.length > 0)
                    ? followUp.tags
                    : (followUp.leadId && followUp.leadId.tags)
                        ? followUp.leadId.tags
                        : [];
            tags.forEach(tag => {
                if (!tagMap[tag._id]) {
                    tagMap[tag._id] = tag;
                }
            });
        });
        setUniqueTags(Object.values(tagMap));
    }, []);

    // Optimized data fetching with caching
    const fetchData = useCallback(async () => {
        const abortController = new AbortController();
        setLoading(true);

        // Check cache first
        if (cache.data && cache.timestamp && Date.now() - cache.timestamp < CACHE_DURATION) {
            setData(cache.data);
            calculateInsights(cache.data);
            extractUniqueAssignees(cache.data);
            extractUniqueTags(cache.data);
            setLoading(false);
            return () => abortController.abort();
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setSnackbar({ open: true, message: 'No authorization token found.', severity: 'error' });
            setLoading(false);
            return;
        }

        try {
            const apiUrl = my
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/followups/myfollow/get`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/followups/`;

            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortController.signal,
            });

            // Update cache
            setCache({
                data: response.data,
                timestamp: Date.now()
            });

            setData(response.data);
            calculateInsights(response.data);
            extractUniqueAssignees(response.data);
            extractUniqueTags(response.data);
        } catch (error) {
            if (!abortController.signal.aborted) {
                handleApiError(error, setSnackbar);
            }
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }

        return () => abortController.abort();
    }, [my, calculateInsights, extractUniqueAssignees, extractUniqueTags]);

    // Memoized filtered events with performance tracking
    const filteredEvents = useMemo(() => {
        renderCount.current += 1;
        const filtered = applyFilters(data);

        return filtered.map(followUp => {
            const now = new Date();
            const tags =
                (followUp.tags && followUp.tags.length > 0)
                    ? followUp.tags
                    : (followUp.leadId && followUp.leadId.tags)
                        ? followUp.leadId.tags
                        : [];

            return {
                id: followUp._id,
                assignedTo: followUp.assignedTo,
                title: `${followUp.leadId?.name}`,
                start: followUp.nextFollowUpDate,
                extendedProps: {
                    status: followUp.status === 'Pending' && new Date(followUp.nextFollowUpDate) < now
                        ? 'Missed'
                        : followUp.status,
                    lead: followUp.leadId?._id,
                    assignedTo: followUp.assignedTo,
                    note: followUp.notes,
                    tags: tags,
                },
            };
        });
    }, [data, applyFilters]);

    // Performance monitoring effect
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`Render count: ${renderCount.current}`);
            console.log(`Filter time: ${filterTime.current.toFixed(2)}ms`);
        }
    }, [filteredEvents]);

    useEffect(() => {
        const cleanup = fetchData();
        return () => cleanup;
    }, [fetchData]);

    const formatDateOverride = useCallback(date => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString(undefined, listDayFormat);
    }, []);

    const handleEventClick = ({ event }) => {
        if (event.extendedProps.status === 'Closed') return;
        setSelectedEvent(event);
        setRescheduleDate(formatDate(event.start));
        setDialogOpen(true);
    };

    // Add cleanup for debounced handlers
    useEffect(() => {
        return () => {
            debouncedSetAssignee.cancel();
            debouncedSetTag.cancel();
            debouncedSetAssignedBy.cancel();
        };
    }, [debouncedSetAssignee, debouncedSetTag, debouncedSetAssignedBy]);

    if (loading) return <CircularProgress />;
    const now = new Date();

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Typography variant="h4" gutterBottom>Task Manager</Typography>

            {/* Insights / Summary Section */}
            <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">Total Follow-ups</Typography>
                    <Typography variant="h4">{insights.totalFollowUps}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main">Pending</Typography>
                    <Typography variant="h4">{insights.pendingFollowUps}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">Completed</Typography>
                    <Typography variant="h4">{insights.completedFollowUps}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="error.main">Missed</Typography>
                    <Typography variant="h4">{insights.missedFollowUps}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">Upcoming</Typography>
                    <Typography variant="h4">{insights.upcomingFollowUps}</Typography>
                </Box>
            </Box>

            {/* Filter Controls with debounced handlers */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {!my && (
                    <div>
                        <Typography variant="body1">Filter by Assignee:</Typography>
                        <select
                            value={selectedAssignee}
                            onChange={e => debouncedSetAssignee(e.target.value)}
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                minWidth: '200px',
                            }}
                        >
                            <option value="all">All Assignees</option>
                            {uniqueAssignees.map(assignee => (
                                <option key={assignee._id} value={assignee._id}>
                                    {assignee.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <Typography variant="body1">Filter by Tag:</Typography>
                    <select
                        value={selectedTag}
                        onChange={e => debouncedSetTag(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            minWidth: '200px',
                        }}
                    >
                        <option value="all">All Tags</option>
                        {uniqueTags.map(tag => (
                            <option key={tag._id} value={tag._id}>
                                {tag.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <Typography variant="body1">Assigned By:</Typography>
                    <select
                        value={assignedByFilter}
                        onChange={e => debouncedSetAssignedBy(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            minWidth: '200px',
                        }}
                    >
                        <option value="all">All Follow-ups</option>
                        <option value="me">Assigned by Me</option>
                        <option value="others">Escalated to Me</option>
                    </select>
                </div>
            </Box>

            <FullCalendar
                height="auto"
                plugins={[listPlugin]}
                initialView="listWeek"
                events={filteredEvents}
                eventClassNames={({ event }) => {
                    switch (event.extendedProps.status) {
                        case 'Closed':
                            return 'closed-follow-up';
                        case 'Missed':
                            return 'missed-follow-up';
                        case 'Pending':
                            return 'pending-follow-up';
                        default:
                            return '';
                    }
                }}
                eventContent={eventInfo => {
                    const { note, tags } = eventInfo.event.extendedProps;
                    const leadId = eventInfo.event.extendedProps.lead;
                    return (
                        <div className="event-content flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 p-4">
                            <div className="flex flex-col gap-3 w-full sm:w-2/3">
                                <div className="flex items-center justify-between sm:justify-start gap-3">
                                    <span className="text-base font-medium">{eventInfo.event.title}</span>
                                    {eventInfo.event.extendedProps.status !== "Closed" && (
                                        <button
                                            className="text-green-600 hover:text-green-700 px-2 py-1 border border-green-600 rounded-full focus:outline-none transition-all"
                                            onClick={() => handleCompleteFollowUp(eventInfo.event.id)}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded">{note}</p>
                                {tags && tags.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {tags.map(tag => (
                                            <Chip
                                                key={tag._id}
                                                icon={<i className="ri-price-tag-3-fill" style={{ color: tag.color }} />}
                                                label={tag.name}
                                                className='px-2 py-1'
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end sm:items-center gap-4 w-full sm:w-1/3">
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    {eventInfo.event.extendedProps.status !== "Closed" && (
                                        <button
                                            onClick={() => handleEventClick(eventInfo)}
                                            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                                        >
                                            Reschedule
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleViewClick(leadId)}
                                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-800 rounded border border-gray-300 hover:bg-gray-200 transition-all"
                                    >
                                        View
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600 text-center">
                                    Assigned To: {eventInfo.event.extendedProps.assignedTo?.name + "-->" + eventInfo.event.extendedProps.assignedTo?.name || "Unassigned"}
                                </div>
                            </div>
                        </div>
                    );
                }}
                headerToolbar={{
                    left: 'listMonth,listWeek,listDay,listYear',
                    right: 'today,prev,next',
                }}
                buttonText={{
                    listMonth: 'Month',
                    listWeek: 'Week',
                    listDay: 'Day',
                    listYear: 'Year',
                }}
                dayHeaderContent={args => formatDateOverride(args.date)}
                locale="en"
                ref={calendarRef => {
                    if (calendarRef) {
                        setTimeout(() => {
                            const titleElement = document.querySelector('.fc-toolbar-title');
                            if (titleElement) {
                                titleElement.style.fontSize = '1rem';
                                titleElement.style.fontWeight = 'Bold';
                            }
                        }, 0);
                    }
                }}
                loading={loading}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Reschedule</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Reschedule Date"
                        type="datetime-local"
                        value={rescheduleDate}
                        onChange={e => setRescheduleDate(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button color="primary" onClick={() => handleRescheduleFollowUp(selectedEvent?.id)} disabled={actionLoading}>
                        {actionLoading ? <CircularProgress size={20} /> : 'Reschedule'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ResizableDrawer
                open={drawerOpen}
                maxWidth={600}
                onClose={() => {
                    setDrawerOpen(false)
                    setSelectedLeadData(null)
                    setSelectedLeadId(null)
                }}
                title="Lead Details"
                leadId={selectedLeadId}
                leadData={drawerLoading ? null : selectedLeadData}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </ErrorBoundary>
    );
};

export default BasicDataTables;
