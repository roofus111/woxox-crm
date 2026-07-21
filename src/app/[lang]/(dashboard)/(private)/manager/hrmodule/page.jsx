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
    Paper,
    Divider,
    Avatar,
    Stack,
    Chip
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

// Format currency values
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
};

// Format date values
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Prepare data for charts
const prepareDepartmentData = (departmentBreakdown) => {
    if (!departmentBreakdown) return [];
    return Object.entries(departmentBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareJobTitleData = (jobTitleBreakdown) => {
    if (!jobTitleBreakdown) return [];
    return Object.entries(jobTitleBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareRoleData = (roleBreakdown) => {
    if (!roleBreakdown) return [];
    return Object.entries(roleBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareGenderData = (genderBreakdown) => {
    if (!genderBreakdown) return [];
    return Object.entries(genderBreakdown).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareTenureData = (tenureDistribution) => {
    if (!tenureDistribution) return [];
    return Object.entries(tenureDistribution).map(([name, count]) => ({
        name,
        value: count
    }));
};

const prepareHiringTrendsData = (hiringTrends) => {
    if (!hiringTrends) return [];
    return Object.entries(hiringTrends).map(([month, data]) => ({
        month,
        count: data.count
    }));
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
const GENDER_COLORS = {
    'Male': '#0088FE',
    'Female': '#FF8042',
    'Unspecified': '#AAAAAA'
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

export default function HRDashboard() {
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/insights/hr/insights`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data) {
                throw new Error('No data received from the server');
            }

            setDashboardData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching HR insights:', err);

            // Provide more specific error messages based on the error type
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.status === 401 || err.response.status === 403) {
                    setError('Authentication error. Please log in again.');
                } else if (err.response.status === 404) {
                    setError('HR insights data not found. The API endpoint may have changed.');
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
                    No HR data is available to display.
                </Alert>
            </Box>
        );
    }

    const departmentData = prepareDepartmentData(dashboardData.departmentBreakdown);
    const jobTitleData = prepareJobTitleData(dashboardData.jobTitleBreakdown);
    const roleData = prepareRoleData(dashboardData.roleBreakdown);
    const genderData = prepareGenderData(dashboardData.genderBreakdown);
    const tenureData = prepareTenureData(dashboardData.tenureAnalysis.tenureDistribution);
    const hiringTrendsData = prepareHiringTrendsData(dashboardData.hiringTrends);

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                HR Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
                    <Tab label="Overview" />
                    <Tab label="Demographics" />
                    <Tab label="Compensation" />
                    <Tab label="Activity" />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Total Employees</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.totalEmployees}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Across all departments
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Active Employees</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.activeEmployees}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatPercentage(dashboardData.overallSummary.activePercentage)} of total workforce
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Average Tenure</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.tenureAnalysis.averageTenure.toFixed(1)} months
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Longest: {dashboardData.tenureAnalysis.longestTenure} months
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Average Salary</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {formatCurrency(dashboardData.salaryStats?.averageSalary)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Median: {formatCurrency(dashboardData.salaryStats?.medianSalary)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Department Distribution"
                                subheader="Employees by department"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={departmentData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {departmentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} employees`} />
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
                                title="Gender Distribution"
                                subheader="Employees by gender"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {genderData.map((entry) => (
                                                    <Cell key={`cell-${entry.name}`} fill={GENDER_COLORS[entry.name] || COLORS[0]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} employees`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Hiring Trends"
                                subheader="New employees over time"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={hiringTrendsData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${value} employees`} />
                                            <Legend />
                                            <Line type="monotone" dataKey="count" stroke="#8884d8" name="New Hires" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Recent Activities"
                                subheader="Latest HR events"
                            />
                            <CardContent>
                                <List>
                                    {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                                        <ListItem key={index} divider={index < 4}>
                                            <ListItemText
                                                primary={activity.description}
                                                secondary={formatDate(activity.changedAt)}
                                            />
                                            <Chip
                                                label={activity.activityType}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
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
                                title="Department Breakdown"
                                subheader="Employee distribution by department"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={departmentData}
                                            layout="vertical"
                                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={80} />
                                            <Tooltip formatter={(value) => `${value} employees`} />
                                            <Legend />
                                            <Bar dataKey="value" name="Employees" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Role Distribution"
                                subheader="Employees by role"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={roleData}
                                            layout="vertical"
                                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={80} />
                                            <Tooltip formatter={(value) => `${value} employees`} />
                                            <Legend />
                                            <Bar dataKey="value" name="Employees" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Gender Diversity"
                                subheader="Gender distribution across workforce"
                            />
                            <CardContent>
                                <List>
                                    {genderData.map((gender, index) => (
                                        <ListItem key={index} divider={index < genderData.length - 1}>
                                            <ListItemText
                                                primary={gender.name}
                                                secondary={`${((gender.value / dashboardData.overallSummary.totalEmployees) * 100).toFixed(1)}% of total employees`}
                                            />
                                            <Box sx={{ width: '60%', mr: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(gender.value / dashboardData.overallSummary.totalEmployees) * 100}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5,
                                                        backgroundColor: theme.palette.grey[200],
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: GENDER_COLORS[gender.name] || COLORS[0]
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {gender.value}
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
                                title="Tenure Distribution"
                                subheader="Employee tenure breakdown"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={tenureData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {tenureData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} employees`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Key Demographics Metrics"
                                subheader="Important workforce indicators"
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Largest Department
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {dashboardData.metrics.largestDepartment}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {dashboardData.departmentBreakdown[dashboardData.metrics.largestDepartment]} employees
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Most Common Role
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {dashboardData.metrics.mostCommonRole}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {dashboardData.roleBreakdown[dashboardData.metrics.mostCommonRole]} employees
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Average Tenure
                                                </Typography>
                                                <Typography variant="h6" component="div" fontWeight="bold">
                                                    {dashboardData.tenureAnalysis.averageTenure.toFixed(1)} months
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {tenureData[0]?.name}: {tenureData[0]?.value} employees
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
                                title="Salary Statistics"
                                subheader="Key compensation metrics"
                            />
                            <CardContent>
                                <List>
                                    <ListItem divider>
                                        <ListItemText
                                            primary="Average Salary"
                                            secondary="Across all employees"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.averageSalary)}
                                        </Typography>
                                    </ListItem>

                                    <ListItem divider>
                                        <ListItemText
                                            primary="Median Salary"
                                            secondary="Middle value of all salaries"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.medianSalary)}
                                        </Typography>
                                    </ListItem>

                                    <ListItem divider>
                                        <ListItemText
                                            primary="Minimum Salary"
                                            secondary="Lowest salary"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.minSalary)}
                                        </Typography>
                                    </ListItem>

                                    <ListItem>
                                        <ListItemText
                                            primary="Maximum Salary"
                                            secondary="Highest salary"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.maxSalary)}
                                        </Typography>
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Salary Range Distribution"
                                subheader="Visualization of salary ranges"
                            />
                            <CardContent>
                                <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="body2" sx={{ width: 120 }}>Minimum</Typography>
                                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={0}
                                                sx={{ height: 20, borderRadius: 1 }}
                                            />
                                        </Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.minSalary)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="body2" sx={{ width: 120 }}>Average</Typography>
                                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(dashboardData.salaryStats?.averageSalary - dashboardData.salaryStats?.minSalary) /
                                                    (dashboardData.salaryStats?.maxSalary - dashboardData.salaryStats?.minSalary) * 100}
                                                sx={{ height: 20, borderRadius: 1 }}
                                            />
                                        </Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.averageSalary)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="body2" sx={{ width: 120 }}>Median</Typography>
                                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(dashboardData.salaryStats?.medianSalary - dashboardData.salaryStats?.minSalary) /
                                                    (dashboardData.salaryStats?.maxSalary - dashboardData.salaryStats?.minSalary) * 100}
                                                sx={{ height: 20, borderRadius: 1 }}
                                            />
                                        </Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.medianSalary)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ width: 120 }}>Maximum</Typography>
                                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={100}
                                                sx={{ height: 20, borderRadius: 1 }}
                                            />
                                        </Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            {formatCurrency(dashboardData.salaryStats?.maxSalary)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Compensation Insights"
                                subheader="Analysis and recommendations"
                            />
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {dashboardData.salaryStats?.maxSalary / dashboardData.salaryStats?.minSalary > 10 && (
                                        <Alert severity="info" variant="outlined">
                                            <AlertTitle>High Salary Disparity</AlertTitle>
                                            There is a significant gap between the highest and lowest salaries in your organization.
                                            Consider reviewing compensation structures to ensure fair pay practices.
                                        </Alert>
                                    )}

                                    {Math.abs(dashboardData.salaryStats?.averageSalary - dashboardData.salaryStats?.medianSalary) /
                                        dashboardData.salaryStats?.medianSalary > 0.2 && (
                                            <Alert severity="info" variant="outlined">
                                                <AlertTitle>Salary Distribution Skew</AlertTitle>
                                                The difference between average and median salaries indicates a skewed distribution.
                                                This could mean a few high earners are pulling up the average.
                                            </Alert>
                                        )}

                                    <Alert severity="success" variant="outlined">
                                        <AlertTitle>Compensation Planning</AlertTitle>
                                        Based on your current salary structure, consider conducting a market comparison
                                        to ensure your compensation remains competitive for talent acquisition and retention.
                                    </Alert>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Recent HR Activities"
                                subheader="Latest employee-related events"
                            />
                            <CardContent>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Activity Type</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Date & Time</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dashboardData.recentActivities.map((activity, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Chip
                                                            label={activity.activityType}
                                                            color={activity.activityType.includes("created") ? "success" : "primary"}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{activity.description}</TableCell>
                                                    <TableCell>{formatDate(activity.changedAt)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Hiring Trends"
                                subheader="Employee onboarding over time"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={hiringTrendsData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${value} employees`} />
                                            <Legend />
                                            <Bar dataKey="count" fill="#8884d8" name="New Hires" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Activity Summary"
                                subheader="HR operations overview"
                            />
                            <CardContent>
                                <List>
                                    <ListItem divider>
                                        <ListItemText
                                            primary="Total Activities"
                                            secondary="Recent HR operations"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {dashboardData.recentActivities.length}
                                        </Typography>
                                    </ListItem>

                                    <ListItem divider>
                                        <ListItemText
                                            primary="New Employees (Last 30 Days)"
                                            secondary="Recently onboarded staff"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {hiringTrendsData.reduce((total, month) => total + month.count, 0)}
                                        </Typography>
                                    </ListItem>

                                    <ListItem>
                                        <ListItemText
                                            primary="Most Active HR Operation"
                                            secondary="Most common activity type"
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {dashboardData.recentActivities[0]?.activityType || "N/A"}
                                        </Typography>
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Total Employees</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.overallSummary.totalEmployees}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatPercentage(dashboardData.overallSummary.activePercentage)} active
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Average Tenure</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.tenureAnalysis.averageTenure.toFixed(1)} months
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Longest: {dashboardData.tenureAnalysis.longestTenure} months
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Average Salary</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {formatCurrency(dashboardData.salaryStats?.averageSalary)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Median: {formatCurrency(dashboardData.salaryStats?.medianSalary)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Recent Activities</Typography>
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold">
                                    {dashboardData.recentActivities.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Last: {formatDate(dashboardData.recentActivities[0]?.changedAt).split(',')[0]}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Department Distribution"
                                subheader="Employees by department"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={departmentData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {departmentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} employees`} />
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
                                title="Role Distribution"
                                subheader="Employees by role"
                            />
                            <CardContent>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={roleData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" />
                                            <Tooltip formatter={(value) => `${value} employees`} />
                                            <Bar dataKey="value" fill="#8884d8" name="Employees" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Workforce Insights"
                                subheader="Key observations and recommendations"
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Alert severity="info" sx={{ height: '100%' }}>
                                            <AlertTitle>Department Balance</AlertTitle>
                                            <Typography variant="body2">
                                                {dashboardData.metrics.largestDepartment} is your largest department with
                                                {' '}{dashboardData.departmentBreakdown[dashboardData.metrics.largestDepartment]} employees
                                                ({formatPercentage(dashboardData.departmentBreakdown[dashboardData.metrics.largestDepartment] /
                                                    dashboardData.overallSummary.totalEmployees * 100)} of workforce).
                                            </Typography>
                                        </Alert>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Alert severity="warning" sx={{ height: '100%' }}>
                                            <AlertTitle>Tenure Distribution</AlertTitle>
                                            <Typography variant="body2">
                                                {tenureData[0]?.value} employees ({formatPercentage(tenureData[0]?.value /
                                                    dashboardData.overallSummary.totalEmployees * 100)}) have been with the company
                                                for {tenureData[0]?.name.toLowerCase()}.
                                            </Typography>
                                        </Alert>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Alert severity="success" sx={{ height: '100%' }}>
                                            <AlertTitle>Gender Diversity</AlertTitle>
                                            <Typography variant="body2">
                                                Your workforce is {formatPercentage(dashboardData.genderBreakdown['Male'] /
                                                    dashboardData.overallSummary.totalEmployees * 100)} male and
                                                {' '}{formatPercentage(dashboardData.genderBreakdown['Female'] /
                                                    dashboardData.overallSummary.totalEmployees * 100)} female.
                                            </Typography>
                                        </Alert>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>
        </Box>
    );
}
