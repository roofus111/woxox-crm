"use client";

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Chip,
    Avatar,
    IconButton,
    LinearProgress
} from '@mui/material';


const MarketplaceDashboard = () => {
    // Sample dashboard data
    const dashboardData = {
        stats: {
            totalProducts: 156,
            activeOrders: 23,
            totalRevenue: 15420,
            averageRating: 4.6,
            topCategory: 'Software Tools',
            recentActivity: 12
        },
        recentProducts: [
            {
                id: 1,
                name: 'Advanced CRM Template',
                category: 'Templates',
                price: 99.99,
                rating: 4.8,
                views: 1247
            },
            {
                id: 2,
                name: 'Project Management Tool',
                category: 'Software',
                price: 199.99,
                rating: 4.6,
                views: 892
            },
            {
                id: 3,
                name: 'Business Analytics Dashboard',
                category: 'Templates',
                price: 79.99,
                rating: 4.9,
                views: 2103
            }
        ],
        topCategories: [
            { name: 'Software Tools', count: 45, percentage: 28.8 },
            { name: 'Templates', count: 38, percentage: 24.4 },
            { name: 'Services', count: 32, percentage: 20.5 },
            { name: 'Training', count: 25, percentage: 16.0 },
            { name: 'Other', count: 16, percentage: 10.3 }
        ]
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    // ... existing CategoryCard and ProductCard components ...

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Marketplace Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<i className="ri-store-2-line" />}
                    href="/manager/marketplace"
                >
                    Browse Marketplace
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Products"
                        value={dashboardData.stats.totalProducts}
                        icon={<i className="ri-trending-up-line" />}
                        color="primary.main"
                        subtitle="Available for purchase"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Orders"
                        value={dashboardData.stats.activeOrders}
                        icon={<i className="ri-shopping-cart-line" />}
                        color="success.main"
                        subtitle="Currently processing"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`$${dashboardData.stats.totalRevenue.toLocaleString()}`}
                        icon={<i className="ri-trending-up-line" />}
                        color="warning.main"
                        subtitle="This month"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Average Rating"
                        value={dashboardData.stats.averageRating}
                        icon={<i className="ri-star-line" />}
                        color="info.main"
                        subtitle="Customer satisfaction"
                    />
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Top Categories */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" component="h2" gutterBottom>
                                Top Categories
                            </Typography>
                            <Grid container spacing={2}>
                                {dashboardData.topCategories.map((category, index) => (
                                    <Grid item xs={12} key={index}>
                                        {/* <CategoryCard category={category} index={index} /> */}
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Products */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" component="h2" gutterBottom>
                                Recent Products
                            </Typography>
                            <Grid container spacing={2}>
                                {dashboardData.recentProducts.map((product) => (
                                    <Grid item xs={12} key={product.id}>
                                        {/* <ProductCard product={product} /> */}
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="h2" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<i className="ri-shopping-cart-line" />}
                                        href="/manager/marketplace?tab=cart"
                                        sx={{ py: 2 }}
                                    >
                                        View Cart
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<i className="ri-heart-line" />}
                                        href="/manager/marketplace?tab=favorites"
                                        sx={{ py: 2 }}
                                    >
                                        My Favorites
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<i className="ri-eye-line" />}
                                        href="/manager/marketplace"
                                        sx={{ py: 2 }}
                                    >
                                        Browse Products
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<i className="ri-trending-up-line" />}
                                        href="/manager/marketplace?tab=analytics"
                                        sx={{ py: 2 }}
                                    >
                                        View Analytics
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MarketplaceDashboard;
