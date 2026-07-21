import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/followups/v2/gettasks';

const formatDate = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;

        // Format: M/D/YYYY
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return null;
    }
};

const calculateDayWiseStats = (followups) => {
    if (!Array.isArray(followups)) return {};

    const stats = {};
    const now = new Date();

    console.log('Processing followups for stats:', followups);

    followups.forEach(followup => {
        if (!followup?.nextFollowupDate) return;

        try {
            const followupDate = new Date(followup.nextFollowupDate);
            if (isNaN(followupDate.getTime())) return;

            const date = formatDate(followupDate);
            if (!date) return;

            // Initialize stats object for this date
            if (!stats[date]) {
                stats[date] = {
                    total: 0,
                    pending: 0,
                    completed: 0,
                    overdue: 0,
                    'in-progress': 0,
                    closed: 0
                };
            }

            // Increment total
            stats[date].total++;

            // Process status
            const status = (followup.status || 'pending').toLowerCase().trim();

            // Update counts based on status
            if (status === 'pending') {
                if (followupDate < now) {
                    stats[date].overdue++;
                } else {
                    stats[date].pending++;
                }
            } else if (status === 'completed') {
                stats[date].completed++;
            } else if (['in-progress', 'inprogress', 'in progress'].includes(status)) {
                stats[date]['in-progress']++;
            } else if (status === 'closed') {
                stats[date].closed++;
            } else {
                stats[date].pending++;
            }

            console.log(`Stats for ${date}:`, stats[date]);
        } catch (error) {
            console.error('Error processing followup:', error);
        }
    });

    return stats;
};

const transformFollowup = (followup) => {
    try {
        // Debug log
        console.log('Raw followup data:', followup);

        // Safely handle dates
        const followUpDate = followup.followUpDate ? new Date(followup.followUpDate) : null;
        const nextFollowUpDate = followup.nextFollowUpDate ? new Date(followup.nextFollowUpDate) : null;

        // Log the date parsing results
        console.log('Date parsing:', {
            followUpDate,
            nextFollowUpDate,
            originalFollowUpDate: followup.followUpDate,
            originalNextFollowUpDate: followup.nextFollowUpDate
        });

        const transformed = {
            id: followup._id || '',
            leadName: followup.leadId?.name || 'Unknown',
            leadPhone: followup.leadId?.phone || '',
            followupDate: followUpDate && !isNaN(followUpDate)
                ? followUpDate.toLocaleString()
                : '-',
            nextFollowupDate: nextFollowUpDate && !isNaN(nextFollowUpDate)
                ? nextFollowUpDate.toLocaleString()
                : '-',
            // Preserve exact status value
            status: followup.status || 'Pending',
            assignedTo: followup.assignedTo?.name || 'Unassigned',
            createdBy: followup.createdBy?.name || 'Unknown',
            notes: followup.notes || '',
            tags: Array.isArray(followup.leadId?.tags) ? followup.leadId.tags : [],
            leadStatus: followup.leadId?.status || 'Unknown'
        };

        console.log('Transformed followup:', transformed);
        return transformed;
    } catch (error) {
        console.error('Error transforming followup:', error);
        return null;
    }
};

export function useFollowups(filterParams) {
    const [followups, setFollowups] = useState([]);
    const [stats, setStats] = useState({
        assignedToMe: 0,
        createdByMeForOthers: 0,
        createdByMeForMe: 0
    });
    const [dayWiseStats, setDayWiseStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDateForAPI = (date) => {
        if (!date) return null;
        try {
            return date instanceof Date
                ? date.toISOString().split('T')[0]
                : new Date(date).toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date for API:', error);
            return null;
        }
    };

    const getQueryParams = useCallback(() => {
        const params = {
            dateRange: filterParams.dateRange,
            filterType: filterParams.viewFilter,
        };

        if (filterParams.dateRange === 'custom' && filterParams.startDate) {
            params.startDate = formatDateForAPI(filterParams.startDate);
            params.endDate = formatDateForAPI(filterParams.endDate);
        }

        return params;
    }, [filterParams]);

    const fetchFollowups = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await axios.get(API_BASE_URL, {
                params: getQueryParams(),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            const transformedFollowups = response.data.followUps
                .map(transformFollowup)
                .filter(Boolean); // Remove null values from failed transformations

            setFollowups(transformedFollowups);
            setStats(response.data.stats);
            setDayWiseStats(calculateDayWiseStats(transformedFollowups));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch follow-ups');
            console.error('Error fetching follow-ups:', err);
        } finally {
            setIsLoading(false);
        }
    }, [getQueryParams]);

    useEffect(() => {
        fetchFollowups();
    }, [fetchFollowups]);

    return {
        followups,
        stats,
        dayWiseStats,
        isLoading,
        error,
        refetch: fetchFollowups,
    };
} 
