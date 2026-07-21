"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Tabs,
    Tab,
    Grid,
    List,
    ListItem,
    ListItemText,
    Alert,
    AlertTitle,
    useTheme,
    CircularProgress,
    LinearProgress,
    Button
} from "@mui/material";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    FunnelChart,
    Funnel,
    LabelList
} from "recharts";

// Format percentage values
const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
};

// Prepare data for charts
const prepareStatusData = (statusBreakdown) => {
    if (!statusBreakdown) return [];
    return Object.entries(statusBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareSourceConversionData = (sourceConversionBreakdown) => {
    if (!sourceConversionBreakdown) return [];

    return Object.entries(sourceConversionBreakdown).map(([name, data]) => ({
        name,
        totalLeads: data.total,
        convertedLeads: data.converted,
        conversionRate: data.conversionRate
    }));
};

const prepareSourceData = (sourceBreakdown) => {
    if (!sourceBreakdown) return [];
    return Object.entries(sourceBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareAssigneeData = (assignedToBreakdown) => {
    if (!assignedToBreakdown) return [];
    return Object.entries(assignedToBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareMonthlyData = (monthlyTrends) => {
    if (!monthlyTrends) return [];
    return Object.entries(monthlyTrends).map(([month, data]) => ({
        month,
        count: data.count
    }));
};

// Colors for charts
const STATUS_COLORS = {
    'New': '#2196f3',        // Blue
    'Contacted': '#ff9800',  // Orange
    'Interested': '#4caf50', // Green
    'Converted': '#8bc34a',  // Light Green
    'Not Interested': '#f44336', // Red
    'Lost': '#9e9e9e'       // Grey
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Custom Label Component for Pie Chart
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for small segments

    return (
        <text
            x={x}
            y={y}
            fill="#666"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="12px"
            fontWeight="500"
        >
            {`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
    );
};

// Custom Tab Panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const prepareFunnelData = (statusBreakdown, totalLeads) => {
    const stageOrder = ['New', 'Contacted', 'Interested', 'Converted'];
    const data = stageOrder.map(stage => ({
        name: stage,
        value: statusBreakdown[stage] || 0,
        fill: STATUS_COLORS[stage],
        percentage: ((statusBreakdown[stage] || 0) / totalLeads * 100).toFixed(1)
    }));

    // Calculate conversion rates between stages
    data.forEach((item, index) => {
        if (index > 0 && data[index - 1].value > 0) {
            item.conversionRate = ((item.value / data[index - 1].value) * 100).toFixed(1);
        }
    });

    return data;
};

export default function LeadsDashboard() {
    const [activeTab, setActiveTab] = useState(0);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Authentication token not found. Please log in again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/insights/leads/insights`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.data) {
                    throw new Error('No data received from the server');
                }
                console.log(response.data);

                setDashboardData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching lead insights:', err);

                // Provide more specific error messages based on the error type
                if (err.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (err.response.status === 401 || err.response.status === 403) {
                        setError('Authentication error. Please log in again.');
                    } else if (err.response.status === 404) {
                        setError('Lead insights data not found. The API endpoint may have changed.');
                    } else if (err.response.status >= 500) {
                        setError('Server error. Please try again later or contact support.');
                    } else {
                        setError(`Error: ${err.response.data.message || 'Failed to load dashboard data'}`);
                    }
                } else if (err.request) {
                    // The request was made but no response was received
                    setError('Network error. Please check your internet connection and try again.');
                } else {
                    // Something happened in setting up the request that triggered an Error
                    setError(`Error: ${err.message || 'Failed to load dashboard data. Please try again later.'}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // If data is loading, show loading indicator
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // If there's an error, show error message
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setLoading(true);
                                setError(null);
                                fetchInsights();
                            }}
                        >
                            Retry
                        </Button>
                    }
                >
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            </Box>
        );
    }

    // If no data is available yet, show a message
    if (!dashboardData) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">
                    <AlertTitle>No Data</AlertTitle>
                    No leads data is available to display.
                </Alert>
            </Box>
        );
    }

    const statusData = prepareStatusData(dashboardData.statusBreakdown);
    const sourceData = prepareSourceData(dashboardData.sourceBreakdown);
    const assigneeData = prepareAssigneeData(dashboardData.assignedToBreakdown);
    const monthlyData = prepareMonthlyData(dashboardData.monthlyTrends);

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Leads Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
                    <Tab label="Overview" />
                    <Tab label="Status & Sources" />
                    <Tab label="Team Performance" />
                    <Tab label="Trends" />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Total Leads</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.totalLeads}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Across all sources
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Converted Leads</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.convertedLeads}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatPercentage(dashboardData.overallSummary.conversionRate)} conversion rate
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Untouched Leads</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.untouchedLeads}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatPercentage(dashboardData.overallSummary.untouchedPercentage)} of total leads
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Avg. Notes Per Lead</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.metrics.averageNotesPerLead.toFixed(1)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Engagement metric
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {statusData.length > 0 ? (
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Lead Status Distribution"
                                    subheader="Breakdown of leads by current status"
                                />
                                <CardContent>
                                    <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={CustomPieLabel}
                                                    outerRadius={150}
                                                    innerRadius={80}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    animationBegin={0}
                                                    animationDuration={1500}
                                                    animationEasing="ease-out"
                                                >
                                                    {statusData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                                            strokeWidth={1}
                                                            stroke="#fff"
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        `${value} leads (${((value / dashboardData.overallSummary.totalLeads) * 100).toFixed(1)}%)`,
                                                        name
                                                    ]}
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        borderRadius: '8px',
                                                        padding: '8px 12px',
                                                        border: '1px solid #eee',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Legend
                                                    layout="horizontal"
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    wrapperStyle={{
                                                        paddingTop: '20px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                            Total Leads: {dashboardData.overallSummary.totalLeads}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        <Grid item xs={12} md={6}>
                            <Alert severity="info">
                                <AlertTitle>No Status Data</AlertTitle>
                                No lead status data is available to display.
                            </Alert>
                        </Grid>
                    )}

                    {sourceData.length > 0 ? (
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Lead Sources"
                                    subheader="Where your leads are coming from"
                                />
                                <CardContent>
                                    <Box sx={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={sourceData}
                                                layout="vertical"
                                                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" />
                                                <Tooltip formatter={(value) => `${value} leads`} />
                                                <Legend />
                                                <Bar dataKey="value" fill="#8884d8" name="Count" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        <Grid item xs={12} md={6}>
                            <Alert severity="info">
                                <AlertTitle>No Source Data</AlertTitle>
                                No lead source data is available to display.
                            </Alert>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Lead Pipeline Funnel"
                                subheader="Conversion rates through sales stages"
                            />
                            <CardContent>
                                <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <FunnelChart>
                                            <Tooltip
                                                formatter={(value, name, props) => [
                                                    `${value} leads (${props.payload.percentage}%)`,
                                                    `Stage: ${name}`,
                                                ]}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                    border: '1px solid #eee',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Funnel
                                                data={prepareFunnelData(dashboardData.statusBreakdown, dashboardData.overallSummary.totalLeads)}
                                                dataKey="value"
                                                nameKey="name"
                                                labelLine={true}
                                            >
                                                <LabelList
                                                    position="right"
                                                    fill="#666"
                                                    stroke="none"
                                                    dataKey={(entry) =>
                                                        `${entry.name}: ${entry.value} (${entry.percentage}%)`
                                                    }
                                                />
                                                {prepareFunnelData(dashboardData.statusBreakdown, dashboardData.overallSummary.totalLeads)
                                                    .map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                            </Funnel>
                                        </FunnelChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box sx={{ mt: 3, width: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom align="center" fontWeight="bold">
                                        Stage Conversion Rates
                                    </Typography>
                                    <Grid container spacing={2} justifyContent="center">
                                        {prepareFunnelData(dashboardData.statusBreakdown, dashboardData.overallSummary.totalLeads)
                                            .map((stage, index) => index > 0 && (
                                                <Grid item xs={12} sm={6} md={3} key={stage.name}>
                                                    <Card variant="outlined">
                                                        <CardContent>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                {`${stage.name} Rate`}
                                                            </Typography>
                                                            <Typography variant="h6" color={
                                                                parseFloat(stage.conversionRate) >= 50 ? 'success.main' :
                                                                    parseFloat(stage.conversionRate) >= 30 ? 'warning.main' :
                                                                        'error.main'
                                                            }>
                                                                {`${stage.conversionRate}%`}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                from {prepareFunnelData(dashboardData.statusBreakdown, dashboardData.overallSummary.totalLeads)[index - 1].name}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Lead Source Performance"
                                subheader="Total vs Converted Leads by Source (Sample Data)"
                            />
                            <CardContent>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepareSourceConversionData(dashboardData.sourceConversionBreakdown)}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={70}
                                            />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${value} leads`} />
                                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                            <Bar dataKey="totalLeads" name="Total Leads" fill="#0088FE" />
                                            <Bar dataKey="convertedLeads" name="Converted Leads" fill="#00C49F" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Alert severity="info">
                                        <AlertTitle>Source Conversion Data</AlertTitle>
                                        This chart shows the conversion performance of different lead sources.
                                    </Alert>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Lead Status Breakdown"
                                subheader="Current status of all leads"
                            />
                            <CardContent>
                                <List>
                                    {statusData.map((status, index) => (
                                        <ListItem key={index} divider={index < statusData.length - 1}>
                                            <ListItemText
                                                primary={status.name}
                                                secondary={`${((status.value / dashboardData.overallSummary.totalLeads) * 100).toFixed(1)}% of total leads`}
                                            />
                                            <Box sx={{ width: '60%', mr: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(status.value / dashboardData.overallSummary.totalLeads) * 100}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5,
                                                        backgroundColor: theme.palette.grey[200],
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: status.name === 'Converted' ? '#4caf50' :
                                                                status.name === 'Interested' ? '#2196f3' :
                                                                    status.name === 'New' ? '#ff9800' :
                                                                        status.name === 'Not Interested' ? '#f44336' :
                                                                            status.name === 'Lost' ? '#9e9e9e' : '#3f51b5'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {status.value}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Lead Sources"
                                subheader="Origin of your leads"
                            />
                            <CardContent>
                                <List>
                                    {sourceData.map((source, index) => (
                                        <ListItem key={index} divider={index < sourceData.length - 1}>
                                            <ListItemText
                                                primary={source.name}
                                                secondary={`${((source.value / dashboardData.overallSummary.totalLeads) * 100).toFixed(1)}% of total leads`}
                                            />
                                            <Box sx={{ width: '60%', mr: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(source.value / dashboardData.overallSummary.totalLeads) * 100}
                                                    sx={{ height: 8, borderRadius: 5 }}
                                                />
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {source.value}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Key Metrics"
                                subheader="Important lead indicators"
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Most Common Status
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {dashboardData.metrics.mostCommonStatus}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Most Common Source
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {dashboardData.metrics.mostCommonSource}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Conversion Rate
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {formatPercentage(dashboardData.overallSummary.conversionRate)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Untouched Rate
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {formatPercentage(dashboardData.overallSummary.untouchedPercentage)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Team Assignment"
                                subheader="Leads assigned to team members"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={assigneeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {assigneeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} leads`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Team Workload"
                                subheader="Number of leads per team member"
                            />
                            <CardContent>
                                <List>
                                    {assigneeData.map((assignee, index) => (
                                        <ListItem key={index} divider={index < assigneeData.length - 1}>
                                            <ListItemText
                                                primary={assignee.name}
                                                secondary={`${((assignee.value / dashboardData.overallSummary.totalLeads) * 100).toFixed(1)}% of total leads`}
                                            />
                                            <Box sx={{ width: '60%', mr: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(assignee.value / dashboardData.overallSummary.totalLeads) * 100}
                                                    sx={{ height: 8, borderRadius: 5 }}
                                                />
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {assignee.value}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Team Performance"
                                subheader="Key performance indicators by team member"
                            />
                            <CardContent>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <AlertTitle>Most Active Team Member</AlertTitle>
                                    <Typography variant="body1">
                                        <strong>{dashboardData.metrics.mostActiveAssignee}</strong> is currently handling the most leads.
                                    </Typography>
                                </Alert>

                                {dashboardData.overallSummary.untouchedPercentage > 50 && (
                                    <Alert severity="warning">
                                        <AlertTitle>High Untouched Rate</AlertTitle>
                                        <Typography variant="body1">
                                            {formatPercentage(dashboardData.overallSummary.untouchedPercentage)} of leads haven't been contacted yet.
                                            Consider redistributing workload among team members.
                                        </Typography>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <Grid container spacing={3}>
                    {monthlyData.length > 0 ? (
                        <Grid item xs={12}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Monthly Lead Trends"
                                    subheader="Lead acquisition over time"
                                />
                                <CardContent>
                                    <Box sx={{ height: 400 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={monthlyData}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip formatter={(value) => `${value} leads`} />
                                                <Legend />
                                                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Lead Count" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <Alert severity="info">
                                <AlertTitle>No Trend Data</AlertTitle>
                                No monthly trend data is available to display.
                            </Alert>
                        </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Conversion Metrics"
                                subheader="Lead conversion performance"
                            />
                            <CardContent>
                                <List>
                                    <ListItem divider>
                                        <ListItemText
                                            primary="Total Leads"
                                            secondary="All leads in the system"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {dashboardData.overallSummary.totalLeads}
                                        </Typography>
                                    </ListItem>

                                    <ListItem divider>
                                        <ListItemText
                                            primary="Converted Leads"
                                            secondary="Leads that became customers"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {dashboardData.overallSummary.convertedLeads}
                                        </Typography>
                                    </ListItem>

                                    <ListItem>
                                        <ListItemText
                                            primary="Conversion Rate"
                                            secondary="Percentage of leads converted"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatPercentage(dashboardData.overallSummary.conversionRate)}
                                        </Typography>
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Recommendations"
                                subheader="Insights to improve lead management"
                            />
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {dashboardData.overallSummary.untouchedPercentage > 30 && (
                                        <Alert severity="warning" variant="outlined">
                                            <AlertTitle>High Untouched Rate</AlertTitle>
                                            {formatPercentage(dashboardData.overallSummary.untouchedPercentage)} of leads haven't been contacted.
                                            Consider implementing an initial contact protocol to reduce this percentage.
                                        </Alert>
                                    )}

                                    {dashboardData.overallSummary.conversionRate < 15 && (
                                        <Alert severity="info" variant="outlined">
                                            <AlertTitle>Conversion Opportunity</AlertTitle>
                                            Your current conversion rate is {formatPercentage(dashboardData.overallSummary.conversionRate)}.
                                            Industry average is typically 15-20%. Consider reviewing your lead qualification process.
                                        </Alert>
                                    )}

                                    {dashboardData.metrics.averageNotesPerLead < 1 && (
                                        <Alert severity="info" variant="outlined">
                                            <AlertTitle>Engagement Insight</AlertTitle>
                                            Average notes per lead is {dashboardData.metrics.averageNotesPerLead.toFixed(1)}.
                                            Encourage team members to document all interactions to improve lead tracking.
                                        </Alert>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>
        </Box>
    );
} 
