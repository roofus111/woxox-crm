"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import logo from '@assets/woxoxPNGlogo.png';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
import { useCallback } from 'react';

const CheckoutPage = () => {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [startFreeTrail, setStartFreeTrail] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(false); // Add this missing state
    const [activeStep, setActiveStep] = useState('summary');
    const [additionalUsers, setAdditionalUsers] = useState(0);
    const [welcomeModal, setWelcomeModal] = useState(true);
    const [billingInfo, setBillingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        country: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        sameAsBilling: true
    });
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        country: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        saveCard: false
    });
    const [formErrors, setFormErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const [trialStart] = useState(new Date());
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialStart.getDate() + 14);

    const formatDate = (date) =>
        date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    // Enhanced coupon codes
    const validCoupons = {
        'WELCOME20': { discount: 20, type: 'percentage', minAmount: 1000 },
        'SAVE50': { discount: 5000, type: 'fixed', minAmount: 0 },
        'YEARLY15': { discount: 15, type: 'percentage', minAmount: 5000 },
        'NEWUSER10': { discount: 10, type: 'percentage', minAmount: 500 }
    };
    useEffect(() => {
        setTimeout(() => {
            setWelcomeModal(false);
        }, 5000);
    }, []);
    // Load checkout data from localStorage
    useEffect(() => {
        const data = localStorage.getItem('checkoutData');
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                setCheckoutData(parsedData);
                // Set additional users from checkout data
                setAdditionalUsers(parsedData.additionalUsers || 0);
            } catch (error) {
                console.error('Error parsing checkout data:', error);
                router.push('/en/marketplace');
            }
        } else {
            router.push('/en/marketplace');
        }
        setIsLoading(false);
    }, [router]);

    // Enhanced calculations using the improved data structure
    const calculateTotals = () => {
        if (!checkoutData) return {
            subtotal: 0,
            tax: 0,
            total: 0,
            discount: 0,
            finalTotal: 0,
            savings: 0,
            originalTotal: 0,
            planCost: 0,
            productsCost: 0,
            additionalUsersCost: 0
        };

        // Use the pricing details from checkout data
        const pricingDetails = checkoutData.pricingDetails || {};
        console.log("pricingDetails", pricingDetails);
        // Calculate additional users cost
        const additionalUsersCost = additionalUsers * (checkoutData.additionalUserPrice || 0);
        console.log("additionalUsersCost", additionalUsersCost);
        // Recalculate plan cost with additional users
        const basePlanCost = pricingDetails.planCost || 0;
        console.log("basePlanCost", basePlanCost);
        const planCost = basePlanCost;
        const productsCost = pricingDetails.productsCost || 0;
        const discount = discountApplied?.type === 'fixed' ? discountApplied?.discount : planCost * (discountApplied?.discount / 100) || 0
        console.log(discount);

        return {
            subtotal: planCost + productsCost || 0,
            tax: (planCost + productsCost - discount) * 0.18 || 0,
            total: pricingDetails.total || 0,
            discount: discount || 0, // Will be calculated when coupon is applied
            finalTotal: (planCost + productsCost - discount) + (planCost + productsCost - discount) * 0.18,
            savings: pricingDetails.savings || 0,
            originalTotal: pricingDetails.originalTotal || 0,
            planCost: planCost,
            productsCost: pricingDetails.productsCost || 0,
            additionalUsersCost: additionalUsersCost
        };
    };

    // Get tax rate based on country
    const getTaxRate = (country) => {
        const taxRates = {
            'India': 0.18, // 18% GST
        };
        return taxRates[country] || 0.18; // Default 8%
    };

    // Enhanced coupon validation and application
    const applyCoupon = async () => {
        if (!discountCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError('');

        // Simulate API call
        setTimeout(() => {
            const coupon = validCoupons[discountCode.toUpperCase()];

            if (coupon) {
                const { subtotal } = calculateTotals();

                if (subtotal >= coupon.minAmount) {
                    setDiscountApplied(coupon);
                    setCouponError('');
                } else {
                    setCouponError(`Minimum order amount of ₹${coupon.minAmount} required`);
                }
            } else {
                setCouponError('Invalid coupon code');
            }

            setIsApplyingCoupon(false);
        }, 1000);
    };

    // Remove coupon
    const removeCoupon = () => {
        setDiscountApplied(null);
        setDiscountCode('');
        setCouponError('');
    };

    // Enhanced validation functions
    const validateBillingForm = () => {
        const errors = {};

        // Personal Information
        if (!billingInfo.firstName.trim()) errors.firstName = 'First name is required';
        if (!billingInfo.lastName.trim()) errors.lastName = 'Last name is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!billingInfo.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(billingInfo.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Phone validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!billingInfo.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(billingInfo.phone.replace(/\s/g, ''))) {
            errors.phone = 'Please enter a valid phone number';
        }

        // Address validation
        if (!billingInfo.country.trim()) errors.country = 'Country is required';
        if (!billingInfo.address.trim()) errors.address = 'Address is required';
        if (!billingInfo.city.trim()) errors.city = 'City is required';
        if (!billingInfo.state.trim()) errors.state = 'State/Province is required';
        if (!billingInfo.zipCode.trim()) errors.zipCode = 'ZIP/Postal code is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePaymentForm = () => {
        const errors = {};

        // Card number validation (Luhn algorithm)
        if (!paymentInfo.cardNumber.trim()) {
            errors.cardNumber = 'Card number is required';
        } else if (!isValidCardNumber(paymentInfo.cardNumber.replace(/\s/g, ''))) {
            errors.cardNumber = 'Please enter a valid card number';
        }

        if (!paymentInfo.cardHolder.trim()) errors.cardHolder = 'Card holder name is required';

        // Expiry date validation
        if (!paymentInfo.expiryDate.trim()) {
            errors.expiryDate = 'Expiry date is required';
        } else if (!isValidExpiryDate(paymentInfo.expiryDate)) {
            errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
        }

        // CVV validation
        if (!paymentInfo.cvv.trim()) {
            errors.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
            errors.cvv = 'CVV must be 3 or 4 digits';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Card validation helpers
    const isValidCardNumber = (cardNumber) => {
        if (!/^\d{13,19}$/.test(cardNumber)) return false;

        // Luhn algorithm
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    };

    const isValidExpiryDate = (expiryDate) => {
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;

        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expMonth = parseInt(month);
        const expYear = parseInt(year);

        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;

        return true;
    };

    // Enhanced form submissions
    const handleBillingSubmit = () => {
        if (validateBillingForm()) {
            setStartFreeTrail(true);
            // setActiveStep('confirmation');
        }
    };

    const handlePaymentSubmit = async () => {
        if (validatePaymentForm()) {
            setIsProcessing(true);

            // Simulate payment processing with better UX
            setTimeout(() => {
                setIsProcessing(false);
                setActiveStep('confirmation');

                // Store order data for confirmation
                const orderData = {
                    orderId: generateOrderId(),
                    orderDate: new Date(),
                    billingInfo,
                    shippingInfo,
                    paymentInfo: {
                        ...paymentInfo,
                        cardNumber: `**** **** **** ${paymentInfo.cardNumber.slice(-4)}`
                    },
                    checkoutData,
                    totals: calculateTotals()
                };

                localStorage.setItem('orderData', JSON.stringify(orderData));
                localStorage.removeItem('checkoutData');
            }, 3000);
        }
    };

    // Generate unique order ID
    const generateOrderId = () => {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substr(2, 5);
        return `ORD-${timestamp}-${randomStr}`.toUpperCase();
    };

    // Update shipping info when billing info changes
    useEffect(() => {
        if (billingInfo.sameAsBilling) {
            setShippingInfo({
                firstName: billingInfo.firstName,
                lastName: billingInfo.lastName,
                email: billingInfo.email,
                phone: billingInfo.phone,
                company: billingInfo.company,
                country: billingInfo.country,
                address: billingInfo.address,
                city: billingInfo.city,
                state: billingInfo.state,
                zipCode: billingInfo.zipCode
            });
        }
    }, [billingInfo]);

    // Auto-format card number
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    // Auto-format expiry date
    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    // Handle additional users change
    const handleAdditionalUsersChange = (newCount) => {
        const maxAdditionalUsers = 100; // Set a reasonable limit
        if (newCount >= 0 && newCount <= maxAdditionalUsers) {
            setAdditionalUsers(newCount);

            // Update checkout data in localStorage
            const updatedData = {
                ...checkoutData,
                additionalUsers: newCount
            };
            localStorage.setItem('checkoutData', JSON.stringify(updatedData));
            setCheckoutData(updatedData);
        }
    };

    // Handle product quantity change
    const handleProductQuantityChange = (productId, newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= 100) { // Set reasonable limits
            const updatedData = {
                ...checkoutData,
                modules: checkoutData.modules.map(module => {
                    if (module.moduleName === 'Products') {
                        return {
                            ...module,
                            plans: module.plans.map(plan => ({
                                ...plan,
                                features: plan.features.map(product =>
                                    product.id === productId
                                        ? { ...product, quantity: newQuantity }
                                        : product
                                )
                            }))
                        };
                    }
                    return module;
                })
            };

            // Update localStorage and state
            localStorage.setItem('checkoutData', JSON.stringify(updatedData));
            setCheckoutData(updatedData);
        }
    };

    // Remove product from cart
    const handleRemoveProduct = (productId) => {
        const updatedData = {
            ...checkoutData,
            modules: checkoutData.modules.map(module => {
                if (module.moduleName === 'Products') {
                    return {
                        ...module,
                        plans: module.plans.map(plan => ({
                            ...plan,
                            features: plan.features.filter(product => product.id !== productId)
                        }))
                    };
                }
                return module;
            })
        };

        // Update localStorage and state
        localStorage.setItem('checkoutData', JSON.stringify(updatedData));
        setCheckoutData(updatedData);
    };

    const submitHandler = async () => {
        try {
            if (!checkoutData?.modules?.[0]?.plans?.[0]) {
                toast.error('Invalid checkout data');
                return;
            }

            setLoading(true);

            const companyId = session?.user?.company;
            const plan = checkoutData.modules[0].plans[0];
            const postData = {
                companyId,
                modules: [
                    {
                        moduleName: 'CRM',
                        plans: {
                            planName: plan.planName,
                            price: plan.basePrice,
                            durationMonths: 1,
                            features: plan.features,
                            leadLimit: checkoutData.leadLimit || -1,
                            campaignLimit: checkoutData.campaignLimit || -1,
                            isActive: true,
                            employeeLimit: checkoutData.employeeLimit,
                            moduleAccess: checkoutData?.modules[1]?.plans[0]?.features,
                            FreeAddons: plan.FreeAddons
                        }
                    }
                ],
                validTill: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                billingInfo: billingInfo,
                paymentInfo: totals
            };
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/create`,
                postData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                try {
                    toast.success('Plan created successfully');
                    setWelcomeModal(true);
                    router.refresh();
                    await update({
                        ...session,
                        user: {
                            ...session.user,
                            plan: response.data.purchase
                        }
                    });

                    // console.log(session.user.plan, 'session 5');
                    // router.push('/en/dashboards/crm');
                } catch (updateError) {
                    console.error('Session update failed:', updateError);
                }
            } else {
                toast.error('Failed to create plan');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!checkoutData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No checkout data found</p>
                    <button
                        onClick={() => router.push('/en/marketplace')}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Return to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();
    console.log(totals);


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <Image src={logo} alt="logo" className="h-6 w-28 sm:h-6 sm:w-28" />
                    <div className="flex items-center space-x-4">
                        <h6 className="text-lg sm:text-xl font-bold text-gray-900">
                            Checkout
                        </h6>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center space-x-4">
                        {['summary', 'billing', 'payment', 'confirmation'].map((step, index) => (
                            <div key={step} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${activeStep === step
                                    ? 'bg-blue-500 text-white'
                                    : index < ['summary', 'billing', 'payment', 'confirmation'].indexOf(activeStep)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {index < ['summary', 'billing', 'payment', 'confirmation'].indexOf(activeStep) ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${activeStep === step ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                    {step.charAt(0).toUpperCase() + step.slice(1)}
                                </span>
                                {index < 3 && (
                                    <div className={`ml-4 w-16 h-0.5 ${index < ['summary', 'billing', 'payment', 'confirmation'].indexOf(activeStep)
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2">
                        {/* Purchase Summary */}
                        {activeStep === 'summary' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Summary</h2>

                                {/* Plan Summary */}
                                {checkoutData.modules.find(m => m.moduleName === 'CRM') && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h3 className="font-semibold text-gray-900 mb-2">Selected Plan</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    {checkoutData.modules.find(m => m.moduleName === 'CRM').plans[0].planName} Plan
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {checkoutData.employeeLimit} Users • {checkoutData.autoRenew ? 'Auto-renew' : 'Manual renewal'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Billing: {checkoutData.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                                                </p>
                                                {totals.savings > 0 && (
                                                    <p className="text-sm text-green-600 font-medium">
                                                        You save ₹{totals.savings.toFixed(2)}!
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {/* ₹{totals.planCost.toLocaleString()} */}
                                                    ₹{checkoutData.modules[0].plans[0].basePrice}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    per {checkoutData.billingCycle === 'monthly' ? 'month' : 'year'}
                                                </p>
                                                {totals.savings > 0 && (
                                                    <p className="text-sm text-gray-500 line-through">
                                                        ₹{totals.originalTotal.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Users Management */}
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">Additional Users : ₹{checkoutData.additionalUserPrice || 0}/ per {checkoutData.billingCycle === 'monthly' ? 'month' : 'year'}</h4>
                                                    <p className="text-xs text-gray-600">
                                                        Add more users to your plan
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleAdditionalUsersChange(additionalUsers - 1)}
                                                        disabled={additionalUsers <= 0}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${additionalUsers <= 0
                                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                            }`}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                                                        {additionalUsers}
                                                    </span>
                                                    <button
                                                        onClick={() => handleAdditionalUsersChange(additionalUsers + 1)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                            </div>
                                            {/* 
                                            <div className="flex items-center justify-between">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ₹{checkoutData.additionalUserPrice || 0}/user
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        per {checkoutData.billingCycle === 'monthly' ? 'month' : 'year'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ₹{totals.additionalUsersCost.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Total additional cost
                                                    </p>
                                                </div>
                                            </div> */}

                                            {/* Additional Users Breakdown */}
                                            {totals.additionalUsersCost > 0 && (
                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Base Plan:</span>
                                                        <span className="text-gray-900">₹{(totals.planCost - totals.additionalUsersCost).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Additional Users ({additionalUsers}):</span>
                                                        <span className="text-gray-900">₹{totals.additionalUsersCost.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* User Limit Info */}
                                            <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                                                <div className="text-xs text-blue-800 text-center">
                                                    <p className="font-medium">
                                                        Total Users: {checkoutData.employeeLimit + additionalUsers}
                                                    </p>
                                                    <p>
                                                        {checkoutData.employeeLimit} included + {additionalUsers} additional
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Products Summary */}
                                {checkoutData.modules.find(m => m.moduleName === 'Products') && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-3">Selected Products</h3>
                                        <div className="space-y-3">
                                            {checkoutData.modules.find(m => m.moduleName === 'Products').plans[0].features.map((product, index) => (
                                                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                                                    {product.image ? (
                                                                        <Image
                                                                            src={product.image}
                                                                            alt={product.name}
                                                                            width={40}
                                                                            height={40}
                                                                            className="rounded object-cover"
                                                                        />
                                                                    ) : (
                                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="text-sm text-gray-700 font-medium">{product.name}</span>
                                                                    <p className="text-xs text-gray-500">{product.brand}</p>
                                                                    <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveProduct(product.id)}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                            title="Remove product"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-xs text-gray-600 font-medium">Quantity:</span>
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => handleProductQuantityChange(product.id, product.quantity - 1)}
                                                                    disabled={product.quantity <= 1}
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${product.quantity <= 1
                                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                                        }`}
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                                                                    {product.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleProductQuantityChange(product.id, product.quantity + 1)}
                                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="flex items-center space-x-2">
                                                                {product.originalPrice > product.price && (
                                                                    <span className="text-xs text-gray-500 line-through">
                                                                        ₹{product.originalPrice.toFixed(2)}
                                                                    </span>
                                                                )}
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    ₹{product.price.toFixed(2)} each
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-xs text-gray-600">Total:</span>
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    ₹{(product.price * product.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                            {product.savings > 0 && (
                                                                <p className="text-xs text-green-600 text-right">
                                                                    Save ₹{(product.savings * product.quantity).toFixed(2)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Products Summary Footer */}
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Total Products:</span>
                                                <span className="font-medium text-gray-900">
                                                    {checkoutData.modules.find(m => m.moduleName === 'Products').plans[0].features.reduce((total, product) => total + product.quantity, 0)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-1">
                                                <span className="text-gray-600">Products Subtotal:</span>
                                                <span className="font-medium text-gray-900">
                                                    ₹{totals.productsCost.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={() => setActiveStep('billing')}
                                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Continue to Billing
                                </button>
                            </div>
                        )}

                        {/* Billing Information Form */}
                        {activeStep === 'billing' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Information</h2>

                                <form className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={billingInfo.firstName}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, firstName: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {formErrors.firstName && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={billingInfo.lastName}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, lastName: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {formErrors.lastName && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={billingInfo.email}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {formErrors.email && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={billingInfo.phone}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {formErrors.phone && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                value={billingInfo.company}
                                                onChange={(e) => setBillingInfo({ ...billingInfo, company: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Country *
                                                </label>
                                                <select
                                                    value={billingInfo.country}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.country ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">Select Country</option>
                                                    <option value="India">India</option>
                                                    <option value="United States">United States</option>
                                                    <option value="United Kingdom">United Kingdom</option>
                                                    <option value="Canada">Canada</option>
                                                    <option value="Australia">Australia</option>
                                                    <option value="Germany">Germany</option>
                                                    <option value="France">France</option>
                                                    <option value="Japan">Japan</option>
                                                </select>
                                                {formErrors.country && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ZIP/Postal Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={billingInfo.zipCode}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, zipCode: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {formErrors.zipCode && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Street Address *
                                            </label>
                                            <input
                                                type="text"
                                                value={billingInfo.address}
                                                onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.address ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Street address, P.O. box, company name"
                                            />
                                            {formErrors.address && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={billingInfo.city}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.city ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {formErrors.city && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    State/Province *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={billingInfo.state}
                                                    onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.state ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {formErrors.state && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                id="sameAsBilling"
                                                checked={billingInfo.sameAsBilling}
                                                onChange={(e) => setBillingInfo({ ...billingInfo, sameAsBilling: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="sameAsBilling" className="ml-2 text-sm font-medium text-gray-700">
                                                Shipping address same as billing address
                                            </label>
                                        </div>

                                        {!billingInfo.sameAsBilling && (
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                                        <input
                                                            type="text"
                                                            value={shippingInfo.firstName}
                                                            onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                                        <input
                                                            type="text"
                                                            value={shippingInfo.lastName}
                                                            onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                                    <input
                                                        type="text"
                                                        value={shippingInfo.address}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                                        <input
                                                            type="text"
                                                            value={shippingInfo.city}
                                                            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                                        <input
                                                            type="text"
                                                            value={shippingInfo.state}
                                                            onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep('summary')}
                                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleBillingSubmit}
                                            className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Payment Information Form */}
                        {activeStep === 'payment' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

                                <form className="space-y-6">
                                    {/* Card Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Card Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Card Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentInfo.cardNumber}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: formatCardNumber(e.target.value) })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                />
                                                {formErrors.cardNumber && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cardholder Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentInfo.cardHolder}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value })}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.cardHolder ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="John Doe"
                                                />
                                                {formErrors.cardHolder && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.cardHolder}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Expiry Date *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentInfo.expiryDate}
                                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: formatExpiryDate(e.target.value) })}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                    />
                                                    {formErrors.expiryDate && (
                                                        <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        CVV *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentInfo.cvv}
                                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                        placeholder="123"
                                                        maxLength="4"
                                                    />
                                                    {formErrors.cvv && (
                                                        <p className="text-red-500 text-xs mt-1">{formErrors.cvv}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Card Option */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="saveCard"
                                            checked={paymentInfo.saveCard}
                                            onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="saveCard" className="ml-2 text-sm font-medium text-gray-700">
                                            Save this card for future payments
                                        </label>
                                    </div>

                                    {/* Security Notice */}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium">Secure Payment</p>
                                                <p>Your payment information is encrypted and secure. We never store your full card details.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep('billing')}
                                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePaymentSubmit}
                                            disabled={isProcessing}
                                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${isProcessing
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Processing Payment...
                                                </div>
                                            ) : (
                                                'Complete Payment'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Confirmation */}
                        {activeStep === 'confirmation' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                                    <p className="text-gray-600">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Order ID:</span>
                                            <span className="font-medium text-gray-900">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-medium text-gray-900">₹{totals.finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push('/en/marketplace')}
                                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Print Receipt
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                            {/* Plan Cost */}
                            {checkoutData.modules.find(m => m.moduleName === 'CRM') && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Plan Cost</span>
                                        <span className="text-sm font-medium text-gray-900">₹{totals.originalTotal.toLocaleString()}</span>
                                    </div>
                                    {totals.additionalUsersCost > 0 && (
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Base: ₹{(totals.planCost - totals.additionalUsersCost).toLocaleString()}</span>
                                            <span>+{additionalUsers} users: ₹{totals.additionalUsersCost.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Products Cost */}
                            {checkoutData.modules.find(m => m.moduleName === 'Products') && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Products</span>
                                        <span className="text-sm font-medium text-gray-900">₹{totals.productsCost.toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {checkoutData.modules.find(m => m.moduleName === 'Products').plans[0].features.reduce((total, product) => total + product.quantity, 0)} items
                                    </div>
                                </div>
                            )}

                            {/* Subtotal */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Subtotal</span>
                                <span className="text-sm font-medium text-gray-900">₹{totals.subtotal.toLocaleString()}</span>
                            </div>

                            {/* Tax */}
                            {totals.tax > 0 && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Tax</span>
                                    <span className="text-sm font-medium text-gray-900">₹{totals.tax.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Discount */}
                            {/* {discountApplied && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Discount</span>
                                    <span className="text-sm font-medium text-green-600">-₹{discountApplied?.discount.toLocaleString()}</span>
                                </div>
                            )} */}
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Discount Code</h4>
                                {!discountApplied ? (
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                                placeholder="Enter coupon code"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                onClick={applyCoupon}
                                                disabled={isApplyingCoupon}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isApplyingCoupon
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                            >
                                                {isApplyingCoupon ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-red-500 text-xs">{couponError}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-green-800 font-medium">
                                                {discountApplied.discount}{discountApplied.type === 'percentage' ? '%' : '₹'} OFF
                                            </span>
                                            <button
                                                onClick={removeCoupon}
                                                className="text-green-600 hover:text-green-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-lg font-semibold text-gray-900">Total</span>
                                    <span className="text-lg font-semibold text-gray-900">₹{totals.finalTotal.toLocaleString()}</span>
                                </div>
                                {totals.savings > 0 && (
                                    <p className="text-sm text-green-600 text-center">
                                        You save ₹{totals.savings.toLocaleString()}!
                                    </p>
                                )}
                            </div>

                            {/* Billing Cycle Info */}
                            {checkoutData.modules.find(m => m.moduleName === 'CRM') && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-600 text-center">
                                        <p className="font-medium">
                                            {checkoutData.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Billing
                                        </p>
                                        <p>
                                            {checkoutData.billingCycle === 'yearly' ? 'Save 17% with annual billing' : 'Switch to yearly to save 17%'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Coupon Code Section */}




                            {/* Progress Indicator */}
                            {activeStep !== 'confirmation' && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-2">Checkout Progress</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${(['summary', 'billing', 'payment', 'confirmation'].indexOf(activeStep) + 1) * 25}%`
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Step {['summary', 'billing', 'payment', 'confirmation'].indexOf(activeStep) + 1} of 4
                                    </div>
                                </div>
                            )}

                            {/* Security Badges */}
                            {activeStep === 'payment' && (
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            SSL Secure
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            PCI Compliant
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Help Section */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2 text-sm">Need Help?</h4>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <p>• Contact support: support@woxox.com</p>
                                    <p>• Live chat available 24/7</p>
                                    <p>• Money-back guarantee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-2 text-lg font-bold text-gray-900">₹{totals.finalTotal.toFixed(2)}</span>
                    </div>
                    {activeStep === 'summary' && (
                        <button
                            onClick={() => setActiveStep('billing')}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                            Continue
                        </button>
                    )}
                    {activeStep === 'billing' && (
                        <button
                            onClick={handleBillingSubmit}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                            Continue to Payment
                        </button>
                    )}
                    {activeStep === 'payment' && (
                        <button
                            onClick={handlePaymentSubmit}
                            disabled={isProcessing}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${isProcessing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                    )}
                </div>
            </div>

            {startFreeTrail && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">
                        No need to pay now
                    </h2>
                    <p className="text-gray-600 mb-4 text-lg">
                        Start your <span className="font-semibold">14-day free trial</span> today!
                    </p>

                    <div className="bg-gray-50 border rounded-lg p-4 mb-5">
                        <p className="text-sm text-gray-500">
                            Trial Period:
                        </p>
                        <p className="text-gray-700 font-medium">
                            {formatDate(trialStart)} → {formatDate(trialEnd)}
                        </p>
                    </div>

                    <button onClick={submitHandler} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200">
                        Start Free Trial
                    </button>
                </div>
            </div>}
            {welcomeModal && <div className="fixed inset-0 flex items-center bg-white bg-opacity-90 justify-center">
                <div className="flex h-screen items-center justify-center ">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-300"></div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default CheckoutPage;
