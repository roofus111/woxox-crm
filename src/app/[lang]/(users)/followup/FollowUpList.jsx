'use client'
import React, { useState, useEffect, useMemo, memo, useCallback, useRef, useIntersectionObserver } from 'react';
import { format, isToday, isYesterday, isTomorrow, isThisWeek, isThisMonth } from 'date-fns';

// Enhanced color palette
const THEME_COLORS = {
    primary: {
        light: 'bg-indigo-50',
        main: 'bg-indigo-500',
        dark: 'bg-indigo-600',
        text: 'text-indigo-700',
        border: 'border-indigo-200'
    },
    status: {
        pending: {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-200'
        },
        inprogress: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-200'
        },
        closed: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-800',
            border: 'border-emerald-200'
        },
        cancelled: {
            bg: 'bg-rose-100',
            text: 'text-rose-800',
            border: 'border-rose-200'
        },
        default: {
            bg: 'bg-slate-100',
            text: 'text-slate-800',
            border: 'border-slate-200'
        }
    }
};

// Date grouping function
const getDateGroup = (date) => {
    const dateObj = new Date(date);
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    if (isThisWeek(dateObj)) return 'This Week';
    if (isThisMonth(dateObj)) return 'This Month';
    return format(dateObj, 'MMMM yyyy');
};

