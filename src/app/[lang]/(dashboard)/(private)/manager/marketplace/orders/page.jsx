"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Divider
} from '@mui/material';


const MarketplaceOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Sample orders data - in real app, this would come from API
    useEffect(() => {
        const sampleOrders = [
            {
                id: 'ORD-001',
                date: '2024-01-15',
                status: 'Delivered',
                total: 299.97,
                items: [
                    { name: 'Advanced CRM Template', price: 99.99, quantity: 1 },
                    { name: 'Business Analytics Dashboard', price: 79.99, quantity: 1 },
                    { name: 'HR Management Template', price: 89.99, quantity: 1 }
                ],
                shippingAddress: '123 Business St, Tech City, TC 12345',
                billingAddress: '123 Business St, Tech City, TC 12345'
            },
            {
                id: 'ORD-002',
                date: '2024-01-10',
                status: 'Processing',
                total: 199.99,
                items: [
                    { name: 'Project Management Tool', price: 199.99, quantity: 1 }
                ],
                shippingAddress: '456 Innovation Ave, Startup City, SC 67890',
                billingAddress: '456 Innovation Ave, Startup City, SC 67890'
            },
            {
                id: 'ORD-003',
                date: '2024-01-05',
                status: 'Shipped',
                total: 399.99,
                items: [
                    { name: 'Marketing Automation Suite', price: 399.99, quantity: 1 }
                ],
                shippingAddress: '789 Growth Blvd, Scale City, SC 11111',
                billingAddress: '789 Growth Blvd, Scale City, SC 11111'
            }
        ];
        setOrders(sampleOrders);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'success';
            case 'Shipped':
                return 'info';
            case 'Processing':
                return 'warning';
            case 'Cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const closeOrderModal = () => {
        setSelectedOrder(null);
        setIsOrderModalOpen(false);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    My Orders
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => window.history.back()}
                    startIcon={<i className="ri-arrow-left-line" />}
                >
                    Back to Marketplace
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search orders or products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <i className="ri-search-line" style={{ marginRight: 8, color: '#757575' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                    <Chip
                                        key={status}
                                        label={status === 'all' ? 'All Orders' : status}
                                        onClick={() => setFilterStatus(status)}
                                        color={filterStatus === status ? 'primary' : 'default'}
                                        variant={filterStatus === status ? 'filled' : 'outlined'}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                                {order.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(order.date).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {order.items[0]?.name}
                                                {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                                ₹{order.total.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={getStatusColor(order.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => openOrderModal(order)}
                                                sx={{ color: 'primary.main' }}
                                            >
                                                <i className="ri-eye-line" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredOrders.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <i className="ri-file-list-line" style={{ fontSize: 64, color: '#bdbdbd', marginBottom: 16 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No orders found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start shopping to see your orders here'
                                }
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            <Dialog
                open={isOrderModalOpen}
                onClose={closeOrderModal}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Order Details - {selectedOrder?.id}</Typography>
                        <IconButton onClick={closeOrderModal}>
                            <i className="ri-close-line" />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedOrder && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Order Information</Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                                    <Typography variant="body1">{selectedOrder.id}</Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedOrder.date).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                                    <Chip
                                        label={selectedOrder.status}
                                        color={getStatusColor(selectedOrder.status)}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Total:</Typography>
                                    <Typography variant="h6" color="primary">
                                        ₹{selectedOrder.total.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Items</Typography>
                                <Box sx={{ mb: 2 }}>
                                    {selectedOrder.items.map((item, index) => (
                                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {item.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Qty: {item.quantity} × ₹{item.price}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>Addresses</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>Shipping Address:</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedOrder.shippingAddress}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>Billing Address:</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedOrder.billingAddress}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeOrderModal}>Close</Button>
                    <Button variant="contained" onClick={() => window.print()}>
                        Print Order
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MarketplaceOrdersPage;
