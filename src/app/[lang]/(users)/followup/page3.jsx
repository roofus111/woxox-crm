'use client'
import { useEffect, useState, useCallback } from 'react';
import FollowUpList from './FollowUpList';
import Loading from './loading';

const API_ENDPOINT = 'http://localhost:8000/api/followups/v2/gettasks';
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 20; // Number of items per page

function App() {
    const [state, setState] = useState({
        data: null,
        loading: true,
        error: null,
        page: 1,
        hasMore: true
    });

    const fetchFollowUps = useCallback(async (page = 1, append = false) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_ENDPOINT}?page=${page}&limit=${PAGE_SIZE}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newData = await response.json();

            if (!newData.followUps || !Array.isArray(newData.followUps)) {
                throw new Error('Invalid data format received');
            }

            setState(prev => ({
                ...prev,
                data: append && prev.data
                    ? {
                        ...newData,
                        followUps: [...prev.data.followUps, ...newData.followUps]
                    }
                    : newData,
                loading: false,
                error: null,
                page,
                hasMore: newData.followUps.length === PAGE_SIZE
            }));

        } catch (err) {
            console.error('Error fetching follow-ups:', err);
            setState(prev => ({
                ...prev,
                error: err.message,
                loading: false
            }));
        }
    }, []);

    const loadMore = useCallback(() => {
        if (state.hasMore && !state.loading) {
            fetchFollowUps(state.page + 1, true);
        }
    }, [state.hasMore, state.loading, state.page, fetchFollowUps]);

    useEffect(() => {
        fetchFollowUps();

        const pollInterval = setInterval(() => fetchFollowUps(1, false), POLL_INTERVAL);

        return () => {
            clearInterval(pollInterval);
        };
    }, [fetchFollowUps]);

    const { data, loading, error, hasMore } = state;

    if (loading && !data) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Error Loading Follow-ups</h3>
                <p>{error}</p>
                <button
                    onClick={() => fetchFollowUps(1, false)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <FollowUpList
                followUps={data?.followUps || []}
                stats={data?.stats || {
                    assignedToMe: 0,
                    createdByMeForOthers: 0,
                    createdByMeForMe: 0
                }}
                dateRange={data?.dateRange || {}}
                onRefresh={() => fetchFollowUps(1, false)}
                onLoadMore={loadMore}
                hasMore={hasMore}
                loading={loading}
            />
        </div>
    );
}

export default App;
