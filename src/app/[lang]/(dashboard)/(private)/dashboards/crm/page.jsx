"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle,
  useTheme,
  CircularProgress
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
// import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import TrendingUpIcon from '@mui/icons-material/TrendingUp';
// import CreditCardIcon from '@mui/icons-material/CreditCard';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LeadsDashboard from "../leads/page";
import CampaignsDashboard from "../campaigns/page";
import { isCrmPlatformEnabled } from "@/libs/crmPlatformApi";
import StickyNotesOverlay, { MyStickyNotesWidget } from "@/components/notes/StickyNotesOverlay";

const CrmPlatformDashboard = dynamic(
  () => import("@/views/dashboards/crm/CrmPlatformDashboard"),
  { ssr: false, loading: () => null }
);
// Format currency values
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

// Format percentage values
const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(1)}%`;
};

// Prepare data for charts
const prepareCategoryData = (categoryBreakdown) => {
  if (!categoryBreakdown || Object.keys(categoryBreakdown).length === 0) return [];
  return Object.entries(categoryBreakdown).map(([name, data]) => ({
    name,
    value: data?.total || 0,
    count: data?.count || 0,
    type: data?.type || 'unknown'
  }));
};

const prepareMonthlyData = (monthlyTrends) => {
  if (!monthlyTrends || Object.keys(monthlyTrends).length === 0) return [];
  return Object.entries(monthlyTrends).map(([month, data]) => ({
    month,
    income: data?.income || 0,
    expenses: data?.expenses || 0,
    net: (data?.income || 0) - (data?.expenses || 0)
  }));
};

const prepareStatusData = (statusBreakdown) => {
  if (!statusBreakdown || Object.keys(statusBreakdown).length === 0) return [];
  return Object.entries(statusBreakdown).map(([name, count]) => ({
    name,
    value: count || 0
  }));
};

const prepareSourceData = (sourceBreakdown) => {
  if (!sourceBreakdown || Object.keys(sourceBreakdown).length === 0) return [];
  return Object.entries(sourceBreakdown).map(([name, count]) => ({
    name,
    value: count || 0
  }));
};

const prepareAssigneeData = (assignedToBreakdown) => {
  if (!assignedToBreakdown || Object.keys(assignedToBreakdown).length === 0) return [];
  return Object.entries(assignedToBreakdown).map(([name, count]) => ({
    name,
    value: count || 0
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

export default function CRMDashboard() {
  const platformMode = isCrmPlatformEnabled();
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(!platformMode);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (platformMode) return undefined;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/insights/accounts/overall-insights`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Axios already throws an error for non-2xx responses
        // and automatically parses JSON, so we can use response.data directly
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [platformMode]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (platformMode) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <CrmPlatformDashboard />
        <Box sx={{ mt: 3, maxWidth: 420 }}>
          <MyStickyNotesWidget />
        </Box>
        <StickyNotesOverlay pageKey='dashboard' />
      </Box>
    );
  }

  // If data is loading, show loading indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If there's an error, show error message
  // if (error) {
  //   return (
  //     <Box sx={{ p: 3 }}>
  //       <Alert severity="error">
  //         <AlertTitle>Error</AlertTitle>
  //         {error}
  //       </Alert>
  //     </Box>
  //   );
  // }

  // If no data is available yet, show a message
  if (!dashboardData) {
    return (
      <><Box sx={{ p: 3 }}>
        <Alert severity="info">
          <AlertTitle>No Data</AlertTitle>
          No financial data is available to display.
        </Alert>
      </Box><LeadsDashboard />
        <CampaignsDashboard /></>
    );
  }

  // Safely access nested properties with default values
  const overallSummary = dashboardData.overallSummary || {};
  const overallMetrics = dashboardData.overallMetrics || {};
  const accountMetrics = dashboardData.accountMetrics || {};

  const categoryData = prepareCategoryData(dashboardData.categoryBreakdown);
  const monthlyData = prepareMonthlyData(dashboardData.monthlyTrends);
  const statusData = prepareStatusData(dashboardData.statusBreakdown);
  const sourceData = prepareSourceData(dashboardData.sourceBreakdown);
  const assigneeData = prepareAssigneeData(dashboardData.assignedToBreakdown);

  return (
    <><Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Financial Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Accounts" />
          <Tab label="Transactions" />
          <Tab label="Trends" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Balance</Typography>
                  {/* <AttachMoneyIcon color="action" fontSize="small" /> */}
                </Box>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {formatCurrency(overallSummary.totalBalance)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across {overallSummary.totalAccounts || 0} accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Expenses</Typography>
                  {/* <ArrowDownwardIcon sx={{ color: theme.palette.error.main }} fontSize="small" /> */}
                </Box>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {formatCurrency(overallSummary.totalExpenses)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {overallSummary.totalTransactions || 0} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Net Cashflow</Typography>
                  {/* <TrendingUpIcon color="action" fontSize="small" /> */}
                </Box>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {formatCurrency(overallSummary.netCashflow)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(overallSummary.netCashflow || 0) >= 0 ? "Positive" : "Negative"} cash flow
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Avg. Transaction</Typography>
                  {/* <CreditCardIcon color="action" fontSize="small" /> */}
                </Box>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {formatCurrency(overallMetrics.averageTransactionSize)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Most used: {overallMetrics.mostUsedPaymentMethod || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {categoryData.length > 0 ? (
            <>
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardHeader
                    title="Expense Categories"
                    subheader="Breakdown of expenses by category" />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
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
                    title="Top Expenses"
                    subheader="Categories with highest spending" />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryData}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" name="Amount" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                <AlertTitle>No Category Data</AlertTitle>
                No expense category data is available to display.
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="Account Summary"
                subheader="Overview of all accounts" />
              <CardContent>
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Total Accounts"
                      secondary="Active financial accounts" />
                    <Typography variant="body1" fontWeight="bold">
                      {overallSummary.totalAccounts || 0}
                    </Typography>
                  </ListItem>

                  <ListItem divider>
                    <ListItemText
                      primary="Average Balance"
                      secondary="Per account" />
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(accountMetrics.averageAccountBalance)}
                    </Typography>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Account with Most Transactions"
                      secondary={`ID: ${accountMetrics.accountWithMostTransactions?.id ?
                        accountMetrics.accountWithMostTransactions.id.substring(0, 8) + '...' : 'N/A'}`} />
                    <Typography variant="body1" fontWeight="bold">
                      {accountMetrics.accountWithMostTransactions?.count || 0} transactions
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="Account Performance"
                subheader="Balance and transaction metrics" />
              <CardContent>
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Highest Balance Account"
                      secondary={`ID: ${accountMetrics.accountWithHighestBalance?.id ?
                        accountMetrics.accountWithHighestBalance.id.substring(0, 8) + '...' : 'N/A'}`} />
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(accountMetrics.accountWithHighestBalance?.balance)}
                    </Typography>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Total Balance"
                      secondary="Across all accounts" />
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(overallSummary.totalBalance)}
                    </Typography>
                  </ListItem>
                </List>
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
                title="Transaction Summary"
                subheader="Overview of recent transactions" />
              <CardContent>
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Total Transactions"
                      secondary="Number of transactions" />
                    <Typography variant="body1" fontWeight="bold">
                      {overallSummary.totalTransactions || 0}
                    </Typography>
                  </ListItem>

                  <ListItem divider>
                    <ListItemText
                      primary="Average Transaction Size"
                      secondary="Per transaction" />
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(overallMetrics.averageTransactionSize)}
                    </Typography>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Most Used Payment Method"
                      secondary="Preferred payment type" />
                    <Typography variant="body1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                      {overallMetrics.mostUsedPaymentMethod || 'N/A'}
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {categoryData.length > 0 ? (
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardHeader
                  title="Top Categories"
                  subheader="Most frequent transaction categories" />
                <CardContent>
                  <List>
                    {categoryData.map((category, index) => (
                      <ListItem key={index} divider={index < categoryData.length - 1}>
                        <ListItemText
                          primary={<Typography sx={{ textTransform: 'capitalize' }}>{category.name}</Typography>}
                          secondary={`${category.count} transactions`} />
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(category.value)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            <Grid item xs={12} md={6}>
              <Alert severity="info">
                <AlertTitle>No Category Data</AlertTitle>
                No transaction category data is available to display.
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {monthlyData.length > 0 ? (
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardHeader
                  title="Monthly Trends"
                  subheader="Income vs Expenses over time" />
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
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#4ade80" name="Income" />
                        <Line type="monotone" dataKey="expenses" stroke="#f87171" name="Expenses" />
                        <Line type="monotone" dataKey="net" stroke="#60a5fa" name="Net" />
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
                title="Financial Metrics"
                subheader="Key performance indicators" />
              <CardContent>
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Income to Expense Ratio"
                      secondary="Higher is better" />
                    <Typography variant="body1" fontWeight="bold">
                      {overallMetrics.incomeToExpenseRatio}
                    </Typography>
                  </ListItem>

                  <ListItem divider>
                    <ListItemText
                      primary="Top Expense Category"
                      secondary="Highest spending area" />
                    <Typography variant="body1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                      {overallMetrics.topCategory || 'N/A'}
                    </Typography>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Net Cashflow"
                      secondary="Income minus expenses" />
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(overallSummary.netCashflow)}
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
                subheader="Financial insights" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(overallSummary.netCashflow || 0) < 0 && (
                    <Alert severity="warning" variant="outlined">
                      <AlertTitle>Expense Alert</AlertTitle>
                      Your expenses are significantly higher than your income.
                      {overallMetrics.topCategory && (
                        <> Consider reviewing your spending in the "{overallMetrics.topCategory}" category,
                          which accounts for {formatCurrency(
                            dashboardData.categoryBreakdown?.[overallMetrics.topCategory]?.total || 0
                          )} of your expenses.</>
                      )}
                    </Alert>
                  )}

                  <Alert severity="info" variant="outlined">
                    <AlertTitle>Financial Insight</AlertTitle>
                    Your average transaction size is {formatCurrency(overallMetrics.averageTransactionSize)}.
                    Consider setting up a budget to track and control your spending.
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box><LeadsDashboard />
      <CampaignsDashboard /></>
  );
}
