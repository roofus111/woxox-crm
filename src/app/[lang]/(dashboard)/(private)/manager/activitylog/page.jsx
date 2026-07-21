"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { format, parseISO, subDays } from "date-fns";
import { Autocomplete } from '@mui/material';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardHeader,
    CardContent,
    Chip,
    Avatar,
    Divider,
    Button,
    Skeleton,
    Stack,
    Container,
    Grid,
    IconButton,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Toolbar,
    Tooltip,
    InputAdornment,
    Collapse,
    Alert,
    Pagination,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
    RiTimeLine,
    RiUserLine,
    RiGlobalLine,
    RiComputerLine,
    RiFilterLine,
    RiSortDesc,
    RiSearchLine,
    RiRefreshLine,
    RiArrowDownSLine,
    RiCloseLine,
    RiArrowUpSLine,
} from "react-icons/ri";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/navigation";

import { debounce } from "lodash";
import { Virtuoso } from "react-virtuoso";
import ResizableDrawer from "../leads/components/ResizableDrawer";

const ITEMS_PER_PAGE = 1000;
const ACTION_TYPES = ["assigned", "followUp", "converted", "created", "updated", "deleted"];

export default function ActivityLogPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const router = useRouter();

    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
    const [endDate, setEndDate] = useState(dayjs());
    const [assignedTo, setAssignedTo] = useState("");
    const [actionType, setActionType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("timestamp");
    const [sortDirection, setSortDirection] = useState("desc");
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    // Add search loading state
    const [searchLoading, setSearchLoading] = useState(false);

    // Add state to track expanded accordion panels
    const [expandedDate, setExpandedDate] = useState(null);

    // Optimize fetchActivityLogs with useCallback - define this FIRST
    const fetchActivityLogs = useCallback(async (resetPage = false) => {
        try {
            setLoading(true);
            setError(null);

            if (resetPage) {
                setPage(1);
            }

            const params = {
                page: resetPage ? 1 : page,
                limit: ITEMS_PER_PAGE,
                sort: `${sortDirection === 'desc' ? '-' : ''}${sortField}`,
            };

            if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
            if (endDate) params.endDate = endDate.format('YYYY-MM-DD');
            if (assignedTo) params.assignedTo = assignedTo;
            if (actionType) params.action = actionType;
            if (searchQuery) params.search = searchQuery;
            // NEW: Add tag filter parameter if tags are selected.
            if (selectedTags.length > 0) {
                params.tags = selectedTags.map(tag => tag._id).join(',');
            }

            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leadactivity/get/activitylogs`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Activity logs response:", response.data);

            // If selectedTags are active, apply client-side filtering
            if (selectedTags.length > 0 && response.data?.groupedActivities) {
                const selectedTagIds = selectedTags.map(tag => tag._id);
                const filteredGroupedActivities = response.data.groupedActivities.map(group => {
                    const filteredActivities = group.activities.filter(activity => {
                        const leadTagIds = activity.leadId?.tags?.map(t => (typeof t === 'object' ? t._id : t)) || [];
                        return selectedTagIds.every(id => leadTagIds.includes(id));
                    });
                    return { ...group, activities: filteredActivities };
                });
                response.data.groupedActivities = filteredGroupedActivities;
            }

            setActivityData(response.data);
        } catch (err) {
            console.error("Error fetching activity logs:", err);
            setError("Failed to load activity logs. Please try again later.");
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    }, [
        page, sortDirection, sortField, startDate, endDate,
        assignedTo, actionType, searchQuery, selectedTags
    ]);

    // Memoize and optimize data fetching
    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/users/active`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update to use response.data.data instead of response.data.users
            setUsers(response.data.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    }, []);

    // Debounced search function - now fetchActivityLogs is defined before this
    const debouncedSearch = useMemo(
        () =>
            debounce((query) => {
                setSearchQuery(query);
                if (query.length > 2 || query.length === 0) {
                    fetchActivityLogs(true);
                }
                setSearchLoading(false);
            }, 500),
        [fetchActivityLogs]
    );

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchLoading(true);
        debouncedSearch(query);
    };

    useEffect(() => {
        fetchUsers();
        fetchActivityLogs();
    }, [fetchUsers, fetchActivityLogs]);

    const handlePageChange = (event, value) => {
        setPage(value);
        fetchActivityLogs();
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        fetchActivityLogs(true);
    };

    const handleFilterApply = () => {
        fetchActivityLogs(true);
    };

    const handleFilterReset = () => {
        setStartDate(dayjs().subtract(30, 'day'));
        setEndDate(dayjs());
        setAssignedTo("");
        setActionType("");
        setSearchQuery("");
        setSortField("timestamp");
        setSortDirection("desc");
        setSelectedTags([]);
        setPage(1);
        fetchActivityLogs(true);
    };

    const getActionColor = (action) => {
        switch (action) {
            case "assigned":
                return "primary";
            case "followUp":
                return "success";
            case "converted":
                return "secondary";
            case "created":
                return "info";
            case "updated":
                return "warning";
            case "deleted":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "New":
                return "primary";
            case "Interested":
                return "success";
            case "Not Interested":
                return "error";
            case "Converted":
                return "secondary";
            case "Lost":
                return "warning";
            default:
                return "default";
        }
    };

    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), "MMM dd, yyyy");
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (dateString) => {
        try {
            return format(parseISO(dateString), "h:mm a");
        } catch (error) {
            return "";
        }
    };

    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <RiArrowUpSLine fontSize="small" /> : <RiArrowDownSLine fontSize="small" />;
    };

    useEffect(() => {
        const fetchTags = async () => {
            setLoadingTags(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/alltags`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Adjust based on the response format – check if it's an array directly or wrapped
                if (Array.isArray(response.data)) {
                    console.log("Tags response:", response.data);

                    setAllTags(response.data);
                } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    setAllTags(response.data.data);
                } else {
                    console.error("Unexpected tags response format:", response.data);
                }
            } catch (err) {
                console.error("Error fetching tags", err);
            }
            setLoadingTags(false);
        };

        fetchTags();
    }, []);

    const getActionIcon = (action) => {
        switch (action) {
            case "assigned":
                return <RiUserLine />;
            case "followUp":
                return <RiTimeLine />;
            case "converted":
                return <RiArrowUpSLine />;
            case "created":
                return <RiGlobalLine />;
            case "updated":
                return <RiRefreshLine />;
            case "deleted":
                return <RiCloseLine />;
            default:
                return <RiGlobalLine />;
        }
    };

    const handleLeadClick = (lead) => {
        // Add null/undefined check
        if (!lead || !lead._id) {
            console.warn('Invalid lead data:', lead);
            return;
        }
        setSelectedLead(lead);
        setOpenDrawer(true);
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setSelectedLead(null);
    };

    // Render activity item (for virtualization)
// Replace the renderActivity function in your ActivityLogPage component with this updated version:

const renderActivity = useCallback((index, group, activity) => (
    <Box
        sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' },
            '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
            transition: 'background-color 0.2s'
        }}
        onClick={() => activity.leadId?._id && router.push(`/en/manager/leads/byid/${activity.leadId._id}`)}
    >
        <Box display="flex" gap={2}>
            <Avatar
                onClick={(e) => {
                    e.stopPropagation();
                    if (activity.leadId && activity.leadId._id) {
                        handleLeadClick(activity.leadId);
                    }
                }}
                sx={{
                    bgcolor: getActionColor(activity.action) + '.light',
                    color: getActionColor(activity.action) + '.dark',
                    cursor: 'pointer',
                }}
            >
                {getActionIcon(activity.action)}
            </Avatar>

            <Box flexGrow={1}>
                <Box display="flex" flexWrap="wrap" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="subtitle1" component="span" fontWeight="medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activity.leadId && activity.leadId._id) {
                                handleLeadClick(activity.leadId);
                            }
                        }}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline',
                                color: 'primary.main'
                            }
                        }}
                    >
                        {activity.leadId?.name || "Unknown Lead"}
                    </Typography>
                    {activity.leadId?.status && (
                        <Chip
                            size="small"
                            label={activity.leadId.status}
                            color={getStatusColor(activity.leadId.status)}
                            sx={{ fontWeight: 'medium' }}
                        />
                    )}
                    <Chip
                        size="small"
                        label={activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                        color={getActionColor(activity.action)}
                        variant="outlined"
                    />
                    {/* Lead Tags */}
                    {activity.leadId?.tags && activity.leadId.tags.length > 0 &&
                        activity.leadId.tags.map((tag) => (
                            <Chip
                                key={tag._id}
                                icon={<i className="ri-price-tag-3-fill" style={{ color: tag.color }} />}
                                label={tag.name}
                                size="small"
                            />
                        ))
                    }
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {activity.details}
                </Typography>

                <Grid container spacing={2} sx={{ color: "text.secondary" }}>
                    <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <RiTimeLine size="1rem" style={{ opacity: 0.6 }} />
                            <Typography variant="caption">
                                {formatTime(activity.timestamp)}
                            </Typography>
                        </Box>
                    </Grid>
                    
                    {/* Activity User (who performed the action) */}
                    {activity.userId && (
                        <Grid item xs={6} sm={3}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <RiUserLine size="1rem" style={{ opacity: 0.6 }} />
                                <Typography variant="caption" noWrap>
                                    Action by: {activity.userId.name}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    
                    {/* Lead Assigned To (who the lead is assigned to) */}
                    {activity.leadId?.assignedTo && (
                        <Grid item xs={6} sm={3}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <RiUserLine size="1rem" style={{ opacity: 0.6, color: 'primary.main' }} />
                                <Typography variant="caption" noWrap sx={{ color: 'primary.main' }}>
                                    Assigned to: {activity.leadId.assignedTo.firstName} {activity.leadId.assignedTo.lastName}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    
                    {!isMobile && activity.ipAddress && (
                        <Grid item xs={6} sm={3}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <RiGlobalLine size="1rem" style={{ opacity: 0.6 }} />
                                <Typography variant="caption" noWrap>
                                    {activity.ipAddress}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    {!isMobile && activity.userAgent && (
                        <Grid item xs={6} sm={3}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <RiComputerLine size="1rem" style={{ opacity: 0.6 }} />
                                <Tooltip title={activity.userAgent} />
                                    <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                                        {activity.userAgent.split(" ")[0]}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Box>
        </Box>
), [isMobile, router]);

    const handleAccordionChange = (date) => (event, isExpanded) => {
        setExpandedDate(isExpanded ? date : null);
    };

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, bgcolor: "error.light" }}>
                    <Box textAlign="center" color="error.dark">
                        <Typography variant="h5" gutterBottom>Error Loading Data</Typography>
                        <Typography variant="body1" paragraph>{error}</Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setError(null);
                                fetchActivityLogs();
                            }}
                        >
                            Try Again
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>

            <Paper elevation={1} sx={{ mb: 3 }}>
                <Toolbar sx={{ px: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="h1">
                        Activity Logs
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search activities..."
                            variant="outlined"
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {searchLoading ? <CircularProgress size={20} /> : <RiSearchLine />}
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ display: { xs: 'none', md: 'flex' }, width: 250 }}
                        />

                        <Tooltip title="Filter">
                            <Button
                                variant="outlined"
                                startIcon={<RiFilterLine />}
                                onClick={() => setShowFilters(!showFilters)}
                                color={showFilters ? "primary" : "inherit"}
                            >
                                {!isTablet && "Filters"}
                            </Button>
                        </Tooltip>

                        <Tooltip title="Refresh">
                            <IconButton onClick={() => fetchActivityLogs()}>
                                <RiRefreshLine />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>

                <Collapse in={showFilters}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6} sx={{ display: { xs: 'block', md: 'none' } }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search activities..."
                                    variant="outlined"
                                    onChange={handleSearchChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {searchLoading ? <CircularProgress size={20} /> : <RiSearchLine />}
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(newValue) => setStartDate(newValue)}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End Date"
                                        value={endDate}
                                        onChange={(newValue) => setEndDate(newValue)}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Assigned To</InputLabel>
                                    <Select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        label="Assigned To"
                                    >
                                        <MenuItem value="">All Users</MenuItem>
                                        {users.map((user) => (
                                            <MenuItem key={user._id} value={user._id}>
                                                {user.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Action Type</InputLabel>
                                    <Select
                                        value={actionType}
                                        onChange={(e) => setActionType(e.target.value)}
                                        label="Action Type"
                                    >
                                        <MenuItem value="">All Actions</MenuItem>
                                        {ACTION_TYPES.map((action) => (
                                            <MenuItem key={action} value={action}>
                                                {action.charAt(0).toUpperCase() + action.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    multiple
                                    id="tags-filter"
                                    options={allTags}
                                    value={selectedTags}
                                    onChange={(event, newValue) => setSelectedTags(newValue)}
                                    getOptionLabel={(option) => option.name}
                                    loading={loadingTags}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <i
                                                className="ri-price-tag-3-fill"
                                                style={{ color: option.color, marginRight: 8 }}
                                            />
                                            {option.name}
                                        </li>
                                    )}
                                    renderTags={(tagValue, getTagProps) =>
                                        tagValue.map((option, index) => (
                                            <Chip
                                                key={option._id}
                                                label={option.name}
                                                icon={
                                                    <i
                                                        className="ri-price-tag-3-fill"
                                                        style={{ color: option.color }}
                                                    />
                                                }
                                                size="small"
                                                {...getTagProps({ index })}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label="Filter by Tags"
                                            placeholder="Select Tags"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingTags ? <CircularProgress size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        onClick={handleFilterReset}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleFilterApply}
                                    >
                                        Apply Filters
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>

                <Divider />

                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {activityData ?
                            `Showing ${activityData?.groupedActivities?.reduce((acc, group) => acc + group.activities.length, 0)} of ${activityData.totalActivities} activities` :
                            'Loading activities...'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl size="small" variant="outlined" sx={{ minWidth: 150 }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortField}
                                onChange={(e) => handleSort(e.target.value)}
                                label="Sort By"
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                            sx={{ mr: 1 }}
                                        >
                                            {sortDirection === 'asc' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="timestamp">Date & Time</MenuItem>
                                <MenuItem value="action">Action</MenuItem>
                                <MenuItem value="leadId.name">Lead Name</MenuItem>
                                <MenuItem value="leadId.status">Lead Status</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Paper>


            {loading && !activityData ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {!activityData?.groupedActivities?.length ? (

                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>No activities found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try changing your search criteria or filters
                            </Typography>
                        </Paper>

                    ) : (

                        <Stack spacing={1.5}>
                            {activityData?.groupedActivities?.map((group) => (
                                <Accordion
                                    key={group.date}
                                    expanded={expandedDate === group.date}
                                    onChange={handleAccordionChange(group.date)}
                                    TransitionProps={{ unmountOnExit: true }}
                                    elevation={1}
                                    disableGutters
                                >
                                    <AccordionSummary
                                        expandIcon={<RiArrowDownSLine />}
                                        sx={{
                                            bgcolor: 'primary.50',
                                            '&:hover': { bgcolor: 'primary.100' },
                                            transition: 'background-color 0.2s',
                                            borderRadius: expandedDate === group.date ? '4px 4px 0 0' : '4px'
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%',
                                            pr: 2
                                        }}>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {formatDate(group.date)}
                                            </Typography>
                                            <Chip
                                                label={`${group.activities.length} ${group.activities.length === 1 ? 'activity' : 'activities'}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ ml: 2 }}
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        {group.activities.length > 20 ? (
                                            <Box sx={{ height: Math.min(600, group.activities.length * 100) }}>
                                                <Virtuoso
                                                    data={group.activities}
                                                    itemContent={(index, activity) => renderActivity(index, group, activity)}
                                                    overscan={200}
                                                />
                                            </Box>
                                        ) : (
                                            <Box>
                                                {group.activities.map((activity, index) =>
                                                    renderActivity(index, group, activity)
                                                )}
                                            </Box>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>

                    )}

                    <ResizableDrawer
                        open={openDrawer}
                        onClose={handleCloseDrawer}
                        defaultWidth={600}
                        minWidth={400}
                        maxWidth={800}
                        leadId={selectedLead?._id}
                        leadData={selectedLead}
                    >
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>
                                Lead Details
                            </Typography>
                            {selectedLead && selectedLead._id ? (
                                <>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Name:</strong> {selectedLead.name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Status:</strong> {selectedLead.status || 'N/A'}
                                    </Typography>
                                    {selectedLead.email && (
                                        <Typography variant="body1" gutterBottom>
                                            <strong>Email:</strong> {selectedLead.email}
                                        </Typography>
                                    )}
                                    {selectedLead.phone && (
                                        <Typography variant="body1" gutterBottom>
                                            <strong>Phone:</strong> {selectedLead.phone}
                                        </Typography>
                                    )}
                                    {selectedLead.tags && selectedLead.tags.length > 0 && (
                                        <Box mt={2} mb={2}>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Tags:</strong>
                                            </Typography>
                                            <Box display="flex" flexWrap="wrap" gap={1}>
                                                {selectedLead.tags.map((tag) => (
                                                    <Chip
                                                        key={tag._id}
                                                        size="small"
                                                        label={tag.name}
                                                        icon={<i className="ri-price-tag-3-fill" style={{ color: tag.color }}></i>}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Typography>No lead data available</Typography>
                            )}
                            <Box sx={{ mt: 3 }}>
                                <Button variant="contained" color="primary" onClick={handleCloseDrawer}>
                                    Close
                                </Button>
                            </Box>
                        </Box>
                    </ResizableDrawer>

                    {activityData && activityData.totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination
                                count={activityData.totalPages}
                                page={activityData.currentPage || page}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                                size={isMobile ? "small" : "medium"}
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
}
