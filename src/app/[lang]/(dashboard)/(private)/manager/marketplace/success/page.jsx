"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Divider,
    Chip
} from '@mui/material';

const MarketplaceSuccessPage = () => {
    const router = useRouter();

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Card sx={{ textAlign: 'center', p: 4 }}>
                <CardContent>
                    {/* Success Icon */}
                    <Box sx={{ mb: 3 }}>
                        <i 
                            className="ri-checkbox-circle-fill" 
                            style={{ 
                                fontSize: 80, 
                                color: '#4caf50',
                                marginBottom: 16 
                            }} 
                        />
                    </Box>

                    {/* Success Message */}
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                        Order Successful!
                    </Typography>
                    
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                        Thank you for your purchase. Your order has been confirmed and will be processed shortly.
                    </Typography>

                    {/* Order Details */}
                    <Card sx={{ bgcolor: 'grey.50', mb: 4, textAlign: 'left' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Order Details</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {new Date().toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                                    <Chip 
                                        label="Paid" 
                                        color="success" 
                                        size="small" 
                                        sx={{ fontWeight: 'medium' }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                                    <Chip 
                                        label="Processing" 
                                        color="info" 
                                        size="small" 
                                        sx={{ fontWeight: 'medium' }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>What's Next?</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            You will receive a confirmation email with your order details and tracking information.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Our team will process your order and you'll be notified once it's ready for delivery.
                        </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => router.push('/en/manager/marketplace')}
                            startIcon={<i className="ri-store-2-line" />}
                        >
                            Continue Shopping
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => window.print()}
                            startIcon={<i className="ri-printer-line" />}
                        >
                            Print Receipt
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => router.push('/en/manager/marketplace/orders')}
                            startIcon={<i className="ri-file-list-line" />}
                        >
                            View Orders
                        </Button>
                    </Box>

                    {/* Support Information */}
                    <Divider sx={{ my: 4 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Need help? Contact our support team:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            📧 support@woxox.com | �� +1 (555) 123-4567
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default MarketplaceSuccessPage;