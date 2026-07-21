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
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
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
    Legend
} from "recharts";

// Format percentage values
const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
};

// Format date values
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Prepare data for charts
const prepareUserData = (userBreakdown) => {
    if (!userBreakdown) return [];
    return Object.entries(userBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const preparePipelineData = (pipelineBreakdown) => {
    if (!pipelineBreakdown) return [];
    return Object.entries(pipelineBreakdown).map(([name, count]) => ({
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

const prepareCampaignPerformanceData = (campaignPerformance) => {
    if (!campaignPerformance) return [];
    return campaignPerformance.map(campaign => ({
        name: campaign.name,
        totalLeads: campaign.totalLeads,
        convertedLeads: campaign.convertedLeads,
        conversionRate: campaign.conversionRate
    }));
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

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

export default function CampaignsDashboard() {
    const [activeTab, setActiveTab] = useState(0);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/insights/campaigns/insights`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data) {
                throw new Error('No data received from the server');
            }

            setDashboardData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching campaign insights:', err);

            // Provide more specific error messages based on the error type
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.status === 401 || err.response.status === 403) {
                    setError('Authentication error. Please log in again.');
                } else if (err.response.status === 404) {
                    setError('Campaign insights data not found. The API endpoint may have changed.');
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

    useEffect(() => {
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
                    No campaign data is available to display.
                </Alert>
            </Box>
        );
    }

    const userData = prepareUserData(dashboardData.userBreakdown);
    const pipelineData = preparePipelineData(dashboardData.pipelineBreakdown);
    const monthlyData = prepareMonthlyData(dashboardData.monthlyTrends);
    const campaignPerformanceData = prepareCampaignPerformanceData(dashboardData.campaignPerformance);

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Campaigns Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
                    <Tab label="Overview" />
                    <Tab label="Campaign Performance" />
                    <Tab label="Team & Pipeline" />
                    <Tab label="Trends" />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Total Campaigns</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.totalCampaigns}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Across all pipelines
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Active Campaigns</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.activeCampaigns}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatPercentage((dashboardData.overallSummary.activeCampaigns / dashboardData.overallSummary.totalCampaigns) * 100)} of total campaigns
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Total Leads Generated</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.totalLeadsGenerated}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    From all campaigns
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Avg. Leads Per Campaign</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.averageLeadsPerCampaign.toFixed(1)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Lead generation metric
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {dashboardData.topPerformingCampaigns.length > 0 ? (
                        <Grid item xs={12}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Top Performing Campaigns"
                                    subheader="Campaigns with highest conversion rates"
                                />
                                <CardContent>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Campaign Name</TableCell>
                                                    <TableCell>Owner</TableCell>
                                                    <TableCell align="right">Total Leads</TableCell>
                                                    <TableCell align="right">Converted Leads</TableCell>
                                                    <TableCell align="right">Conversion Rate</TableCell>
                                                    <TableCell>Created Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dashboardData.topPerformingCampaigns.map((campaign) => (
                                                    <TableRow key={campaign.id}>
                                                        <TableCell component="th" scope="row">
                                                            {campaign.name}
                                                        </TableCell>
                                                        <TableCell>{campaign.owner}</TableCell>
                                                        <TableCell align="right">{campaign.totalLeads}</TableCell>
                                                        <TableCell align="right">{campaign.convertedLeads}</TableCell>
                                                        <TableCell align="right">{formatPercentage(campaign.conversionRate)}</TableCell>
                                                        <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <Alert severity="info">
                                <AlertTitle>No Campaign Data</AlertTitle>
                                No campaign performance data is available to display.
                            </Alert>
                        </Grid>
                    )}

                    {campaignPerformanceData.length > 0 ? (
                        <Grid item xs={12}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Campaign Performance Comparison"
                                    subheader="Lead generation and conversion by campaign"
                                />
                                <CardContent>
                                    <Box sx={{ height: 400 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={campaignPerformanceData}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={70}
                                                />
                                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                                <Tooltip />
                                                <Legend />
                                                <Bar yAxisId="left" dataKey="totalLeads" name="Total Leads" fill="#8884d8" />
                                                <Bar yAxisId="left" dataKey="convertedLeads" name="Converted Leads" fill="#82ca9d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : null}
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Campaign Performance Details"
                                subheader="Detailed metrics for all campaigns"
                            />
                            <CardContent>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Campaign Name</TableCell>
                                                <TableCell>Owner</TableCell>
                                                <TableCell align="right">Total Leads</TableCell>
                                                <TableCell align="right">Converted Leads</TableCell>
                                                <TableCell align="right">Conversion Rate</TableCell>
                                                <TableCell>Created Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dashboardData.campaignPerformance.map((campaign) => (
                                                <TableRow key={campaign.id}>
                                                    <TableCell component="th" scope="row">
                                                        {campaign.name}
                                                    </TableCell>
                                                    <TableCell>{campaign.owner}</TableCell>
                                                    <TableCell align="right">{campaign.totalLeads}</TableCell>
                                                    <TableCell align="right">{campaign.convertedLeads}</TableCell>
                                                    <TableCell align="right">{formatPercentage(campaign.conversionRate)}</TableCell>
                                                    <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Conversion Rate Comparison"
                                subheader="Campaign effectiveness in converting leads"
                            />
                            <CardContent>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={campaignPerformanceData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={70}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                            <Legend />
                                            <Bar dataKey="conversionRate" name="Conversion Rate (%)" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Key Performance Metrics"
                                subheader="Important campaign indicators"
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Average Conversion Rate
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {formatPercentage(dashboardData.metrics.averageConversionRate)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Most Active Campaign Owner
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {dashboardData.metrics.mostActiveCampaignOwner}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Most Used Pipeline
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {dashboardData.metrics.mostUsedPipeline}
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
                                title="Campaign Ownership"
                                subheader="Campaigns by team member"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={userData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {userData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} campaigns`} />
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
                                title="Pipeline Distribution"
                                subheader="Campaigns by pipeline"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pipelineData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pipelineData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} campaigns`} />
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
                                subheader="Number of campaigns per team member"
                            />
                            <CardContent>
                                <List>
                                    {userData.map((user, index) => (
                                        <ListItem key={index} divider={index < userData.length - 1}>
                                            <ListItemText
                                                primary={user.name}
                                                secondary={`${((user.value / dashboardData.overallSummary.totalCampaigns) * 100).toFixed(1)}% of total campaigns`}
                                            />
                                            <Box sx={{ width: '60%', mr: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(user.value / dashboardData.overallSummary.totalCampaigns) * 100}
                                                    sx={{ height: 8, borderRadius: 5 }}
                                                />
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {user.value}
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
                                title="Pipeline Usage"
                                subheader="Number of campaigns per pipeline"
                            />
                            <CardContent>
                                <List>
                                    {pipelineData.map((pipeline, index) => (
                                        <ListItem key={index} divider={index < pipelineData.length - 1}>
                                            <ListItemText
                                                primary={pipeline.name}
                                                secondary={`${((pipeline.value / dashboardData.overallSummary.totalCampaigns) * 100).toFixed(1)}% of total campaigns`}
                                            />
                                            <Box sx={{ width: '60%', mr: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(pipeline.value / dashboardData.overallSummary.totalCampaigns) * 100}
                                                    sx={{ height: 8, borderRadius: 5 }}
                                                />
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {pipeline.value}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
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
                                    title="Monthly Campaign Trends"
                                    subheader="Campaign creation over time"
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
                                                <Tooltip formatter={(value) => `${value} campaigns`} />
                                                <Legend />
                                                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Campaign Count" />
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
                                title="Campaign Metrics"
                                subheader="Key campaign performance indicators"
                            />
                            <CardContent>
                                <List>
                                    <ListItem divider>
                                        <ListItemText
                                            primary="Total Campaigns"
                                            secondary="All campaigns in the system"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {dashboardData.overallSummary.totalCampaigns}
                                        </Typography>
                                    </ListItem>

                                    <ListItem divider>
                                        <ListItemText
                                            primary="Active Campaigns"
                                            secondary="Currently running campaigns"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {dashboardData.overallSummary.activeCampaigns}
                                        </Typography>
                                    </ListItem>

                                    <ListItem divider>
                                        <ListItemText
                                            primary="Total Leads Generated"
                                            secondary="Leads from all campaigns"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {dashboardData.overallSummary.totalLeadsGenerated}
                                        </Typography>
                                    </ListItem>

                                    <ListItem>
                                        <ListItemText
                                            primary="Average Conversion Rate"
                                            secondary="Across all campaigns"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatPercentage(dashboardData.metrics.averageConversionRate)}
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
                                subheader="Insights to improve campaign performance"
                            />
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {dashboardData.metrics.averageConversionRate < 10 && (
                                        <Alert severity="warning" variant="outlined">
                                            <AlertTitle>Low Conversion Rate</AlertTitle>
                                            Your average campaign conversion rate is {formatPercentage(dashboardData.metrics.averageConversionRate)}.
                                            Consider reviewing your lead qualification process or campaign targeting.
                                        </Alert>
                                    )}

                                    {dashboardData.overallSummary.totalCampaigns < 5 && (
                                        <Alert severity="info" variant="outlined">
                                            <AlertTitle>Campaign Diversity</AlertTitle>
                                            You currently have {dashboardData.overallSummary.totalCampaigns} campaigns.
                                            Consider creating more campaigns to target different segments or channels.
                                        </Alert>
                                    )}

                                    {dashboardData.overallSummary.averageLeadsPerCampaign < 20 && (
                                        <Alert severity="info" variant="outlined">
                                            <AlertTitle>Lead Generation</AlertTitle>
                                            Your campaigns generate an average of {dashboardData.overallSummary.averageLeadsPerCampaign.toFixed(1)} leads each.
                                            Consider expanding your reach or improving campaign visibility.
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
