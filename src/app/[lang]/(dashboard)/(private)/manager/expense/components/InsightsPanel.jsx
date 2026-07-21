import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Stack,
} from '@mui/material';

export default function InsightsPanel({ monthData, analytics }) {
    if (!monthData) return null;

    return (
        <Box sx={{ mt: 2, mb: 3 }}>
            <Grid container spacing={2}>
                {/* Total Expenses */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Expenses
                            </Typography>
                            <Typography variant="h5">
                                ₹{monthData.total.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {monthData.expenseCount} transactions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Daily Average */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Daily Average
                            </Typography>
                            <Typography variant="h5">
                                ₹{(monthData.total / Object.keys(monthData.dates).length).toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {Object.keys(monthData.dates).length} days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Category */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Top Category
                            </Typography>
                            {Object.entries(monthData.categoryTotals)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 1)
                                .map(([category, amount]) => (
                                    <React.Fragment key={category}>
                                        <Typography variant="h5">
                                            {category}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            ₹{amount.toFixed(2)}
                                        </Typography>
                                    </React.Fragment>
                                ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Distribution */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Category Distribution
                            </Typography>
                            <Stack spacing={1}>
                                {Object.entries(monthData.categoryTotals)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 3)
                                    .map(([category, amount]) => (
                                        <Box key={category}>
                                            <Typography variant="body2">
                                                {category} ({((amount / monthData.total) * 100).toFixed(1)}%)
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(amount / monthData.total) * 100}
                                                sx={{ height: 8, borderRadius: 1 }}
                                            />
                                        </Box>
                                    ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
} 