// Enhanced StatsCard with gradient
const StatsCard = memo(({ title, value, icon: Icon, color = 'indigo' }) => (
    <div className={`bg-gradient-to-br from-${color}-500 to-${color}-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}>
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-sm text-white/80">{title}</h3>
                <p className="text-3xl font-bold text-white mt-1">{value || 0}</p>
            </div>
            {Icon && <Icon className="w-10 h-10 text-white/70" />}
        </div>
    </div>
));

// Enhanced FilterButton with animation
const FilterButton = memo(({ active, onClick, children }) => (
    <button
        className={`px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${active
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
        onClick={onClick}
    >
        {children}
    </button>
));

const SearchInput = memo(({ value, onChange }) => (
    <input
        type="text"
        placeholder="Search by name, phone, or notes..."
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={e => onChange(e.target.value)}
    />
));

const Tag = memo(({ color, name }) => (
    <span
        className="px-2 py-1 rounded-full text-xs"
        style={{ backgroundColor: color + '20', color }}
    >
        {name}
    </span>
));

// Date Group Header
const DateGroupHeader = memo(({ date }) => (
    <div className="sticky top-0 bg-gray-50 p-3 border-b z-10">
        <h2 className="text-lg font-semibold text-gray-700">{date}</h2>
    </div>
));

// Enhanced FollowUpCard
const FollowUpCard = memo(({ followUp, statusColor }) => {
    const formattedDates = useMemo(() => ({
        followUpDate: format(new Date(followUp.followUpDate), 'MMM dd, yyyy'),
        nextFollowUpDate: format(new Date(followUp.nextFollowUpDate), 'MMM dd, yyyy')
    }), [followUp.followUpDate, followUp.nextFollowUpDate]);

    return (
        <div className="border-b p-6 hover:bg-gray-50/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{followUp.leadId?.name || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">{followUp.leadId?.phone || 'N/A'}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                    {followUp.status || 'N/A'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                    <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">👤 Assigned To:</span> {followUp.assignedTo?.name || 'N/A'}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">📝 Created By:</span> {followUp.createdBy?.name || 'N/A'}
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">📅 Follow-up:</span> {formattedDates.followUpDate}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">⏰ Next Follow-up:</span> {formattedDates.nextFollowUpDate}
                    </p>
                </div>
            </div>

            {followUp.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-700">{followUp.notes}</p>
                </div>
            )}

            {followUp.leadId?.tags?.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                    {followUp.leadId.tags.map((tag) => (
                        <span
                            key={tag._id}
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: `${tag.color}15`,
                                color: tag.color,
                                border: `1px solid ${tag.color}30`
                            }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
});

// Add new LoadingIndicator component
const LoadingIndicator = memo(() => (
    <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
));

// Add IntersectionObserver component
const LoadMoreTrigger = memo(({ onIntersect }) => {
    const triggerRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onIntersect();
                }
            },
            { threshold: 0.1 }
        );

        const currentTrigger = triggerRef.current;
        if (currentTrigger) {
            observer.observe(currentTrigger);
        }

        return () => {
            if (currentTrigger) {
                observer.unobserve(currentTrigger);
            }
        };
    }, [onIntersect]);

    return <div ref={triggerRef} className="h-10" />;
});

const FollowUpList = ({
    followUps,
    stats,
    dateRange,
    onRefresh,
    onLoadMore,
    hasMore,
    loading
}) => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'followUpDate', direction: 'asc' });

    const getStatusColor = useCallback((status) => {
        return THEME_COLORS.status[status?.toLowerCase()] || THEME_COLORS.status.default;
    }, []);

    const filteredAndSortedFollowUps = useMemo(() => {
        let filtered = [...followUps];

        if (selectedFilter !== 'all') {
            filtered = filtered.filter(f =>
                f.status?.toLowerCase() === selectedFilter.toLowerCase()
            );
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(f =>
                f.leadId?.name?.toLowerCase().includes(search) ||
                f.leadId?.phone?.includes(search) ||
                f.notes?.toLowerCase().includes(search)
            );
        }

        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.direction === 'asc') {
                return aValue < bValue ? -1 : 1;
            } else {
                return aValue > bValue ? -1 : 1;
            }
        });

        return filtered;
    }, [followUps, selectedFilter, searchTerm, sortConfig]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loading) {
            onLoadMore();
        }
    }, [hasMore, loading, onLoadMore]);

    const groupedFollowUps = useMemo(() => {
        const grouped = filteredAndSortedFollowUps.reduce((acc, followUp) => {
            const dateGroup = getDateGroup(followUp.followUpDate);
            if (!acc[dateGroup]) {
                acc[dateGroup] = [];
            }
            acc[dateGroup].push(followUp);
            return acc;
        }, {});

        return Object.entries(grouped).sort((a, b) => {
            const dateA = new Date(a[1][0].followUpDate);
            const dateB = new Date(b[1][0].followUpDate);
            return dateA - dateB;
        });
    }, [filteredAndSortedFollowUps]);

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Assigned to Me" value={stats.assignedToMe} color="indigo" />
                <StatsCard title="Created by Me (For Others)" value={stats.createdByMeForOthers} color="purple" />
                <StatsCard title="Created by Me (For Me)" value={stats.createdByMeForMe} color="blue" />
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
                <SearchInput value={searchTerm} onChange={setSearchTerm} />

                <div className="flex flex-wrap gap-3">
                    <FilterButton
                        active={selectedFilter === 'all'}
                        onClick={() => setSelectedFilter('all')}
                    >
                        All
                    </FilterButton>
                    <FilterButton
                        active={selectedFilter === 'pending'}
                        onClick={() => setSelectedFilter('pending')}
                    >
                        Pending
                    </FilterButton>
                    <FilterButton
                        active={selectedFilter === 'closed'}
                        onClick={() => setSelectedFilter('closed')}
                    >
                        Closed
                    </FilterButton>
                </div>
            </div>

            {/* Grouped Follow-ups List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {groupedFollowUps.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-xl font-semibold text-gray-500">No follow-ups found</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    <>
                        {groupedFollowUps.map(([dateGroup, followUpsInGroup]) => (
                            <div key={dateGroup}>
                                <DateGroupHeader date={dateGroup} />
                                {followUpsInGroup.map((followUp) => (
                                    <FollowUpCard
                                        key={followUp._id}
                                        followUp={followUp}
                                        statusColor={getStatusColor(followUp.status)}
                                    />
                                ))}
                            </div>
                        ))}

                        {hasMore && <LoadMoreTrigger onIntersect={handleLoadMore} />}
                        {loading && <LoadingIndicator />}
                    </>
                )}
            </div>

            {/* Refresh Button */}
            <div className="text-center">
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg
                        hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105
                        disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
        </div>
    );
};

export default memo(FollowUpList);
