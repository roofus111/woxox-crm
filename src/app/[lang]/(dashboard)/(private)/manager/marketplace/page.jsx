"use client";

import React, { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Tabs,
    Tab,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    Badge,
    Paper,
    Skeleton,
    Tooltip,
    Fade,
    Zoom,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ListItemAvatar,
    Avatar,
    Collapse,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Fab,
    Backdrop
} from '@mui/material';
import axios from 'axios';
// import { toast } from 'react-toastify';

// Custom hooks for better separation of concerns
const useExistingPlan = (session) => {
    const [existingPlan, setExistingPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExistingPlan = async () => {
            if (!session?.user?.plan?._id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${session.user.plan._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`
                        }
                    }
                );

                if (response) {
                    setExistingPlan(response.data.purchase);
                }
            } catch (error) {
                console.error('Error fetching existing plan:', error);
                setError('Failed to fetch existing plan details');
            } finally {
                setLoading(false);
            }
        };

        fetchExistingPlan();
    }, [session]);

    return { existingPlan, loading, error };
};

const useCart = () => {
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('marketplaceCart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('marketplaceCart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                // Check if adding more would exceed reasonable limits
                if (existingItem.quantity >= 10) {
                    return prev; // Don't add more if already at limit
                }
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, { ...product, quantity: 1, addedAt: new Date().toISOString() }];
            }
        });
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        // Limit quantity to reasonable amount
        if (newQuantity > 10) {
            newQuantity = 10;
        }

        setCart(prev =>
            prev.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCart([]);
        localStorage.removeItem('marketplaceCart');
    }, []);

    const cartTotal = useMemo(() =>
        cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        [cart]
    );

    const cartItemCount = useMemo(() =>
        cart.reduce((total, item) => total + item.quantity, 0),
        [cart]
    );

    const cartSavings = useMemo(() =>
        cart.reduce((total, item) => {
            const savings = (item.originalPrice || item.price) - item.price;
            return total + (savings * item.quantity);
        }, 0),
        [cart]
    );

    const toggleCart = useCallback(() => {
        setCartOpen(prev => !prev);
    }, []);

    return {
        cart,
        cartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        cartSavings,
        toggleCart
    };
};

const useFavorites = () => {
    const [favorites, setFavorites] = useState(new Set());

    const toggleFavorite = useCallback((productId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId);
            } else {
                newFavorites.add(productId);
            }
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((productId) => favorites.has(productId), [favorites]);

    return { favorites, toggleFavorite, isFavorite, favoritesCount: favorites.size };
};

const useSnackbar = () => {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    return { snackbar, showSnackbar, hideSnackbar };
};

// Memoized components for better performance
const ProductCard = React.memo(({
    product,
    isInExistingPlan,
    isFavorite,
    onToggleFavorite,
    onAddToCart,
    onViewDetails,
    cartQuantity,
    onUpdateQuantity
}) => {
    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = () => {
        onAddToCart(product);
    };

    return (
        <Fade in timeout={300}>
            <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                opacity: isInExistingPlan ? 0.7 : 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                }
            }}>
                <Box sx={{ position: 'relative' }}>
                    <Box
                        sx={{
                            height: 200,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        onClick={onViewDetails}
                    >
                        <Typography variant="h6" color="white" textAlign="center" sx={{ px: 2 }}>
                            {product.name}
                        </Typography>

                        {product.popular && (
                            <Chip
                                label="Popular"
                                color="warning"
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    fontWeight: 'bold'
                                }}
                            />
                        )}
                    </Box>

                    {/* Existing Plan Badge */}
                    {isInExistingPlan && (
                        <Chip
                            label="Installed"
                            color="success"
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: 8,
                                left: product.popular ? 80 : 8,
                                fontWeight: 'bold',
                                backgroundColor: '#4caf50',
                                color: 'white'
                            }}
                        />
                    )}

                    {/* Favorite button */}
                    <IconButton
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                        }}
                        onClick={onToggleFavorite}
                    >
                        {isFavorite ?
                            <i className="ri-heart-fill" style={{ color: '#d32f2f' }} /> :
                            <i className="ri-heart-line" />
                        }
                    </IconButton>

                    {/* Discount badge */}
                    {discountPercentage > 0 && (
                        <Chip
                            label={`${discountPercentage}% OFF`}
                            color="error"
                            size="small"
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                fontWeight: 'bold'
                            }}
                        />
                    )}
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                        {product.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {product.description}
                    </Typography>

                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {[...Array(5)].map((_, index) => (
                                <i
                                    key={index}
                                    className={`ri-star-${index < Math.floor(product.rating) ? 'fill' : 'line'}`}
                                    style={{
                                        color: index < Math.floor(product.rating) ? '#ed6c02' : '#bdbdbd',
                                        fontSize: 16,
                                        marginRight: 2
                                    }}
                                />
                            ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {product.rating} ({product.reviews})
                        </Typography>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {product.tags.slice(0, 3).map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                            />
                        ))}
                        {product.isAddon && (
                            <Chip
                                label="Add-on"
                                size="small"
                                color="secondary"
                                sx={{ fontSize: '0.75rem' }}
                            />
                        )}
                    </Box>

                    {/* Price */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                            ₹{product.price}
                        </Typography>
                        {product.originalPrice && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textDecoration: 'line-through', ml: 1 }}
                            >
                                ₹{product.originalPrice}
                            </Typography>
                        )}
                    </Box>

                    {/* Enhanced Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<i className="ri-eye-line" />}
                            onClick={onViewDetails}
                            sx={{ flex: 1 }}
                        >
                            View Details
                        </Button>

                        {isInExistingPlan ? (
                            <Button
                                variant="contained"
                                size="small"
                                disabled
                                sx={{ flex: 1 }}
                            >
                                Installed
                            </Button>
                        ) : cartQuantity > 0 ? (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flex: 1,
                                backgroundColor: 'primary.light',
                                borderRadius: 1,
                                p: 0.5
                            }}>
                                <IconButton
                                    size="small"
                                    onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        backgroundColor: 'white',
                                        '&:hover': { backgroundColor: 'grey.100' }
                                    }}
                                >
                                    <i className="ri-subtract-line" style={{ fontSize: 14 }} />
                                </IconButton>
                                <Typography variant="body2" sx={{
                                    minWidth: 20,
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: 'primary.dark'
                                }}>
                                    {cartQuantity}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        backgroundColor: 'white',
                                        '&:hover': { backgroundColor: 'grey.100' }
                                    }}
                                >
                                    <i className="ri-add-line" style={{ fontSize: 14 }} />
                                </IconButton>
                            </Box>
                        ) : (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<i className="ri-shopping-cart-line" />}
                                onClick={handleAddToCart}
                                sx={{ flex: 1 }}
                            >
                                Add to Cart
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );
});

ProductCard.displayName = 'ProductCard';

// const ExistingPlanDisplay = React.memo(({ existingPlan, loading, error, onManageSubscription }) => {
//     if (loading) {
//         return (
//             <Card sx={{ mb: 3 }}>
//                 <CardContent>
//                     <Grid container spacing={2}>
//                         <Grid item xs={12}>
//                             <Skeleton variant="text" width="60%" height={40} />
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <Skeleton variant="text" width="80%" height={24} />
//                             <Skeleton variant="text" width="60%" height={24} />
//                             <Skeleton variant="text" width="70%" height={24} />
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <Skeleton variant="text" width="70%" height={24} />
//                             <Skeleton variant="text" width="90%" height={24} />
//                             <Skeleton variant="text" width="80%" height={24} />
//                         </Grid>
//                     </Grid>
//                 </CardContent>
//             </Card>
//         );
//     }

//     if (error) {
//         return (
//             <Card sx={{ mb: 3, border: '2px solid #ffebee' }}>
//                 <CardContent sx={{ textAlign: 'center', py: 3 }}>
//                     <i className="ri-error-warning-line" style={{ fontSize: 48, color: '#f44336', marginBottom: 16 }} />
//                     <Typography variant="h6" color="error" gutterBottom>
//                         Error Loading Plan
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                         {error}
//                     </Typography>
//                 </CardContent>
//             </Card>
//         );
//     }

//     if (!existingPlan) {
//         return null;
//     }

//     return (
//         <Zoom in timeout={500}>
//             <Card sx={{ mb: 3, border: '2px solid #e3f2fd' }}>
//                 <CardContent>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                         <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
//                             Your Current Plan
//                         </Typography>
//                         <Chip
//                             label={existingPlan.planType}
//                             color={existingPlan.planType === 'free trial' ? 'warning' : 'success'}
//                             variant="outlined"
//                         />
//                     </Box>

//                     <Grid container spacing={3}>
//                         <Grid item xs={12} md={6}>
//                             {existingPlan.modules.map((module, moduleIndex) => (
//                                 <Box key={moduleIndex} sx={{ mb: 2 }}>
//                                     <Typography variant="subtitle1" color="primary" gutterBottom>
//                                         {module.moduleName}     {module.plans.map((plan, planIndex) => (
//                                             <>

//                                                 <strong>{plan.planName}</strong> - ₹{plan.price}/month

//                                                 {/* Features */}
//                                                 {/* <Box sx={{ mb: 2 }}>
//                                                 {plan.features.map((feature, featureIndex) => (
//                                                     <Typography
//                                                         key={featureIndex}
//                                                         variant="body2"
//                                                         color="text.secondary"
//                                                         sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
//                                                     >
//                                                         <i className="ri-check-line" style={{ marginRight: 8, color: '#4caf50' }} />
//                                                         {feature}
//                                                     </Typography>
//                                                 ))}
//                                             </Box> */}
//                                             </>
//                                         ))}
//                                     </Typography>

//                                 </Box>
//                             ))}
//                             <Typography variant="body2" color="text.secondary" gutterBottom>
//                                 Valid till: {new Date(existingPlan.validTill).toLocaleDateString()}
//                             </Typography>
//                         </Grid>


//                     </Grid>

//                     <Divider sx={{ my: 2 }} />

//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2" color="text.secondary">
//                             Auto-renew: {existingPlan.autoRenew ? 'Enabled' : 'Disabled'}
//                         </Typography>
//                         <Button
//                             variant="outlined"
//                             size="small"
//                             onClick={onManageSubscription}
//                         >
//                             Manage Subscription
//                         </Button>
//                     </Box>
//                 </CardContent>
//             </Card>
//         </Zoom>
//     );
// });

// ExistingPlanDisplay.displayName = 'ExistingPlanDisplay';

// Enhanced Cart Summary Component
const CartSummary = React.memo(({
    cart,
    cartTotal,
    cartSavings,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onCheckout,
    onClose
}) => {
    const [expandedItems, setExpandedItems] = useState(new Set());

    const toggleItemExpanded = useCallback((itemId) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    }, []);

    if (cart.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <i className="ri-shopping-cart-line" style={{ fontSize: 64, color: '#bdbdbd', marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Your cart is empty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Start adding products to get started
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Cart Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <i className="ri-close-line" />
                    </IconButton>
                </Box>
            </Box>

            {/* Cart Items */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <List sx={{ p: 0 }}>
                    {cart.map((item) => (
                        <Card key={item.id} sx={{ mb: 2, boxShadow: 2 }}>
                            <CardContent sx={{ p: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={3}>
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Typography variant="body2" color="white" textAlign="center">
                                                {item.name.substring(0, 2).toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={9}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.brand} • SKU: {item.sku}
                                        </Typography>

                                        {/* Quantity Controls */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    backgroundColor: 'grey.100',
                                                    '&:hover': { backgroundColor: 'grey.200' }
                                                }}
                                            >
                                                <i className="ri-subtract-line" style={{ fontSize: 14 }} />
                                            </IconButton>

                                            <Typography variant="body2" sx={{
                                                minWidth: 30,
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                {item.quantity}
                                            </Typography>

                                            <IconButton
                                                size="small"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= 10}
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    backgroundColor: 'grey.100',
                                                    '&:hover': { backgroundColor: 'grey.200' }
                                                }}
                                            >
                                                <i className="ri-add-line" style={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                            <Box>
                                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                                {item.originalPrice && item.originalPrice > item.price && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                                        ₹{(item.originalPrice * item.quantity).toFixed(2)}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <IconButton
                                                size="small"
                                                onClick={() => onRemoveItem(item.id)}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <i className="ri-delete-bin-line" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </List>
            </Box>

            {/* Cart Summary */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
                {/* Savings Display */}
                {cartSavings > 0 && (
                    <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                            🎉 You're saving ₹{cartSavings.toFixed(2)}!
                        </Typography>
                    </Box>
                )}

                {/* Price Breakdown */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Subtotal ({cart.reduce((total, item) => total + item.quantity, 0)} items):
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            ₹{cartTotal.toFixed(2)}
                        </Typography>
                    </Box>

                    {cartSavings > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="success.main">
                                Total Savings:
                            </Typography>
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                                -₹{cartSavings.toFixed(2)}
                            </Typography>
                        </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="bold">
                            Total:
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            ₹{cartTotal.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                        sx={{
                            py: 1.5,
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        Proceed to Checkout
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onClearCart}
                        disabled={cart.length === 0}
                        sx={{ py: 1 }}
                    >
                        Clear Cart
                    </Button>
                </Box>
            </Box>
        </Box>
    );
});

CartSummary.displayName = 'CartSummary';

const MarketplaceModule = () => {
    const { data: session, update } = useSession();
    const router = useRouter();

    // Custom hooks
    const { existingPlan, loading: planLoading, error: planError } = useExistingPlan(session);
    const myplan = existingPlan?.modules[0]?.plans[0]

    // Helper function to calculate price and savings
    const calculatePricing = (id, originalPrice, myplan) => {
        let price, savings;

        if (myplan?.FreeAddons?.includes(id)) {
            price = 0;
            savings = originalPrice;
        } else if (myplan?.planName === "Pulse") {
            price = 99;
            savings = originalPrice - 99;
        } else {
            price = 199;
            savings = originalPrice - 199;
        }

        return { price, savings };
    };

    // Base product data (no duplicate logic)
    const baseProducts = [
        {
            id: "FTM0825",
            name: "FinTrack",
            description: "Comprehensive finance tracking and management solution",
            category: "Finance",
            originalPrice: 299,
            image: "https://granicus.com/wp-content/uploads/2023/08/blog-header-CRM-government-768x472.jpg",
            tags: ["Finance", "Tracking", "Management"],
            brand: "Woxox",
            sku: "FINTRACK-FTM0825",
        },
        {
            id: "HRM0825",
            name: "Talent",
            description: "HR recruitment and talent management tool",
            category: "HR-Recruitment",
            originalPrice: 299,
            image: "/api/placeholder/200/150",
            tags: ["HR", "Recruitment", "Talent"],
            brand: "Woxox",
            sku: "TALENT-HRM0825",
        },
        {
            id: "SLM0825",
            name: "Sales & Billing",
            description: "Sales and billing management system",
            category: "Billing",
            originalPrice: 299,
            image: "/api/placeholder/200/150",
            tags: ["Sales", "Billing", "Finance"],
            brand: "Woxox",
            sku: "SALES-BILLING-SLM0825",
        },
        {
            id: "PLM0825",
            name: "Pipeline Manager",
            description: "Workflow and pipeline management solution",
            category: "Workflow",
            originalPrice: 299,
            image: "/api/placeholder/200/150",
            tags: ["Pipeline", "Workflow", "Management"],
            brand: "Woxox",
            sku: "PIPELINE-PLM0825",
        },
        {
            id: "FDM0825",
            name: "Files Manager",
            description: "Secure file management and storage tool",
            category: "Storage",
            originalPrice: 299,
            image: "/api/placeholder/200/150",
            tags: ["Files", "Storage", "Manager"],
            brand: "Woxox",
            sku: "FILES-MANAGER-FDM0825",
        },
        {
            id: "TGM0825",
            name: "Tag Manager",
            description: "Advanced tag management system for developers",
            category: "Development",
            originalPrice: 299,
            image: "/api/placeholder/200/150",
            tags: ["Tags", "Development", "Manager"],
            brand: "Microsoft",
            sku: "TAG-MANAGER-TGM0825",
        },
    ];

    const [products, setProducts] = useState([])
    // Final products with computed pricing
    useEffect(() => {
        const myplan = existingPlan?.modules[0]?.plans[0]
        if (existingPlan) {
            const products = baseProducts.map((product) => {
                const { price, savings } = calculatePricing(product.id, product.originalPrice, myplan);
                return {
                    ...product,
                    price,
                    savings,
                    rating: null,
                    reviews: 0,
                    features: [],
                    isAddon: false,
                    popular: false,
                };
            });
            setProducts(products)
        }
    }, [existingPlan])




    const MARKETPLACE_DATA = {
        categories: [
            { id: 'all', name: 'All Products', icon: '️' },
            { id: 'software', name: 'Software Tools', icon: '💻' },
            { id: 'templates', name: 'Templates', icon: '📋' },
            { id: 'services', name: 'Services', icon: '🔧' },
            { id: 'training', name: 'Training', icon: '🎓' },
            { id: 'addons', name: 'Add-ons', icon: '➕' }
        ],
    };

    const {
        cart,
        cartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        cartSavings,
        toggleCart
    } = useCart();
    const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites();
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // Local state
    const [activeTab, setActiveTab] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);

    // Precompute existing plan access for O(1) lookups
    const existingAddonIds = useMemo(() => {
        if (!existingPlan?.modules?.length) return new Set();
        const ids = [];
        for (const moduleq of existingPlan.modules) {
            for (const plan of moduleq.plans || []) {
                for (const access of plan.moduleAccess || []) {
                    if (access?.addonId) ids.push(access.addonId);
                    if (access?.addonName) ids.push(access.addonName);
                }
            }
        }
        return new Set(ids);
    }, [existingPlan]);

    // Memoized filtered products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            const query = deferredSearchQuery.trim().toLowerCase();
            const matchesSearch = query.length === 0 ||
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.tags.some(tag => tag.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, deferredSearchQuery]);

    // Memoized addon products
    const addonProducts = useMemo(() =>
        products.filter(product => product.isAddon),
        [products]
    );

    // Memoized favorite products
    const favoriteProducts = useMemo(() =>
        products.filter(product => favorites.has(product.id)),
        [favorites, products]
    );

    // Check if product is already in existing plan
    const isProductInExistingPlan = useCallback((productId) => {
        if (existingAddonIds.size === 0) return false;
        return existingAddonIds.has(productId);
    }, [existingAddonIds]);

    // Enhanced add to cart with better validation
    const handleAddToCart = useCallback((product) => {
        if (isProductInExistingPlan(product.id)) {
            showSnackbar('This product is already part of your existing plan!', 'info');
            return;
        }

        // Check if product is already in cart
        const existingCartItem = cart.find(item => item.id === product.id);
        if (existingCartItem && existingCartItem.quantity >= 10) {
            showSnackbar('Maximum quantity limit reached for this product!', 'warning');
            return;
        }

        addToCart(product);
        showSnackbar(`${product.name} added to cart!`, 'success');

        // Auto-open cart on mobile for better UX
        if (window.innerWidth < 768) {
            toggleCart();
        }
    }, [isProductInExistingPlan, addToCart, showSnackbar, cart, toggleCart]);

    // Product modal functions
    const openProductModal = useCallback((product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    }, []);

    const closeProductModal = useCallback(() => {
        setSelectedProduct(null);
        setIsProductModalOpen(false);
    }, []);

    // Enhanced checkout function
    const handleCheckout = useCallback(() => {
        if (cart.length === 0) {
            showSnackbar('Your cart is empty!', 'warning');
            return;
        }

        const checkoutData = {
            modules: [{
                moduleName: 'Products',
                plans: [{
                    planName: 'Marketplace Products',
                    basePrice: cartTotal,
                    features: cart.map(item => ({
                        addonId: item.id,
                        addonName: item.name,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        quantity: item.quantity,
                        brand: item.brand,
                        total: item.price * item.quantity,
                        sku: item.sku,
                        savings: item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0
                    }))
                }]
            }],
            billingCycle: 'monthly',
            autoRenew: true,
            employeeLimit: 1,
            additionalUserPrice: 0,
            leadLimit: -1,
            campaignLimit: -1,
            cartTotal,
            cartSavings,
            itemCount: cartItemCount
        };

        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        router.push('/en/manager/marketplace/checkout');
    }, [cart, cartTotal, cartSavings, cartItemCount, router, showSnackbar]);

    // Navigation functions
    const handleManageSubscription = useCallback(() => {
        router.push('/en/manager/subscription');
    }, [router]);

    // Debounced search (optional optimization)
    const debouncedSearchQuery = useMemo(() => deferredSearchQuery, [deferredSearchQuery]);

    return (
        <Box sx={{ p: 3 }}>
            {/* Header with enhanced cart button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Marketplace
                </Typography>


                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<i className='ri-price-tag-line' />}
                        onClick={handleManageSubscription}
                    >
                        Manage Subscription
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<i className="ri-heart-line" />}
                        onClick={() => setActiveTab(1)}
                    >
                        Favorites ({favoritesCount})
                    </Button>

                    <Badge badgeContent={cartItemCount} color="primary" max={99}>
                        <Button
                            variant="contained"
                            startIcon={<i className="ri-shopping-cart-line" />}
                            onClick={toggleCart}
                        >
                            Cart
                        </Button>
                    </Badge>
                </Box>
            </Box>

            {/* Existing Plan Display */}
            {/* <ExistingPlanDisplay
                existingPlan={existingPlan}
                loading={planLoading}
                error={planError}
                onManageSubscription={handleManageSubscription}
            /> */}

            {/* Search and Filters */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search products..."
                            value={debouncedSearchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <i className="ri-search-line" style={{ marginRight: 8, color: '#757575' }} />
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {MARKETPLACE_DATA.categories.map((category) => (
                                <Chip
                                    key={category.id}
                                    label={`${category.icon} ${category.name}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                    color={selectedCategory === category.id ? 'primary' : 'default'}
                                    variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label={`All Products (${filteredProducts.length})`} />
                    <Tab label={`Favorites (${favoritesCount})`} />
                    <Tab label={`Add-ons (${addonProducts.length})`} />
                </Tabs>
            </Box>

            {/* Products Grid */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {filteredProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                            <ProductCard
                                product={product}
                                isInExistingPlan={isProductInExistingPlan(product.id)}
                                isFavorite={isFavorite(product.id)}
                                onToggleFavorite={() => toggleFavorite(product.id)}
                                onAddToCart={handleAddToCart}
                                onViewDetails={() => openProductModal(product)}
                                cartQuantity={cart.find(item => item.id === product.id)?.quantity || 0}
                                onUpdateQuantity={updateQuantity}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Favorites Tab */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {favoriteProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                            <ProductCard
                                product={product}
                                isInExistingPlan={isProductInExistingPlan(product.id)}
                                isFavorite={isFavorite(product.id)}
                                onToggleFavorite={() => toggleFavorite(product.id)}
                                onAddToCart={handleAddToCart}
                                onViewDetails={() => openProductModal(product)}
                                cartQuantity={cart.find(item => item.id === product.id)?.quantity || 0}
                                onUpdateQuantity={updateQuantity}
                            />
                        </Grid>
                    ))}

                    {favoriteProducts.length === 0 && (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <i className="ri-heart-line" style={{ fontSize: 64, color: '#bdbdbd', marginBottom: 16 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No favorites yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Start adding products to your favorites
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Add-ons Tab */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    {addonProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                            <ProductCard
                                product={product}
                                isInExistingPlan={isProductInExistingPlan(product.id)}
                                isFavorite={isFavorite(product.id)}
                                onToggleFavorite={() => toggleFavorite(product.id)}
                                onAddToCart={handleAddToCart}
                                onViewDetails={() => openProductModal(product)}
                                cartQuantity={cart.find(item => item.id === product.id)?.quantity || 0}
                                onUpdateQuantity={updateQuantity}
                            />
                        </Grid>
                    ))}

                    {addonProducts.length === 0 && (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <i className="ri-add-line" style={{ fontSize: 64, color: '#bdbdbd', marginBottom: 16 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No add-ons available
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Check back later for new add-ons
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Empty state for no products */}
            {activeTab === 0 && filteredProducts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <i
                        className="ri-shopping-basket-line"
                        style={{ fontSize: 64, color: '#bdbdbd', marginBottom: 16 }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {planLoading ? "Loading" : "No products found"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {planLoading ? "Filling your basket..." : "Try adjusting your search or filter criteria"}
                    </Typography>
                </Box>
            )}


            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={hideSnackbar}
            >
                <Alert
                    onClose={hideSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Enhanced Cart Drawer */}
            <Drawer
                anchor="right"
                open={cartOpen}
                onClose={toggleCart}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 400, md: 450 },
                        height: '100%'
                    }
                }}
            >
                <CartSummary
                    cart={cart}
                    cartTotal={cartTotal}
                    cartSavings={cartSavings}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onClearCart={clearCart}
                    onCheckout={handleCheckout}
                    onClose={toggleCart}
                />
            </Drawer>

            {/* Floating Action Button for mobile cart access */}
            <Fab
                color="primary"
                aria-label="cart"
                onClick={toggleCart}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', md: 'none' },
                    zIndex: 1000
                }}
            >
                <Badge badgeContent={cartItemCount} color="error" max={99}>
                    <i className="ri-shopping-cart-line" />
                </Badge>
            </Fab>
        </Box>
    );
};

export default MarketplaceModule;
