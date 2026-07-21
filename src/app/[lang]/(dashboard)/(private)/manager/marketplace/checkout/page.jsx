"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Divider,
    Chip,
    Avatar
} from '@mui/material';
const axios = require('axios');


const CheckoutPage = () => {
    const { data: session, update } = useSession();
    const [checkoutData, setCheckoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        const loadCheckoutData = () => {
            try {
                const data = localStorage.getItem('checkoutData');
                if (data) {
                    const parsedData = JSON.parse(data);
                    console.log(parsedData);
                    setCheckoutData(parsedData);

                } else {
                    router.push('/en/manager/marketplace');
                }
            } catch (error) {
                console.error('Error parsing checkout data:', error);
                router.push('/en/manager/marketplace');
            } finally {
                setIsLoading(false);
            }
        };

        loadCheckoutData();
    }, [router]);
    const getCartTotal = () => {
        if (!checkoutData) return 0;
        return checkoutData.cartTotal || 0;
    };

    const getCartSavings = () => {
        if (!checkoutData) return 0;
        return checkoutData.cartSavings || 0;
    };

    const getOriginalTotal = () => {
        if (!checkoutData) return 0;
        return getCartTotal() + getCartSavings();
    };

    const datatoSend = checkoutData?.modules[0]?.plans[0]?.features


    const handleSubmit = async () => {
        try {
            // Validate session & token
            if (!session?.user?.plan?._id) {
                console.error('Plan ID not found in session');
                return;
            }
            console.log(datatoSend);
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authentication token missing');
                return;
            }

            // API endpoint
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/plan/push-addons/${session.user.plan._id}`;
            console.log(session.user.plan.modules[0].plans[0].moduleAccess);
            const response = await axios.post(url, { addons: datatoSend }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Handle success
            if (response.status === 200) {
                console.log('Addons pushed successfully:', response.data);
                console.log(response.data);

                await update({
                    ...session,
                    user: {
                        ...session.user,
                        plan: {
                            ...session.user.plan,
                            modules: session.user.plan.modules.map((mod, modIndex) =>
                                modIndex === 0
                                    ? {
                                        ...mod,
                                        plans: mod.plans.map((p, pIndex) =>
                                            pIndex === 0
                                                ? {
                                                    ...p,
                                                    moduleAccess: response.data.data
                                                }
                                                : p
                                        )
                                    }
                                    : mod
                            )
                        }
                    }
                });


                // Optionally, show toast/snackbar
                // toast.success('Addons updated successfully!');
            } else {
                console.warn('Unexpected response:', response.status, response.data);
            }

        } catch (error) {
            // Handle API or network errors
            console.error('Error pushing addons:', error.response?.data || error.message);
            // Optionally, show toast/snackbar
            // toast.error(error.response?.data?.message || 'Failed to push addons');
        }
    };


    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
                Order Summary
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <Typography>Loading checkout data...</Typography>
                </Box>
            ) : checkoutData ? (
                <Grid container spacing={4}>
                    {/* Left Column - Order Details */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {checkoutData.modules[0]?.moduleName || 'Products'}
                                </Typography>

                                {checkoutData.modules[0]?.plans[0]?.features?.map((item, index) => (
                                    <Card key={item.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={2}>
                                                    <Avatar
                                                        src={item.image}
                                                        alt={item.name}
                                                        sx={{ width: 60, height: 60 }}
                                                        variant="rounded"
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        Brand: {item.brand}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        SKU: {item.sku}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4} textAlign="right">
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                                            ₹{item.originalPrice}
                                                        </Typography>
                                                        <Typography variant="h6" color="primary">
                                                            ₹{item.price}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`Save ₹${item.savings}`}
                                                        color="success"
                                                        size="small"
                                                        sx={{ mb: 1 }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Qty: {item.quantity}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column - Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ position: 'sticky', top: 20 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Order Summary</Typography>

                                {/* Billing Cycle */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Billing Cycle: {checkoutData.billingCycle?.charAt(0).toUpperCase() + checkoutData.billingCycle?.slice(1)}
                                    </Typography>
                                    {checkoutData.autoRenew && (
                                        <Chip label="Auto Renew" color="info" size="small" sx={{ mt: 1 }} />
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Pricing Breakdown */}
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Original Price:</Typography>
                                        <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                                            ₹{getOriginalTotal()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="success.main">Savings:</Typography>
                                        <Typography variant="body2" color="success.main">
                                            -₹{getCartSavings()}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6">Total:</Typography>
                                        <Typography variant="h6" color="primary">
                                            ₹{getCartTotal()}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Additional Info */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Items: {checkoutData.itemCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Employee Limit: {checkoutData.employeeLimit}
                                    </Typography>
                                    {checkoutData.leadLimit !== -1 && (
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Lead Limit: {checkoutData.leadLimit}
                                        </Typography>
                                    )}
                                    {checkoutData.campaignLimit !== -1 && (
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Campaign Limit: {checkoutData.campaignLimit}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Action Buttons */}
                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        sx={{ mb: 2 }}
                                        onClick={handleSubmit}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => router.push('/en/manager/marketplace')}
                                    >
                                        Back to Marketplace
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column' }}>
                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                        No checkout data found
                    </Typography>
                    <Button variant="contained" onClick={() => router.push('/en/manager/marketplace')}>
                        Return to Marketplace
                    </Button>
                </Box>
            )}
        </Box>
    )
}
export default CheckoutPage;
