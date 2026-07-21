"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    DialogActions,
    TextField,
    Tabs,
    Tab,
    Divider,
    Alert,
    Snackbar,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Fade,
    Zoom,
    Skeleton,
    LinearProgress,
    Slide,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CircularProgress } from "@mui/material";
import useFakeProgress from "@/utils/useFakeProgress";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Enhanced submit handlers with API integration
const SubscriptionManagementPage = () => {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [installer, setInstaller] = useState(false)
    const [uninstaller, setUninstaller] = useState(false)

    const { progress, start, reset } = useFakeProgress(50);

    // Custom hooks for subscription management
    const useSubscriptionData = (session) => {
        const [subscriptionData, setSubscriptionData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchSubscriptionData = async () => {
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

                    if (response.status != 500) {
                        setSubscriptionData(response.data.purchase);
                    }
                } catch (error) {
                    console.error('Error fetching subscription data:', error);
                    setError('Failed to fetch subscription details');
                } finally {
                    setLoading(false);
                }
            };

            fetchSubscriptionData();
        }, [session]);

        return { subscriptionData, loading, error, setSubscriptionData };
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

    // Available plans data
    const AVAILABLE_PLANS = {
        CRM: [
            {
                id: 'crm_lite',
                name: 'Lite',
                price: 499,
                durationMonths: 1,
                features: [
                    '2 Free Users',
                    '2000 Active Leads',
                    'Up to 5 Campaigns',
                    'Basic analytics',
                    'Access add-ons',
                    'Email support'
                ],
                limits: {
                    employeeLimit: 3,
                    leadLimit: 2000,
                    campaignLimit: 5
                },
                popular: false
            },
            {
                id: 'crm_pro',
                name: 'Professional',
                price: 999,
                durationMonths: 1,
                features: [
                    '5 Free Users',
                    '5000 Active Leads',
                    'Up to 15 Campaigns',
                    'Advanced analytics',
                    'Priority support',
                    'Custom integrations',
                    'API access'
                ],
                limits: {
                    employeeLimit: 10,
                    leadLimit: 5000,
                    campaignLimit: 15
                },
                popular: true
            },
            {
                id: 'crm_enterprise',
                name: 'Enterprise',
                price: 1999,
                durationMonths: 1,
                features: [
                    'Unlimited Users',
                    'Unlimited Leads',
                    'Unlimited Campaigns',
                    'Enterprise analytics',
                    '24/7 support',
                    'Custom development',
                    'White-label options'
                ],
                limits: {
                    employeeLimit: -1,
                    leadLimit: -1,
                    campaignLimit: -1
                },
                popular: false
            }
        ]
    };

    // Available add-ons
    const AVAILABLE_ADDONS = [
        {
            id: 'HRM0825',
            name: 'Talent Management',
            description: 'Advanced HR talent management features',
            price: 149,
            unit: 'user',
            features: [
                'Talent Acquisition',
                'Performance Management',
                'Career Planning',
                'Succession Planning',
                'Employee Engagement'
            ],
            category: 'HR'
        },
        {
            id: 'ANALYTICS001',
            name: 'Advanced Analytics',
            description: 'Enhanced analytics and reporting capabilities',
            price: 99,
            unit: 'month',
            features: [
                'Advanced Reports',
                'Custom Dashboards',
                'Data Export',
                'Predictive Analytics',
                'Real-time Insights'
            ],
            category: 'Analytics'
        },
        {
            id: 'SUPPORT001',
            name: 'Premium Support',
            description: 'Priority customer support and dedicated account manager',
            price: 199,
            unit: 'month',
            features: [
                'Priority Support',
                'Dedicated Account Manager',
                'Custom Training',
                'SLA Guarantee',
                'Phone Support'
            ],
            category: 'Support'
        }
    ];

    // Component for displaying current plan details
    const CurrentPlanCard = React.memo(({ subscriptionData, onUpgrade, onManageBilling }) => {
        if (!subscriptionData) return null;

        const currentPlan = subscriptionData.modules[0]?.plans[0];
        const daysUntilExpiry = Math.ceil((new Date(subscriptionData.validTill) - new Date()) / (1000 * 60 * 60 * 24));

        return (

            <Card sx={{ mb: 3, border: '2px solid #e3f2fd' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Subscription Purchase Plan
                        </Typography>
                        <Chip
                            label={subscriptionData.planType}
                            color={subscriptionData.planType === 'free trial' ? 'warning' : 'success'}
                            variant="outlined"
                        />
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Plan: Woxox {currentPlan?.planName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Purchased Date:{new Date(subscriptionData.purchaseDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </Typography>
                            {/* <Typography variant="body2" color="text.secondary" gutterBottom>
                                Industry: {subscriptionData.companyId?.industry}
                            </Typography> */}
                            {/* <Typography variant="body2" color="text.secondary" gutterBottom>
                                Valid till: {new Date(subscriptionData.validTill).toLocaleDateString()}
                            </Typography> */}

                            {daysUntilExpiry > 0 && (
                                <Alert severity={daysUntilExpiry <= 7 ? 'warning' : 'info'} sx={{ mt: 2 }}>
                                    {daysUntilExpiry <= 7
                                        ? `Expires in ${daysUntilExpiry} days!`
                                        : `Expires in ${daysUntilExpiry} days`
                                    }
                                </Alert>
                            )}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Plan Includes
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                <Chip
                                    label={`${currentPlan?.employeeLimit} Users`}
                                    size="small"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`${currentPlan?.leadLimit === -1 ? "Unlimited" : currentPlan?.leadLimit} Leads`} size="small"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`${currentPlan?.campaignLimit === -1 ? "Unlimited" : currentPlan?.leadLimit} Campaigns`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            {/* <Typography variant="h6" gutterBottom>
                                Features
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                {currentPlan?.features?.map((feature, index) => (
                                    <Typography
                                        key={index}
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                                    >
                                        <i className="ri-check-line" style={{ marginRight: 8, color: '#4caf50' }} />
                                        {feature}
                                    </Typography>
                                ))}
                            </Box> */}
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Auto-renew: {subscriptionData.autoRenew ? 'Enabled' : 'Disabled'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Next billing: {new Date(subscriptionData.validTill).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={onManageBilling}
                            >
                                Manage Billing
                            </Button>
                            <Button
                                variant="contained"
                                onClick={onUpgrade}
                            >
                                Upgrade Plan
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

        );
    });

    CurrentPlanCard.displayName = 'CurrentPlanCard';

    // Component for displaying active add-ons
    const ActiveAddonsCard = React.memo(({ subscriptionData, onManageAddons, onUninstallAddon, setSubscriptionData }) => {
        const [showUninstallDialog, setShowUninstallDialog] = useState(false);
        const [addonToUninstall, setAddonToUninstall] = useState(null);
        const [confirmText, setConfirmText] = useState('');

        if (!subscriptionData) return null;

        const activeAddons = subscriptionData.modules[0]?.plans[0]?.moduleAccess || [];

        const handleUninstallClick = (addon) => {
            setAddonToUninstall(addon);
            setConfirmText('');
            setShowUninstallDialog(true);
        };

        const confirmUninstall = () => {
            if (addonToUninstall && confirmText.toLowerCase() === 'confirm') {
                onUninstallAddon(addonToUninstall);
                setShowUninstallDialog(false);
                setAddonToUninstall(null);
                setConfirmText('');
            }
        };

        const handleCloseUninstallDialog = () => {
            setShowUninstallDialog(false);
            setAddonToUninstall(null);
            setConfirmText('');
        };


        const handleInstallAddon = async (addon) => {

            try {
                // setProcessing(true);
                setInstaller(true)
                start()
                console.log(addon);
                const token = localStorage.getItem("token")
                // Prepare uninstall data for API
                const uninstallPayload = {
                    addonId: addon._id,
                };

                // API call to uninstall add-on
                const response = await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/install-addons/${subscriptionData?._id}`,
                    uninstallPayload,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 200 || response.status === 201) {

                    toast.success("done")
                    // Refresh subscription data
                    const updatedResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${subscriptionData?._id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    console.log(updatedResponse.data?.purchase);

                    if (updatedResponse.data?.purchase) {
                        // setSubscriptionData(updatedResponse.data.purchase);
                        await update({
                            ...session,
                            user: {
                                ...session.user,
                                plan: updatedResponse.data?.purchase
                            }
                        });
                        setTimeout(function () {
                            reset()
                            setTimeout(function () {
                                setInstaller(false)
                            }, 5000);
                        }, 10000);
                    }
                } else {
                    throw new Error('Failed to uninstall add-on');
                }

            } catch (error) {
                console.error('Error uninstalling add-on:', error);
                // showSnackbar('Failed to uninstall add-on. Please try again.', 'error');
            } finally {
                // setProcessing(false);
            }
        };

        if (activeAddons.length === 0) {
            return (
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <i className="ri-add-line" style={{ fontSize: 48, color: '#bdbdbd', marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Active Add-ons
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Enhance your plan with powerful add-ons
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={onManageAddons}
                            sx={{ mt: 2 }}
                            startIcon={<i className="ri-add-line" />}
                        >
                            Browse Add-ons
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <>
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                                Manage Add-ons ({activeAddons.length})
                            </Typography>
                            {/* <Button
                                variant="outlined"
                                onClick={onManageAddons}
                                startIcon={<i className="ri-settings-3-line" />}
                            >
                                Manage Add-ons
                            </Button> */}
                        </Box>

                        <Grid container spacing={2}>
                            {activeAddons.map((addon, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <Card sx={{
                                        p: 2,
                                        border: '1px solid #e0e0e0',
                                        // backgroundColor: '#f1f8e9',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 2
                                        }
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ backgroundColor: '#e0e0e0', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '70px', height: '70px' }}>

                                            </Box>
                                            <Box sx={{ flex: 1, padding: '12px' }}>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {addon.addonName}
                                                    </Typography>
                                                </Box>



                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                    Purchased On: {new Date(addon.activatedDate).toLocaleDateString()}
                                                </Typography>

                                                {addon.features && addon.features.length > 0 && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                            Features:
                                                        </Typography>
                                                        {addon.features.slice(0, 2).map((feature, featureIndex) => (
                                                            <Typography
                                                                key={featureIndex}
                                                                variant="caption"
                                                                sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}
                                                            >
                                                                <i className="ri-check-line" style={{ marginRight: 4, color: '#4caf50', fontSize: 12 }} />
                                                                {feature}
                                                            </Typography>
                                                        ))}
                                                        {addon.features.length > 2 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                +{addon.features.length - 2} more features
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 100 }}>
                                                {addon.isActive ? <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleUninstallClick(addon)}
                                                    startIcon={<i className="ri-delete-bin-line" />}
                                                    sx={{ fontSize: '0.75rem' }}
                                                >
                                                    Uninstall
                                                </Button> : <Button
                                                    variant="outlined"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleInstallAddon(addon)}
                                                    startIcon={<i className="ri-delete-bin-line" />}
                                                    sx={{ fontSize: '0.75rem' }}
                                                >
                                                    Reactivate
                                                </Button>}
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {addon.price == 0 ? "FREE" : `₹ ${addon.price}`}/{addon.unit}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Uninstall Confirmation Dialog */}
                <Dialog open={showUninstallDialog} onClose={handleCloseUninstallDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className="ri-error-warning-line" style={{ color: '#f44336', fontSize: 24 }} />
                            <Typography variant="h6" color="error">
                                Confirm Uninstall
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                            Are you sure you want to uninstall <strong>{addonToUninstall?.addonName}</strong>?
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            This action will:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                            <li>Remove all add-on features and data</li>
                            <li>Stop billing for this add-on</li>
                            <li>Cannot be undone without reinstalling</li>
                        </Box>

                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Warning:</strong> This action is permanent and will remove all associated data.
                            </Typography>
                        </Alert>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            To confirm this action, please type <strong>"confirm"</strong> in the field below:
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="Type 'confirm' to proceed"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            error={confirmText.length > 0 && confirmText.toLowerCase() !== 'confirm'}
                            helperText={
                                confirmText.length > 0 && confirmText.toLowerCase() !== 'confirm'
                                    ? 'Please type "confirm" exactly as shown'
                                    : 'Type "confirm" to enable the uninstall button'
                            }
                            sx={{ mt: 1 }}
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUninstallDialog}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={confirmUninstall}
                            disabled={confirmText.toLowerCase() !== 'confirm'}
                            startIcon={<i className="ri-delete-bin-line" />}
                        >
                            Uninstall {addonToUninstall?.addonName}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    });

    ActiveAddonsCard.displayName = 'ActiveAddonsCard';

    // Component for plan comparison and upgrade
    const PlanUpgradeCard = React.memo(({ currentPlan, onUpgrade, onClose }) => {
        const [selectedPlan, setSelectedPlan] = useState(null);
        const [billingCycle, setBillingCycle] = useState('monthly');

        const handleUpgrade = () => {
            if (!selectedPlan) return;

            const upgradeData = {
                planId: selectedPlan.id,
                billingCycle,
                currentPlan: currentPlan?.planName,
                upgradeType: 'plan_change'
            };

            localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
            onUpgrade(upgradeData);
        };

        return (
            <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Typography variant="h5">Upgrade Your Plan</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Billing Cycle</InputLabel>
                            <Select
                                value={billingCycle}
                                onChange={(e) => setBillingCycle(e.target.value)}
                            >
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="yearly">Yearly (Save 20%)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Grid container spacing={3}>
                        {AVAILABLE_PLANS.CRM.map((plan) => (
                            <Grid item xs={12} md={4} key={plan.id}>
                                <Card
                                    sx={{
                                        border: selectedPlan?.id === plan.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#1976d2',
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    <CardContent>
                                        {plan.popular && (
                                            <Chip
                                                label="Most Popular"
                                                color="warning"
                                                sx={{ mb: 2 }}
                                            />
                                        )}

                                        <Typography variant="h5" gutterBottom>
                                            {plan.name}
                                        </Typography>

                                        <Typography variant="h4" color="primary" gutterBottom>
                                            ₹{billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price}
                                            <Typography variant="body2" component="span">
                                                /{billingCycle === 'yearly' ? 'year' : 'month'}
                                            </Typography>
                                        </Typography>

                                        {billingCycle === 'yearly' && (
                                            <Typography variant="body2" color="success.main" gutterBottom>
                                                Save ₹{Math.round(plan.price * 12 * 0.2)} per year
                                            </Typography>
                                        )}

                                        <Box sx={{ mb: 2 }}>
                                            {plan.features.map((feature, index) => (
                                                <Typography
                                                    key={index}
                                                    variant="body2"
                                                    sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                                >
                                                    <i className="ri-check-line" style={{ marginRight: 8, color: '#4caf50' }} />
                                                    {feature}
                                                </Typography>
                                            ))}
                                        </Box>

                                        <Button
                                            variant={selectedPlan?.id === plan.id ? "contained" : "outlined"}
                                            fullWidth
                                            onClick={() => setSelectedPlan(plan)}
                                        >
                                            {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpgrade}
                        disabled={!selectedPlan}
                    >
                        Upgrade to {selectedPlan?.name}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    });

    PlanUpgradeCard.displayName = 'PlanUpgradeCard';

    // Component for add-on management
    const AddonManagementCard = React.memo(({ subscriptionData, onClose, onAddAddon, onRemoveAddon, onUninstallAddon }) => {
        const [selectedAddons, setSelectedAddons] = useState([]);
        const [showUninstallDialog, setShowUninstallDialog] = useState(false);
        const [addonToUninstall, setAddonToUninstall] = useState(null);
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedCategory, setSelectedCategory] = useState('all');
        const [confirmText, setConfirmText] = useState('');

        const handleAddAddon = () => {
            if (selectedAddons.length === 0) return;

            const addonData = {
                addons: selectedAddons,
                action: 'add',
                currentPlan: subscriptionData?.modules[0]?.plans[0]?.planName
            };

            onAddAddon(addonData);
            setSelectedAddons([]);
        };

        const handleRemoveAddon = (addonId) => {
            onRemoveAddon(addonId);
        };

        const handleUninstallAddon = (addon) => {
            setAddonToUninstall(addon);
            setConfirmText('');
            setShowUninstallDialog(true);
        };

        const confirmUninstall = () => {
            if (addonToUninstall && confirmText.toLowerCase() === 'confirm') {
                onUninstallAddon(addonToUninstall);
                setShowUninstallDialog(false);
                setAddonToUninstall(null);
                setConfirmText('');
            }
        };

        const handleCloseUninstallDialog = () => {
            setShowUninstallDialog(false);
            setAddonToUninstall(null);
            setConfirmText('');
        };

        // Filter addons based on search and category
        const filteredAddons = useMemo(() => {
            return AVAILABLE_ADDONS.filter(addon => {
                const matchesSearch = addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    addon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    addon.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesCategory = selectedCategory === 'all' || addon.category === selectedCategory;
                return matchesSearch && matchesCategory;
            });
        }, [searchQuery, selectedCategory]);

        const categories = useMemo(() => {
            const cats = ['all', ...new Set(AVAILABLE_ADDONS.map(addon => addon.category))];
            return cats;
        }, []);

        return (
            <>
                <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5">Manage Add-ons</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                    label={`${selectedAddons.length} Selected`}
                                    color="primary"
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {/* Search and Filter Section */}
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search add-ons..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: <i className="ri-search-line" style={{ marginRight: 8, color: '#757575' }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {categories.map((category) => (
                                            <Chip
                                                key={category}
                                                label={category === 'all' ? 'All Categories' : category}
                                                onClick={() => setSelectedCategory(category)}
                                                color={selectedCategory === category ? 'primary' : 'default'}
                                                variant={selectedCategory === category ? 'filled' : 'outlined'}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Selected Add-ons Summary */}
                        {selectedAddons.length > 0 && (
                            <Box sx={{ mb: 3, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    Selected Add-ons ({selectedAddons.length})
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedAddons.map((addon) => (
                                        <Chip
                                            key={addon.id}
                                            label={addon.name}
                                            onDelete={() => setSelectedAddons(prev => prev.filter(a => a.id !== addon.id))}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Add-ons Grid */}
                        <Grid container spacing={2}>
                            {filteredAddons.map((addon) => {
                                const isActive = subscriptionData?.modules[0]?.plans[0]?.moduleAccess?.some(
                                    active => active.addonId === addon.id
                                );
                                const isSelected = selectedAddons.some(selected => selected.id === addon.id);
                                const activeAddon = subscriptionData?.modules[0]?.plans[0]?.moduleAccess?.find(
                                    active => active.addonId === addon.id
                                );

                                return (
                                    <Grid item xs={12} md={6} key={addon.id}>
                                        <Card sx={{
                                            p: 2,
                                            border: isActive ? '2px solid #4caf50' : '1px solid #e0e0e0',
                                            backgroundColor: isActive ? '#f1f8e9' : 'white',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: 3
                                            }
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            {addon.name}
                                                        </Typography>
                                                        {addon.category && (
                                                            <Chip
                                                                label={addon.category}
                                                                size="small"
                                                                variant="outlined"
                                                                color="secondary"
                                                            />
                                                        )}
                                                    </Box>

                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        {addon.description}
                                                    </Typography>

                                                    <Typography variant="h6" color="primary" gutterBottom>
                                                        ₹{addon.price}/{addon.unit}
                                                    </Typography>

                                                    {isActive && activeAddon && (
                                                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                                                            Installed on: {new Date(activeAddon.activatedDate).toLocaleDateString()}
                                                        </Typography>
                                                    )}

                                                    <Box sx={{ mb: 2 }}>
                                                        {addon.features.slice(0, 3).map((feature, index) => (
                                                            <Typography
                                                                key={index}
                                                                variant="body2"
                                                                sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                                                            >
                                                                <i className="ri-check-line" style={{ marginRight: 8, color: '#4caf50' }} />
                                                                {feature}
                                                            </Typography>
                                                        ))}
                                                        {addon.features.length > 3 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                +{addon.features.length - 3} more features
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 120 }}>
                                                    <Chip
                                                        label={isActive ? "Installed" : "Available"}
                                                        color={isActive ? "success" : "default"}
                                                        size="small"
                                                    />

                                                    {isActive ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleUninstallAddon(activeAddon)}
                                                                startIcon={<i className="ri-delete-bin-line" />}
                                                            >
                                                                Uninstall
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleRemoveAddon(addon.id)}
                                                                startIcon={<i className="ri-subtract-line" />}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Box>
                                                    ) : (
                                                        <Button
                                                            variant={isSelected ? "outlined" : "contained"}
                                                            size="small"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
                                                                } else {
                                                                    setSelectedAddons(prev => [...prev, addon]);
                                                                }
                                                            }}
                                                            startIcon={isSelected ? <i className="ri-check-line" /> : <i className="ri-add-line" />}
                                                        >
                                                            {isSelected ? 'Selected' : 'Select'}
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {filteredAddons.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <i className="ri-search-line" style={{ fontSize: 48, color: '#bdbdbd', marginBottom: 16 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No add-ons found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try adjusting your search or filter criteria
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Close</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddAddon}
                            disabled={selectedAddons.length === 0}
                            startIcon={<i className="ri-add-line" />}
                        >
                            Install Selected ({selectedAddons.length})
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Uninstall Confirmation Dialog */}
                <Dialog open={showUninstallDialog} onClose={handleCloseUninstallDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className="ri-error-warning-line" style={{ color: '#f44336', fontSize: 24 }} />
                            <Typography variant="h6" color="error">
                                Confirm Uninstall
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                            Are you sure you want to uninstall <strong>{addonToUninstall?.addonName}</strong>?
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            This action will:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                            <li>Remove all add-on features and data</li>
                            <li>Stop billing for this add-on</li>
                            <li>Cannot be undone without reinstalling</li>
                        </Box>

                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Warning:</strong> This action is permanent and will remove all associated data.
                            </Typography>
                        </Alert>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            To confirm this action, please type <strong>"confirm"</strong> in the field below:
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="Type 'confirm' to proceed"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            error={confirmText.length > 0 && confirmText.toLowerCase() !== 'confirm'}
                            helperText={
                                confirmText.length > 0 && confirmText.toLowerCase() !== 'confirm'
                                    ? 'Please type "confirm" exactly as shown'
                                    : 'Type "confirm" to enable the uninstall button'
                            }
                            sx={{ mt: 1 }}
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUninstallDialog}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={confirmUninstall}
                            disabled={confirmText.toLowerCase() !== 'confirm'}
                            startIcon={<i className="ri-delete-bin-line" />}
                        >
                            Uninstall {addonToUninstall?.addonName}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    });

    AddonManagementCard.displayName = 'AddonManagementCard';

    // Component for billing history
    const BillingHistoryCard = React.memo(({ subscriptionData }) => {
        // Mock billing history - in real app, this would come from API
        const [billingHistory, setBillingHistory] = useState([])

        async function fetchBilling() {
            const token = localStorage.getItem('token')
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/billing/all`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.status == 200 || response.status == 201) {
                console.log(response.data);
                setBillingHistory(response.data.billings);
            }
        }

        useEffect(() => {
            fetchBilling()
        }, [])


        // const billingHistory = [
        //     {
        //         id: '1',
        //         date: '2025-08-28',
        //         description: 'CRM Lite Plan - Monthly',
        //         amount: 499,
        //         status: 'Paid',
        //         invoice: 'INV-001'
        //     },
        //     {
        //         id: '2',
        //         date: '2025-08-28',
        //         description: 'Talent Management Addon',
        //         amount: 149,
        //         status: 'Paid',
        //         invoice: 'INV-002'
        //     }
        // ];

        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Billing History
                    </Typography>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Invoice</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {billingHistory.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell>{row.createdAt}</TableCell>
                                        <TableCell>Subscription Plan Purchase</TableCell>
                                        <TableCell align="right">₹{row.Payment.finalTotal}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                color={row.status === 'Paid' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>NA</TableCell>
                                        <TableCell>
                                            <Button size="small" variant="outlined">
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        );
    });

    const UpcomingPaymentCard = React.memo(({ subscriptionData }) => {
        // Calculate upcoming payment details based on subscription data
        const calculateUpcomingPayments = () => {
            if (!subscriptionData || !subscriptionData.modules) return [];

            const payments = [];
            const currentDate = new Date();
            const validTillDate = new Date(subscriptionData.validTill);

            // Calculate base subscription renewal
            if (subscriptionData.status === 'active') {
                subscriptionData.modules.forEach(module => {
                    module.plans.forEach(plan => {
                        if (plan.isActive) {
                            const nextPaymentDate = new Date(validTillDate);
                            nextPaymentDate.setMonth(nextPaymentDate.getMonth());
                            // + plan.durationMonths

                            payments.push({
                                id: `subscription-${module.moduleName}-${plan.planName}`,
                                date: nextPaymentDate.toISOString().split('T')[0],
                                description: `${module.moduleName} - ${plan.planName} Plan | ${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''} | Up to ${plan.employeeLimit} User${plan.employeeLimit > 1 ? 's' : ''}`,
                                amount: plan.price * plan.employeeLimit,
                                type: 'subscription',
                                status: 'Upcoming',
                                daysUntil: Math.ceil((nextPaymentDate - currentDate) / (1000 * 60 * 60 * 24))
                            });

                            // Add active paid addons
                            plan.moduleAccess?.forEach(addon => {
                                if (addon.isActive && addon.price > 0) {
                                    payments.push({
                                        id: `addon-${addon.addonId}`,
                                        date: nextPaymentDate.toISOString().split('T')[0],
                                        description: `${addon.addonName} Add-on (${addon.quantity} ${addon.unit}${addon.quantity > 1 ? 's' : ''})`,
                                        amount: addon.total,
                                        type: 'addon',
                                        status: 'Upcoming',
                                        daysUntil: Math.ceil((nextPaymentDate - currentDate) / (1000 * 60 * 60 * 24))
                                    });
                                }
                            });
                        }
                    });
                });
            }

            // Check for trial expiration (potential conversion to paid)
            // if (subscriptionData.planType === 'free trial' && subscriptionData.status === 'active') {
            //     const trialEndDate = new Date(validTillDate);
            //     const daysUntilTrial = Math.ceil((trialEndDate - currentDate) / (1000 * 60 * 60 * 24));

            //     if (daysUntilTrial > 0) {
            //         subscriptionData.modules.forEach(module => {
            //             module.plans.forEach(plan => {
            //                 if (plan.isActive) {
            //                     const nextPaymentDate = new Date(validTillDate);
            //                     nextPaymentDate.setMonth(nextPaymentDate.getMonth() + plan.durationMonths);
            //                     payments.push({
            //                         id: `trial-conversion-${module.moduleName}`,
            //                         date: trialEndDate.toISOString().split('T')[0],
            //                         description: `Trial Expiry - ${module.moduleName} ${plan.planName} Plan`,
            //                         amount: plan.price,
            //                         type: 'trial_conversion',
            //                         status: 'Action Required',
            //                         daysUntil: daysUntilTrial
            //                     });
            //                     plan.moduleAccess?.forEach(addon => {
            //                         if (addon.isActive && addon.price > 0) {
            //                             payments.push({
            //                                 id: `addon-${addon.addonId}`,
            //                                 date: trialEndDate.toISOString().split('T')[0],
            //                                 description: `${addon.addonName} Add-on (${addon.quantity} ${addon.unit}${addon.quantity > 1 ? 's' : ''})`,
            //                                 amount: addon.total,
            //                                 type: 'addon',
            //                                 status: 'Upcoming',
            //                                 daysUntil: daysUntilTrial
            //                             });
            //                         }
            //                     });
            //                 }
            //             });
            //         });
            //     }
            // }

            // Sort by date
            return payments.sort((a, b) => new Date(a.date) - new Date(b.date));
        };

        const upcomingPayments = calculateUpcomingPayments();
        console.log(upcomingPayments);

        const getStatusColor = (status) => {
            switch (status) {
                case 'Upcoming': return 'primary';
                case 'Action Required': return 'warning';
                case 'Overdue': return 'error';
                default: return 'default';
            }
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        };

        const getDaysUntilText = (days) => {
            if (days < 0) return 'Overdue';
            if (days === 0) return 'Today';
            if (days === 1) return 'Tomorrow';
            return `${days} days`;
        };

        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Upcoming Payments
                    </Typography>

                    {upcomingPayments.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="textSecondary">
                                {subscriptionData?.planType === 'free trial'
                                    ? 'No upcoming payments during trial period'
                                    : 'No upcoming payments scheduled'
                                }
                            </Typography>
                            {subscriptionData?.planType === 'free trial' && (
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    Trial expires on {formatDate(subscriptionData.validTill)}
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Due Date</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Days Until</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {upcomingPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{formatDate(payment.date)}</TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">
                                                        {payment.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {payment.type === 'trial_conversion' && 'Convert to paid plan'}
                                                        {payment.type === 'subscription' && 'Auto-renewal'}
                                                        {payment.type === 'addon' && 'Add-on renewal'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">₹{payment.amount}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payment.status}
                                                    color={getStatusColor(payment.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color={payment.daysUntil <= 7 ? 'error.main' : 'textPrimary'}
                                                    sx={{ fontWeight: payment.daysUntil <= 7 ? 'bold' : 'normal' }}
                                                >
                                                    {getDaysUntilText(payment.daysUntil)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {payment.type === 'trial_conversion' ? (
                                                    <Button size="small" variant="contained" color="primary">
                                                        Upgrade Now
                                                    </Button>
                                                ) : (
                                                    <Button size="small" variant="outlined">
                                                        Manage
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Summary Section */}
                    {upcomingPayments.length > 0 && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Payment Summary
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    Next Payment Due: {formatDate(upcomingPayments[0]?.date)}
                                </Typography>
                                <Tooltip
                                    title={
                                        <>
                                            <div>Subtotal: ₹{upcomingPayments.reduce((total, p) => total + p.amount, 0)}</div>
                                            <div>GST (18%): ₹{(upcomingPayments.reduce((total, p) => total + p.amount, 0) * 0.18).toFixed(2)}</div>
                                            <div><strong>Total: ₹{(upcomingPayments.reduce((total, p) => total + p.amount, 0) * 1.18).toFixed(2)}</strong></div>
                                        </>
                                    }
                                    arrow
                                >
                                    <Typography variant="h6" color="primary">
                                        ₹{(upcomingPayments.reduce((total, p) => total + p.amount, 0) * 1.18).toFixed(2)}
                                    </Typography>
                                </Tooltip>
                            </Box>
                            {subscriptionData?.autoRenew === false && (
                                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                                    ⚠️ Auto-renewal is disabled. Remember to renew manually.
                                </Typography>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        );
    });

    BillingHistoryCard.displayName = 'BillingHistoryCard';

    // Component for subscription settings
    const SubscriptionSettingsCard = React.memo(({ subscriptionData, onUpdateSettings }) => {
        const [autoRenew, setAutoRenew] = useState(subscriptionData?.autoRenew || false);
        const [emailNotifications, setEmailNotifications] = useState(true);
        const [smsNotifications, setSmsNotifications] = useState(false);

        const handleSaveSettings = () => {
            const settings = {
                autoRenew,
                emailNotifications,
                smsNotifications
            };
            onUpdateSettings(settings);
        };

        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Subscription Settings
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Billing Settings
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRenew}
                                        onChange={(e) => setAutoRenew(e.target.checked)}
                                    />
                                }
                                label="Auto-renew subscription"
                            />

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Your subscription will automatically renew on {new Date(subscriptionData?.validTill).toLocaleDateString()}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Notification Preferences
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                    />
                                }
                                label="Email notifications"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={smsNotifications}
                                        onChange={(e) => setSmsNotifications(e.target.checked)}
                                    />
                                }
                                label="SMS notifications"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            onClick={handleSaveSettings}
                        >
                            Save Settings
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    });

    SubscriptionSettingsCard.displayName = 'SubscriptionSettingsCard';
    // Custom hooks
    const { subscriptionData, loading, error, setSubscriptionData } = useSubscriptionData(session);
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // Local state
    const [activeTab, setActiveTab] = useState(0);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showAddonDialog, setShowAddonDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Enhanced plan upgrade handler with API integration
    const handleUpgrade = useCallback(async (upgradeData) => {
        try {
            setProcessing(true);

            // Prepare upgrade data for API
            const upgradePayload = {
                companyId: session?.user?.company,
                currentPlanId: subscriptionData?._id,
                upgradeType: 'plan_change',
                newPlan: {
                    planId: upgradeData.planId,
                    billingCycle: upgradeData.billingCycle,
                    planName: AVAILABLE_PLANS.CRM.find(p => p.id === upgradeData.planId)?.name,
                    price: AVAILABLE_PLANS.CRM.find(p => p.id === upgradeData.planId)?.price,
                    durationMonths: upgradeData.billingCycle === 'yearly' ? 12 : 1,
                    features: AVAILABLE_PLANS.CRM.find(p => p.id === upgradeData.planId)?.features,
                    limits: AVAILABLE_PLANS.CRM.find(p => p.id === upgradeData.planId)?.limits
                }
            };

            // Store upgrade data for checkout
            localStorage.setItem('upgradeData', JSON.stringify(upgradePayload));

            showSnackbar('Plan upgrade initiated successfully!', 'success');
            setShowUpgradeDialog(false);

            // Redirect to checkout page
            router.push('/en/manager/marketplace/checkout');

        } catch (error) {
            console.error('Error initiating plan upgrade:', error);
            showSnackbar('Failed to initiate plan upgrade. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, router, showSnackbar]);

    // Enhanced add-on management with API integration
    const handleAddAddon = useCallback(async (addonData) => {
        try {
            setProcessing(true);

            // Prepare addon data for API
            const addonPayload = {
                companyId: session?.user?.company,
                planId: subscriptionData?._id,
                action: 'add_addon',
                addons: addonData.addons.map(addon => ({
                    addonId: addon.id,
                    addonName: addon.name,
                    price: addon.price,
                    unit: addon.unit,
                    features: addon.features,
                    category: addon.category
                }))
            };

            // API call to add add-ons
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/addons`,
                addonPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSnackbar('Add-ons added successfully!', 'success');
                setShowAddonDialog(false);

                // Refresh subscription data
                const updatedResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${session.user.plan._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`
                        }
                    }
                );

                if (updatedResponse.data?.purchase) {
                    setSubscriptionData(updatedResponse.data.purchase);
                }
            } else {
                throw new Error('Failed to add add-ons');
            }

        } catch (error) {
            console.error('Error adding add-ons:', error);
            showSnackbar('Failed to add add-ons. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, setSubscriptionData, showSnackbar]);

    // Enhanced addon removal with API integration
    const handleRemoveAddon = useCallback(async (addonId) => {
        try {
            setProcessing(true);

            // Prepare removal data for API
            const removalPayload = {
                companyId: session?.user?.company,
                planId: subscriptionData?._id,
                action: 'remove_addon',
                addonId: addonId
            };

            // API call to remove add-on
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/addons/remove`,
                removalPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSnackbar('Add-on removed successfully!', 'success');

                // Refresh subscription data
                const updatedResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${session.user.plan._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`
                        }
                    }
                );

                if (updatedResponse.data?.purchase) {
                    setSubscriptionData(updatedResponse.data.purchase);
                }
            } else {
                throw new Error('Failed to remove add-on');
            }

        } catch (error) {
            console.error('Error removing add-on:', error);
            showSnackbar('Failed to remove add-on. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, setSubscriptionData, showSnackbar]);

    // Enhanced addon uninstall with API integration
    const handleUninstallAddon = useCallback(async (addon) => {
        try {
            setProcessing(true);
            start()
            setUninstaller(true)

            // Prepare uninstall data for API
            const uninstallPayload = {
                addonId: addon._id,
            };
            const token = localStorage.getItem('token')
            // API call to uninstall add-on
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/uninstall-addons/${subscriptionData?._id}`,
                uninstallPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSnackbar(`${addon.addonName} uninstalled successfully!`, 'success');

                // Refresh subscription data
                const updatedResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${session.user.plan._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`
                        }
                    }
                );

                if (updatedResponse.data?.purchase) {
                    setSubscriptionData(updatedResponse.data.purchase);
                    await update({
                        ...session,
                        user: {
                            ...session.user,
                            plan: updatedResponse.data?.purchase
                        }
                    });
                    setTimeout(function () {
                        reset()
                        setTimeout(function () {
                            setUninstaller(false)
                        }, 5000);
                    }, 10000);
                }
            } else {
                throw new Error('Failed to uninstall add-on');
            }

        } catch (error) {
            console.error('Error uninstalling add-on:', error);
            showSnackbar('Failed to uninstall add-on. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, setSubscriptionData, showSnackbar]);



    // Enhanced settings update with API integration
    const handleUpdateSettings = useCallback(async (settings) => {
        try {
            setProcessing(true);

            // Prepare settings data for API
            const settingsPayload = {
                companyId: session?.user?.company,
                planId: subscriptionData?._id,
                settings: {
                    autoRenew: settings.autoRenew,
                    emailNotifications: settings.emailNotifications,
                    smsNotifications: settings.smsNotifications
                }
            };

            // API call to update settings
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/settings`,
                settingsPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSnackbar('Settings updated successfully!', 'success');

                // Update local state
                setSubscriptionData(prev => ({
                    ...prev,
                    autoRenew: settings.autoRenew
                }));
            } else {
                throw new Error('Failed to update settings');
            }

        } catch (error) {
            console.error('Error updating settings:', error);
            showSnackbar('Failed to update settings. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, setSubscriptionData, showSnackbar]);

    // Enhanced billing management with API integration
    const handleManageBilling = useCallback(async () => {
        try {
            setProcessing(true);

            // Prepare billing data for API
            const billingPayload = {
                companyId: session?.user?.company,
                planId: subscriptionData?._id,
                action: 'manage_billing'
            };

            // API call to get billing portal URL
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/billing-portal`,
                billingPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );

            if (response.status === 200 && response.data?.billingPortalUrl) {
                // Redirect to billing portal
                window.open(response.data.billingPortalUrl, '_blank');
                showSnackbar('Redirecting to billing portal...', 'success');
            } else {
                // Fallback to local billing management
                showSnackbar('Opening billing management...', 'info');
                // You can implement local billing management here
            }

        } catch (error) {
            console.error('Error accessing billing portal:', error);
            showSnackbar('Failed to access billing portal. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, showSnackbar]);

    // Enhanced plan cancellation handler
    const handleCancelPlan = useCallback(async () => {
        try {
            setProcessing(true);

            // Prepare cancellation data for API
            const cancellationPayload = {
                companyId: session?.user?.company,
                planId: subscriptionData?._id,
                action: 'cancel_plan',
                reason: 'User requested cancellation',
                effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            };

            // API call to cancel plan
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/cancel`,
                cancellationPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSnackbar('Plan cancellation initiated successfully!', 'success');

                // Refresh subscription data
                const updatedResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${session.user.plan._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`
                        }
                    }
                );

                if (updatedResponse.data?.purchase) {
                    setSubscriptionData(updatedResponse.data.purchase);
                }
            } else {
                throw new Error('Failed to cancel plan');
            }

        } catch (error) {
            console.error('Error cancelling plan:', error);
            showSnackbar('Failed to cancel plan. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, setSubscriptionData, showSnackbar]);

    // Enhanced plan reactivation handler
    const handleReactivatePlan = useCallback(async () => {
        try {
            setProcessing(true);

            // Prepare reactivation data for API
            const reactivationPayload = {
                companyId: session?.user?.company,
                planId: subscriptionData?._id,
                action: 'reactivate_plan'
            };

            // API call to reactivate plan
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/reactivate`,
                reactivationPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSnackbar('Plan reactivated successfully!', 'success');

                // Refresh subscription data
                const updatedResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${session.user.plan._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`
                        }
                    }
                );

                if (updatedResponse.data?.purchase) {
                    setSubscriptionData(updatedResponse.data.purchase);
                }
            } else {
                throw new Error('Failed to reactivate plan');
            }

        } catch (error) {
            console.error('Error reactivating plan:', error);
            showSnackbar('Failed to reactivate plan. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, setSubscriptionData, showSnackbar]);

    // Enhanced checkout handler for plan upgrades
    const handleCheckoutUpgrade = useCallback(async (checkoutData) => {
        try {
            setProcessing(true);

            // Prepare checkout data for API
            const checkoutPayload = {
                companyId: session?.user?.company,
                currentPlanId: subscriptionData?._id,
                upgradeType: 'plan_change',
                newPlan: checkoutData.newPlan,
                billingInfo: checkoutData.billingInfo,
                paymentInfo: checkoutData.paymentInfo
            };

            // API call to process upgrade checkout
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/upgrade-checkout`,
                checkoutPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSnackbar('Plan upgrade completed successfully!', 'success');

                // Refresh subscription data
                const updatedResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${session.user.plan._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`
                        }
                    }
                );

                if (updatedResponse.data?.purchase) {
                    setSubscriptionData(updatedResponse.data.purchase);
                }

                // Redirect to dashboard
                router.push('/en/dashboards/crm');
            } else {
                throw new Error('Failed to complete plan upgrade');
            }

        } catch (error) {
            console.error('Error completing plan upgrade:', error);
            showSnackbar('Failed to complete plan upgrade. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    }, [session, subscriptionData, setSubscriptionData, router, showSnackbar]);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={150} sx={{ mb: 3 }} />
                {/* <Skeleton variant="rectangular" height={300}} /> */}
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Dialog
                open={installer || uninstaller}
                TransitionComponent={Transition}
                keepMounted
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
                    {installer ? `Installing...` : `Uninstalling...`}
                </DialogTitle>
                <DialogContent sx={{ textAlign: "center", py: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 3,
                        }}
                    >
                        <CircularProgress size={48} thickness={4} color={installer ? "primary" : "error"} />
                        <Typography variant="body1" color="text.secondary">
                            Please wait while we complete the {installer ? `installation` : `uninstallation...`}
                        </Typography>

                        {/* Progress bar */}
                        <Box sx={{ width: "100%", mt: 2 }}>
                            <LinearProgress
                                variant={progress >= 0 ? "determinate" : "indeterminate"}
                                value={progress >= 0 ? progress : undefined}
                                color={installer ? "primary" : "error"}
                            />
                            {progress >= 0 && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1, textAlign: "center" }}
                                >
                                    {progress}% completed
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Subscription Management
                </Typography>

                {processing && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                            Processing...
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Overview" />
                    <Tab label="Billing" />
                    <Tab label="Settings" />
                </Tabs>
            </Box>

            {/* Overview Tab */}
            {activeTab === 0 && (
                <Box>
                    <CurrentPlanCard
                        subscriptionData={subscriptionData}
                        onUpgrade={() => setShowUpgradeDialog(true)}
                        onManageBilling={handleManageBilling}
                        onCancelPlan={handleCancelPlan}
                        onReactivatePlan={handleReactivatePlan}
                    />

                    <ActiveAddonsCard
                        subscriptionData={subscriptionData}
                        onManageAddons={() => setShowAddonDialog(true)}
                        onUninstallAddon={handleUninstallAddon}
                    />
                </Box>
            )}

            {/* Billing Tab */}
            {activeTab === 1 && (
                <Box>
                    <UpcomingPaymentCard subscriptionData={subscriptionData} />
                    <BillingHistoryCard subscriptionData={subscriptionData} />
                </Box>
            )}

            {/* Settings Tab */}
            {activeTab === 2 && (
                <Box>
                    <SubscriptionSettingsCard
                        subscriptionData={subscriptionData}
                        onUpdateSettings={handleUpdateSettings}
                    />
                </Box>
            )}

            {/* Dialogs */}
            {showUpgradeDialog && (
                <PlanUpgradeCard
                    currentPlan={subscriptionData?.modules[0]?.plans[0]}
                    onUpgrade={handleUpgrade}
                    onClose={() => setShowUpgradeDialog(false)}
                    onCheckout={handleCheckoutUpgrade}
                />
            )}

            {showAddonDialog && (
                <AddonManagementCard
                    subscriptionData={subscriptionData}
                    onClose={() => setShowAddonDialog(false)}
                    onAddAddon={handleAddAddon}
                    onRemoveAddon={handleRemoveAddon}
                    onUninstallAddon={handleUninstallAddon}
                />
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
        </Box>
    );
};

export default SubscriptionManagementPage;
