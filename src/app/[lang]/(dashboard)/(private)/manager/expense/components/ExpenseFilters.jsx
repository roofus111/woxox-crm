"use client";

import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Fab
} from '@mui/material';

export default function ExpenseFilters({ filters, setFilters }) {
    const [open, setOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ ...filters });

    // Categories and payment methods from our static data
    const categories = ['Food', 'Utilities', 'Entertainment', 'Housing', 'Transportation', 'Healthcare', 'Other'];
    const paymentMethods = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Mobile Payment'];

    // Map each category to a specific Remix Icon class
    const categoryIcons = {
        Food: "ri-restaurant-2-line",
        Utilities: "ri-lightbulb-flash-line",
        Entertainment: "ri-film-line",
        Housing: "ri-home-4-line",
        Transportation: "ri-truck-line",
        Healthcare: "ri-heart-pulse-line",
        Other: "ri-file-list-line"
    };

    const handleOpen = () => {
        setTempFilters({ ...filters });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFilterChange = (name, value) => {
        setTempFilters({
            ...tempFilters,
            [name]: value
        });
    };

    const handleApplyFilter = () => {
        setFilters(tempFilters);
        handleClose();
    };

    const handleClearFilter = () => {
        const clearedFilters = {
            dateFrom: '',
            dateTo: '',
            category: '',
            paymentMethod: '',
            showRecurringOnly: false
        };
        setTempFilters(clearedFilters);
        setFilters(clearedFilters);
        handleClose();
    };

    return (
        <>
            {/* <Box sx={{ top: 160, right: 130, zIndex: 1000 }}>
                <Fab
                    color="primary"
                    aria-label="filter"
                    onClick={handleOpen}
                // sx={{ width: '150%', height: '80%' }}
                >
                    <i className="ri-equalizer-3-line"></i>
                </Fab>
            </Box> */}

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Filter</Typography>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <i className="ri-close-line"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {/* Filter Type Options */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 1, mb: 3 }}>
                                Transaction Type
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        sx={{ textTransform: 'none', borderRadius: '20px', marginBottom: '15px' }}
                                    >
                                        All
                                    </Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        sx={{ textTransform: 'none', borderRadius: '20px' }}
                                    >
                                        Income
                                    </Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        sx={{ textTransform: 'none', borderRadius: '20px' }}
                                    >
                                        Expense
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Date Range */}
                        <Grid item xs={12} container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Date From"
                                    type="date"
                                    value={tempFilters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Date To"
                                    type="date"
                                    value={tempFilters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        </Grid>

                        {/* Category Filter */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 4 }}>
                                Expense Category
                            </Typography>
                            <Grid container spacing={1}>
                                {categories.map(category => (
                                    <Grid item xs={6} key={category}>
                                        <Button
                                            fullWidth
                                            variant={tempFilters.category === category ? "contained" : ""}
                                            color={tempFilters.category === category ? "primary" : "inherit"}
                                            onClick={() =>
                                                handleFilterChange('category', tempFilters.category === category ? '' : category)
                                            }
                                            sx={{
                                                textTransform: 'none',
                                                justifyContent: 'flex-start',
                                                px: 2,
                                                py: 3,
                                                mb: 1,
                                                borderRadius: '8px',
                                                backgroundColor: tempFilters.category === category ? 'primary.main' : '#f5f5f5',
                                            }}
                                            startIcon={
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: 24,
                                                        height: 24,
                                                    }}
                                                >
                                                    <i className={categoryIcons[category]} style={{ fontSize: 24 }}></i>
                                                </Box>
                                            }
                                        >
                                            {category}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        {/* Payment Method */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                                Payment Method
                            </Typography>
                            <TextField
                                select
                                name="paymentMethod"
                                value={tempFilters.paymentMethod}
                                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="">All Payment Methods</MenuItem>
                                {paymentMethods.map(method => (
                                    <MenuItem key={method} value={method}>
                                        {method}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Recurring Only */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={tempFilters.showRecurringOnly}
                                        onChange={(e) => handleFilterChange('showRecurringOnly', e.target.checked)}
                                        name="showRecurringOnly"
                                        color="primary"
                                    />
                                }
                                label="Show recurring expenses only"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ flexDirection: 'column', p: 3, gap: 1 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleApplyFilter}
                        sx={{ borderRadius: '20px' }}
                    >
                        Apply Filter
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleClearFilter}
                        sx={{ borderRadius: '20px' }}
                    >
                        Clear Filter
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
