"use client";

import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    LinearProgress,
    Card,
    CardContent,
    Stack,
    Divider,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function ExpenseAnalytics({ data }) {
    const {
        totalAmount,
        averageAmount,
        topCategories,
        monthlyTrend,
        recentTransactions
    } = data;

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Box sx={{ mb: 4 }}>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Expenses
                            </Typography>
                            <Typography variant="h4" component="div">
                                {formatCurrency(totalAmount)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                This month
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Expense
                            </Typography>
                            <Typography variant="h4" component="div">
                                {formatCurrency(averageAmount)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Per transaction
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Highest Category
                            </Typography>
                            <Typography variant="h4" component="div">
                                {topCategories[0]?.[0] || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {topCategories[0] ? formatCurrency(topCategories[0][1]) : ''}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Monthly Change
                            </Typography>
                            <Typography variant="h4" component="div" sx={{
                                color: monthlyTrend.length >= 2 ?
                                    (monthlyTrend[1][1] > monthlyTrend[0][1] ? 'error.main' : 'success.main') : 'text.primary'
                            }}>
                                {monthlyTrend.length >= 2 ?
                                    `${((monthlyTrend[1][1] - monthlyTrend[0][1]) / monthlyTrend[0][1] * 100).toFixed(1)}%` :
                                    'N/A'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                From last month
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2}>
                {/* Category Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: '400px' }}>
                        <Typography variant="h6" gutterBottom>
                            Category Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={topCategories}
                                    dataKey="1"
                                    nameKey="0"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {topCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value) => formatCurrency(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Monthly Trend */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: '400px' }}>
                        <Typography variant="h6" gutterBottom>
                            Monthly Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="0" />
                                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                <RechartsTooltip
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar dataKey="1" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Transactions */}
            <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Recent Transactions
                </Typography>
                <Stack spacing={1}>
                    {recentTransactions.map((transaction, index) => (
                        <Box key={transaction.id || index}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ py: 1 }}
                            >
                                <Box>
                                    <Typography variant="subtitle2">
                                        {transaction.description}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    {formatCurrency(transaction.amount)}
                                </Typography>
                            </Stack>
                            {index < recentTransactions.length - 1 && <Divider />}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
} 
