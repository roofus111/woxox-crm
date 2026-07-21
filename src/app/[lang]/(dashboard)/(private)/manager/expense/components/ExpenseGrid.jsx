"use client";

import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    IconButton,
    Box,
    Tooltip,
    Paper,
    Stack,
    Divider,
    Avatar
} from '@mui/material';
import Image from 'next/image';

export default function ExpenseGrid({ expenses, groupBy, onEdit, onDelete }) {
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            Food: "ri-restaurant-2-line",
            Shopping: "ri-shopping-bag-3-line",
            Transport: "ri-car-line",
            Entertainment: "ri-gamepad-line",
            Bills: "ri-bill-line",
            Healthcare: "ri-heart-pulse-line",
            Education: "ri-book-open-line",
            default: "ri-money-dollar-circle-line"
        };
        return icons[category?.name || category] || icons.default;
    };

    // Get category name
    const getCategoryName = (category) => {
        return typeof category === 'object' ? category.name : category;
    };

    // Get status color based on amount
    const getStatusColor = (amount) => {
        if (amount >= 10000) return 'error.main';
        if (amount >= 5000) return 'warning.main';
        return 'success.main';
    };

    return (
        <Box sx={{ py: 2 }}>
            {Object.entries(expenses).map(([group, { items, total }]) => (
                <Paper key={group} sx={{ mb: 4, p: 2, borderRadius: 2 }}>
                    {/* Group Header */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Typography variant="h6">
                            {groupBy === 'date' ? new Date(group).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : getCategoryName(group)}
                        </Typography>
                        <Chip
                            label={formatCurrency(total)}
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>

                    {/* Expenses Grid */}
                    <Grid container spacing={2}>
                        {items.map((expense) => (
                            <Grid item xs={12} sm={6} md={4} key={expense._id || expense.id}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                        }
                                    }}
                                >
                                    {/* Receipt Image Preview */}
                                    {expense.receiptImage && (
                                        <Box sx={{ position: 'relative', height: 140 }}>
                                            <Image
                                                src={expense.receiptImage}
                                                alt="Receipt"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </Box>
                                    )}

                                    <CardContent sx={{ flexGrow: 1 }}>
                                        {/* Header */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: 'primary.light',
                                                    width: 40,
                                                    height: 40
                                                }}
                                            >
                                                <i className={getCategoryIcon(expense.category)} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" noWrap>
                                                    {expense.description}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {/* Details */}
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Amount
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: getStatusColor(expense.amount)
                                                    }}
                                                >
                                                    {formatCurrency(expense.amount)}
                                                </Typography>
                                            </Box>

                                            <Divider />

                                            <Stack direction="row" spacing={1}>
                                                <Chip
                                                    label={getCategoryName(expense.category)}
                                                    size="small"
                                                    sx={{ bgcolor: 'primary.light', color: 'white' }}
                                                />
                                                <Chip
                                                    label={expense.paymentMethod?.name || expense.paymentMethod}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                {expense.isRecurring && (
                                                    <Chip
                                                        label="Recurring"
                                                        size="small"
                                                        color="secondary"
                                                    />
                                                )}
                                            </Stack>
                                        </Stack>
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => onEdit(expense)}
                                            >
                                                <i className="ri-edit-line" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onDelete(expense._id || expense.id)}
                                            >
                                                <i className="ri-delete-bin-line" />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            ))}
        </Box>
    );
} 
