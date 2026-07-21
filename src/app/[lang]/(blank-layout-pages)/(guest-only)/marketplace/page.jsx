"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import logo from '@assets/woxoxPNGlogo.png';
import { Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const Marketplace = () => {
  const router = useRouter();
  const { data: session } = useSession();
  console.log(session);

  const [favoriteItems, setFavoriteItems] = useState(new Set());
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');
  const [additionalUsers, setAdditionalUsers] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null); // For product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false); // For product modal



  const categories = [
    'All',
    'Finance',

  ];
  console.log(selectedPlan);


  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const products = {
    All: [
      {
        id: "FTM0825",
        name: 'FinTrack',
        brand: 'Woxox',
        price: selectedPlan?.FreeAddons?.includes('FTM0825') ? 0 : selectedPlan?.name === "Pulse" ? 99 : 199,
        originalPrice: 299,
        image: 'https://granicus.com/wp-content/uploads/2023/08/blog-header-CRM-government-768x472.jpg',
        category: 'Finance'
      },
      {
        id: "HRM0825",
        name: 'Talent',
        brand: 'Woxox',
        price: selectedPlan?.FreeAddons?.includes('HRM0825') ? 0 : selectedPlan?.name === "Pulse" ? 99 : 199,
        originalPrice: 299,
        image: '/api/placeholder/200/150',
        category: 'HR-Recruitment'
      },
      {
        id: "SLM0825",
        name: 'Sales & Billing',
        brand: 'Woxox',
        price: selectedPlan?.FreeAddons?.includes('SLM0825') ? 0 : selectedPlan?.name === "Pulse" ? 99 : 199,
        originalPrice: 299,
        image: '/api/placeholder/200/150',
        category: 'Billing'
      },
      {
        id: "PLM0825",
        name: 'Pipeline Manager',
        brand: 'Woxox',
        price: selectedPlan?.FreeAddons?.includes('PLM0825') ? 0 : selectedPlan?.name === "Pulse" ? 99 : 199,
        originalPrice: 399,
        image: '/api/placeholder/200/150',
        category: 'Workflow'
      },
      {
        id: "FDM0825",
        name: 'Files Manager',
        brand: 'Woxox',
        price: selectedPlan?.FreeAddons?.includes('FDM0825') ? 0 : selectedPlan?.name === "Pulse" ? 99 : 199,
        originalPrice: 299,
        image: '/api/placeholder/200/150',
        category: 'Storage'
      },
      {
        id: "TGM0825",
        name: 'Tag Manager',
        brand: 'Microsoft',
        price: selectedPlan?.FreeAddons?.includes('TGM0825') ? 0 : selectedPlan?.name === "Pulse" ? 99 : 199,
        originalPrice: 299,
        image: '/api/placeholder/200/150',
        category: 'Development'
      }
    ],
    Business: [
      {
        id: 3,
        name: 'PlayStation 5 825GB',
        brand: 'Sony',
        price: 684.60,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Business'
      },
      {
        id: 5,
        name: 'iPhone 14 Pro Max',
        brand: 'Apple',
        price: 1299.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Business'
      },
      {
        id: 7,
        name: 'ThinkPad X1 Carbon',
        brand: 'Lenovo',
        price: 1599.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Business'
      }
    ],
    Finance: [
      {
        id: 8,
        name: 'Financial Calculator',
        brand: 'HP',
        price: 89.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Finance'
      },
      {
        id: 9,
        name: 'Ledger Nano X',
        brand: 'Ledger',
        price: 149.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Finance'
      }
    ],
    Marketing: [
      {
        id: 10,
        name: 'Ring Light Kit',
        brand: 'Neewer',
        price: 79.99,
        originalPrice: 99.99,
        image: '/api/placeholder/200/150',
        category: 'Marketing'
      },
      {
        id: 11,
        name: 'Wireless Microphone',
        brand: 'Rode',
        price: 199.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Marketing'
      }
    ],
    'AI & ML': [
      {
        id: 12,
        name: 'NVIDIA RTX 4090',
        brand: 'NVIDIA',
        price: 1899.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'AI & ML'
      },
      {
        id: 13,
        name: 'Jetson Nano',
        brand: 'NVIDIA',
        price: 149.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'AI & ML'
      }
    ],
    Analytics: [
      {
        id: 4,
        name: 'Galaxy Watch4 40mm',
        brand: 'Samsung',
        price: 168.50,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Analytics'
      },
      {
        id: 14,
        name: 'Data Analytics Kit',
        brand: 'Intel',
        price: 299.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Analytics'
      }
    ],
    HR: [
      {
        id: 15,
        name: 'Conference Camera',
        brand: 'Logitech',
        price: 399.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'HR'
      },
      {
        id: 16,
        name: 'Employee Badge Printer',
        brand: 'Zebra',
        price: 249.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'HR'
      }
    ],
    Development: [
      {
        id: 1,
        name: 'MacBook Air 13 256Gb',
        brand: 'Apple',
        price: 935.90,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Development'
      },
      {
        id: 6,
        name: 'Surface Pro 9',
        brand: 'Microsoft',
        price: 899.99,
        originalPrice: 1099.99,
        image: '/api/placeholder/200/150',
        category: 'Development'
      },
      {
        id: 17,
        name: 'Mechanical Keyboard',
        brand: 'Corsair',
        price: 179.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Development'
      }
    ],
    Productivity: [
      {
        id: 2,
        name: 'Buds 4 Lite Black',
        brand: 'Xiaomi',
        price: 41.25,
        originalPrice: 55.90,
        image: '/api/placeholder/200/150',
        category: 'Productivity'
      },
      {
        id: 18,
        name: 'Standing Desk',
        brand: 'IKEA',
        price: 349.99,
        originalPrice: null,
        image: '/api/placeholder/200/150',
        category: 'Productivity'
      }
    ]
  };

  // Enhanced pricing plans with better structure
  const pricingPlans = {
    monthly: {
      lite: {
        price: 799,
        originalPrice: 1599, // Same as price for monthly
        period: 'month',
        name: 'Lite',
        maxUsers: 1,
        freeUsers: 0,
        additionalUserPrice: 799,
        savings: "50.00% off",
        leadLimit: 100000,
        campaignLimit: 25,
        features: [
          'Unlock Free Add-ons',
          '1,00,000 Active Leads',
          'Up to 25 Campaigns',
          'Access Marketplace',
          'Email support'
        ],
        FreeAddons: [
          'FTM0825', 'HRM0825', 'FDM0825'
        ]
      },
      pulse: {
        price: 1499,
        originalPrice: 2999,
        period: 'month',
        name: 'Pulse',
        maxUsers: 1,
        freeUsers: 0,
        additionalUserPrice: 1499,
        savings: "50.00% off",
        features: [
          'Unlock Free Add-ons',
          'Unlimited Active Leads',
          'Unlimited Campaigns',
          'Advanced analytics',
          'Access add-ons',
          'Priority support'
        ],
        FreeAddons: [
          'FTM0825', 'HRM0825', 'FDM0825'
        ]
      },
      enterprise: {
        price: null,
        originalPrice: null,
        period: 'month',
        comingSoon: true,
        name: 'Enterprise',
        maxUsers: 1,
        freeUsers: 0,
        additionalUserPrice: 0,
        savings: null,
        features: [
          'Features included in Pulse plan',
          'Custom Domain',
          'Custom Branding',
          'Customised Add-ons',
          'Customised Mobile App',
          'Customised Reports & Dashboards',
          '24/7 priority support'
        ]
      }
    },
    yearly: {
      lite: {
        price: 7195,
        originalPrice: 14391,
        period: 'year',
        savings: "50% off",
        name: 'Lite',
        maxUsers: 1,
        freeUsers: 2,
        additionalUserPrice: 5988,
        leadLimit: 2000,
        campaignLimit: 5,
        features: [
          '2 Free Users',
          '2000 Active Leads',
          'Up to 5 Campaigns',
          'Basic analytics',
          'Access add-ons',
          'Email support'
        ]
      },
      pulse: {
        price: 13495, // 1499 * 10 (2 months free)
        originalPrice: 26991, // 1499 * 12
        period: 'year',
        savings: '50% off',
        name: 'Pulse',
        maxUsers: 1,
        freeUsers: 0,
        additionalUserPrice: 14990,
        features: [
          'Unlock Free Add-ons',
          'Unlimited Active Leads',
          'Unlimited Campaigns',
          'Advanced analytics',
          'Access add-ons',
          'Priority support'
        ]
      },
      enterprise: {
        price: null,
        originalPrice: null,
        period: 'year',
        comingSoon: true,
        name: 'Enterprise',
        maxUsers: 1,
        freeUsers: 0,
        additionalUserPrice: 0,
        savings: null,
        features: [
          'Features included in Pulse plan',
          'Custom Domain',
          'Custom Branding',
          'Customised Add-ons',
          'Customised Mobile App',
          'Customised Reports & Dashboards',
          '24/7 priority support'
        ]
      }
    }
  };

  const toggleFavorite = (productId) => {
    setFavoriteItems(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const addToCart = (product) => {
    // Check if adding this product would exceed the plan limit for this specific product
    if (selectedPlan) {
      const currentProductQuantity = getProductQuantity(product.id);
      const maxQuantity = getTotalUsers();

      if (currentProductQuantity >= maxQuantity) {
        alert(`You can only add up to ${maxQuantity} of this product based on your plan limit.`);
        return;
      }
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Check if the new quantity would exceed the plan limit for this specific product
    if (selectedPlan) {
      const maxQuantity = getTotalUsers();

      if (newQuantity > maxQuantity) {
        alert(`You can only add up to ${maxQuantity} of this product based on your plan limit.`);
        return;
      }
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getProductQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Enhanced calculation functions with proper pricing logic
  const calculatePlanCost = () => {
    if (!selectedPlan) return 0;

    // Base plan cost
    const basePlanCost = selectedPlan.price || 0;

    // Additional users cost (only for additional users beyond the base + free)
    const additionalUsersCost = Math.max(0, additionalUsers) * selectedPlan.additionalUserPrice;

    return basePlanCost + additionalUsersCost;
  };

  const calculateProductsSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const calculateSubtotal = () => {
    return calculatePlanCost() + calculateProductsSubtotal();
  };

  const calculateTax = () => {
    // Tax is calculated on the subtotal (plan + products)
    return calculateSubtotal() * 0.18; // 18% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getTotalUsers = () => {
    if (!selectedPlan) return 0;
    // Total users = base users + additional users + free users
    return selectedPlan.maxUsers + additionalUsers + selectedPlan.freeUsers;
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedPlan(null);
    setAdditionalUsers(0);
    setActiveTab('plans'); // Switch to plans tab when clearing cart
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(false);
  };

  const handlePlanSelection = (planKey) => {
    const plan = pricingPlans[billingCycle][planKey];
    if (!plan.comingSoon) {
      setSelectedPlan({ key: planKey, ...plan });
      setActiveTab('products');
      setAdditionalUsers(0); // Reset additional users when plan changes
    }
  };

  const PricingCard = ({ plan, planData, isPopular = false }) => {
    const currentPlan = pricingPlans[billingCycle][plan];

    return (
      <div className={`bg-white border-2 ${isPopular ? 'border-blue-500' : 'border-gray-200'} rounded-2xl p-6 relative hover:border-blue-300 transition-colors`}>
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Most Popular
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {currentPlan.name}
          </h3>
          <div className="mb-4">
            {currentPlan.comingSoon ? (
              <span className="text-3xl font-bold text-gray-400">Contact Sales</span>
            ) : (
              <>
                <span className="text-3xl font-bold text-gray-900">
                  ₹{currentPlan.price === 0 ? '0' : currentPlan.price.toLocaleString()}
                </span>
                <span className="text-gray-600">/{currentPlan.period}</span>
                {currentPlan.originalPrice && (
                  <div className="mt-1">
                    <span className="text-sm text-gray-500 line-through">
                      ₹{currentPlan.originalPrice.toLocaleString()}
                    </span>
                    {currentPlan.savings && (
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        {currentPlan.savings}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {plan === 'lite' ? 'Perfect for small businesses' :
              plan === 'pulse' ? 'Best for growing businesses' :
                'For large organizations'}
          </p>
        </div>

        {/* Lite Plan Features */}
        {plan === 'lite' && (
          <>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlock Free Add-ons
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                1,00,000 Active Leads
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Up to 25 Campaigns
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access Marketplace
              </li>
              <li className="flex items-center text-sm text-gray-600" style={{ marginBottom: '52px' }}>
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Email support
              </li>


              <button
                onClick={() => handlePlanSelection(plan)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${currentPlan.comingSoon
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : isPopular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                {currentPlan.comingSoon ? 'Contact Sales' : 'Get Started'}
              </button>
              <hr className='border-be -mli-4 mbs-4' />
              <li className="flex items-center text-sm text-gray-600">
                <div className="flex justify-center items-center space-x-2 w-full">
                  <span>Free Add-ons</span>
                </div>
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Customer Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Calendar
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Task Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pipeline Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Third Party Integrations
              </li>
            </ul>
          </>
        )}

        {/* Pulse Plan Features */}
        {plan === 'pulse' && (
          <>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlock Free Add-ons
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited Active Leads
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited Campaigns
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access Marketplace
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Extra Discount on Add-ons
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
              <br />
              <button
                onClick={() => handlePlanSelection(plan)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${currentPlan.comingSoon
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : isPopular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                {currentPlan.comingSoon ? 'Contact Sales' : 'Get Started'}
              </button>
              <hr className='border-be -mli-4 mbs-4' />
              <li className="flex items-center text-sm text-gray-600">
                <div className="flex justify-center items-center space-x-2 w-full">
                  <span>Free Add-ons</span>
                </div>
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Customer Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Calendar
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Task Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pipeline Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Third Party Integrations
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                HR Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Finance Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Chat Module
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Documentation Manager
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sales Manager
              </li>
            </ul>
          </>
        )}

        {/* Enterprise Plan Features */}
        {plan === 'enterprise' && (
          <>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Features included in Pulse plan
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Custom Domain
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Custom Branding
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Customised Add-ons
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Customised Mobile App
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Customised Reports & Dashboards
              </li>

              <li className="flex items-center text-sm text-gray-600" style={{ marginBottom: '18px' }}>
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                24/7 priority support
              </li>
              <button
                onClick={() => handlePlanSelection(plan)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${currentPlan.comingSoon
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : isPopular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                {currentPlan.comingSoon ? 'Contact Sales' : 'Get Started'}
              </button>
              <hr className='border-be -mli-4 mbs-4' />
              <li className="flex items-center text-sm text-gray-600">
                <div className="flex justify-center items-center space-x-2 w-full">
                  <span>Free Add-ons</span>
                </div>
              </li>

            </ul>
          </>
        )}

        {/* <button
          onClick={() => handlePlanSelection(plan)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${currentPlan.comingSoon
            ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            : isPopular
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
        >
          {currentPlan.comingSoon ? 'Contact Sales' : 'Get Started'}
        </button> */}
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const isFavorite = favoriteItems.has(product.id);
    const quantity = getProductQuantity(product.id);

    // Calculate max quantity based on plan limits for this specific product
    const maxQuantity = selectedPlan ? getTotalUsers() : 0;
    const canAddMore = !selectedPlan || quantity < maxQuantity;

    return (
      <div className="bg-gray-50 rounded-3xl p-3 sm:p-4 relative cursor-pointer group hover:shadow-lg transition-shadow duration-200">
        <div
          className="aspect-square bg-white rounded-2xl mb-3 flex items-center justify-center overflow-hidden"
          onClick={() => openProductModal(product)}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs sm:text-sm text-center px-2">{product.name}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {product.price === 0 ? 'Free' : `₹${product.price.toFixed(2)}`}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <h3
            className="font-medium text-gray-900 text-xs sm:text-sm leading-tight cursor-pointer hover:text-blue-600"
            onClick={() => openProductModal(product)}
          >
            {product.name}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600">{product.brand}</p>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between mt-2">
            {quantity > 0 ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(product.id, quantity - 1);
                  }}
                  className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="text-sm font-medium min-w-[20px] text-center">
                  {quantity}
                  {maxQuantity > 0 && (
                    <span className="text-xs text-gray-500 block">/ {maxQuantity}</span>
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canAddMore) {
                      updateQuantity(product.id, quantity + 1);
                    }
                  }}
                  disabled={!canAddMore}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${canAddMore
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAddMore) {
                    addToCart(product);
                  }
                }}
                disabled={!canAddMore}
                className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors ${canAddMore
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {!selectedPlan ? 'Select Plan First' : 'Add to Cart'}
              </button>
            )}
          </div>

          {/* Show limit warning if applicable */}
          {selectedPlan && quantity >= maxQuantity && (
            <div className="mt-2 text-xs text-orange-600 text-center">
              Max quantity reached for this product
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProductModal = () => {
    if (!selectedProduct) return null;

    const quantity = getProductQuantity(selectedProduct.id);
    const maxQuantity = selectedPlan ? getTotalUsers() : 0;
    const canAddMore = !selectedPlan || quantity < maxQuantity;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={closeProductModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Image */}
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-6 flex items-center justify-center">
              <span className="text-gray-400 text-lg">{selectedProduct.name}</span>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-gray-600">{selectedProduct.brand}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{selectedProduct.price.toFixed(2)}
                  </div>
                  {selectedProduct.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{selectedProduct.originalPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This is a high-quality {selectedProduct.name} from {selectedProduct.brand}.
                  Perfect for {selectedProduct.category.toLowerCase()} needs, this product offers
                  exceptional performance and reliability. Whether you're looking to enhance your
                  workflow or upgrade your current setup, this {selectedProduct.name} delivers
                  outstanding value and functionality.
                </p>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Premium quality construction
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Reliable performance
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Easy to use and maintain
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Excellent customer support
                  </li>
                </ul>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(selectedProduct.id, Math.max(0, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium min-w-[30px] text-center">
                        {quantity}
                        {maxQuantity > 0 && (
                          <span className="text-sm text-gray-500 ml-1">/ {maxQuantity}</span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          if (canAddMore) {
                            updateQuantity(selectedProduct.id, quantity + 1);
                          }
                        }}
                        disabled={!canAddMore}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${canAddMore
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      Total: ₹{(selectedProduct.price * quantity).toFixed(2)}
                    </div>
                    {maxQuantity > 0 && (
                      <div className="text-sm text-gray-500">
                        Max: {maxQuantity} items
                      </div>
                    )}
                  </div>
                </div>

                {/* Show limit warning if applicable */}
                {selectedPlan && quantity >= maxQuantity && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-sm text-orange-800">
                      <strong>Quantity Limit Reached:</strong> You can only add up to {maxQuantity} of this product based on your {selectedPlan.name} plan ({getTotalUsers()} total users).
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeProductModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    if (canAddMore) {
                      addToCart(selectedProduct);
                      closeProductModal();
                    }
                  }}
                  disabled={!canAddMore}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${canAddMore
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {quantity > 0 ? 'Update Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartSummary = () => {
    if (!selectedPlan && cartItems.length === 0) {
      return (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Plan Summary */}
        {selectedPlan && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Plan: {selectedPlan.name}</h4>
              <span className="text-sm text-gray-600">
                ₹{selectedPlan.price === 0 ? '0' : selectedPlan.price.toLocaleString()}/{selectedPlan.period}
              </span>
            </div>



            {/* Hide Additional Users section for Pulse plan since it has no free users */}
            {selectedPlan.key !== 'pulse' && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Base Users: {selectedPlan.maxUsers}</span>
              </div>
            )}
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Additional Users:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAdditionalUsers(Math.max(0, additionalUsers - 1))}
                    className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{additionalUsers}</span>
                  <button
                    onClick={() => setAdditionalUsers(additionalUsers + 1)}
                    className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {additionalUsers > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                  Additional Users Cost: ₹{(additionalUsers * selectedPlan.additionalUserPrice).toLocaleString()}
                </div>
              )}
            </>
            <div className="text-sm font-medium text-gray-900">
              Total Users: {getTotalUsers()}
            </div>
          </div>
        )}

        {/* Products Summary */}
        {cartItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Products</h4>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">{item.name}</h5>
                  <p className="text-gray-600 text-xs">{item.brand}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Summary */}
        {(selectedPlan || cartItems.length > 0) && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-2 mb-4">
              {selectedPlan && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan Cost:</span>
                  <span className="font-medium">₹{calculatePlanCost().toFixed(2)}</span>
                </div>
              )}
              {cartItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products Subtotal:</span>
                  <span className="font-medium">₹{calculateProductsSubtotal().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18%):</span>
                <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors mb-3"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    );
  };

  // Enhanced function to pack data for checkout with proper pricing
  const packDataForCheckout = () => {
    if (!selectedPlan && cartItems.length === 0) return null;

    const purchaseData = {
      modules: [],
      purchaseDate: new Date(),
      validTill: null,
      status: 'active',
      planType: 'free trial',
      employeeLimit: 1,
      additionalUsers: additionalUsers,
      additionalUserPrice: selectedPlan.additionalUserPrice,
      autoRenew: false,
      paymentMethod: null,
      lastPaymentDate: null,
      nextPaymentDate: null,
      billingCycle: billingCycle,
      leadLimit: selectedPlan.leadLimit,
      campaignLimit: selectedPlan.campaignLimit,
      pricingDetails: {
        planCost: 0,
        productsCost: 0,
        additionalUsersCost: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        savings: 0,
        originalTotal: 0
      }
    };

    // Add plan data if selected
    if (selectedPlan) {
      const planType = selectedPlan.key === 'lite' ? 'basic' :
        selectedPlan.key === 'pulse' ? 'premium' : 'enterprise';

      purchaseData.planType = planType;
      purchaseData.freeUsers = selectedPlan.freeUsers;
      purchaseData.employeeLimit = getTotalUsers();
      purchaseData.autoRenew = billingCycle === 'yearly';

      // Calculate validTill based on billing cycle
      const validTill = new Date();
      if (billingCycle === 'monthly') {
        validTill.setMonth(validTill.getMonth() + 1);
      } else {
        validTill.setFullYear(validTill.getFullYear() + 1);
      }
      purchaseData.validTill = validTill;

      // Calculate plan pricing details
      const basePlanCost = selectedPlan.price || 0;
      const additionalUsersCost = Math.max(0, additionalUsers) * selectedPlan.additionalUserPrice;
      const totalPlanCost = basePlanCost + additionalUsersCost;

      // Calculate savings for yearly plans
      let savings = 0;
      let originalPrice = selectedPlan.price;

      if (billingCycle === 'yearly' && selectedPlan.originalPrice) {
        originalPrice = selectedPlan.originalPrice;
        savings = originalPrice - selectedPlan.price;
      }

      // Add module data based on plan
      const moduleData = {
        moduleName: 'CRM',
        planKey: selectedPlan.key,
        plans: [{
          planName: selectedPlan.name,
          price: totalPlanCost,
          originalPrice: originalPrice,
          basePrice: basePlanCost,
          additionalUsersPrice: additionalUsersCost,
          durationMonths: billingCycle === 'monthly' ? 1 : 12,
          billingCycle: billingCycle,
          features: getPlanFeatures(selectedPlan.key),
          isActive: true,
          FreeAddons: selectedPlan.FreeAddons,
          employeeLimit: getTotalUsers(),
          // moduleAccess: getModuleAccess(selectedPlan.key),
          pricing: {
            basePlanCost,
            additionalUsersCost,
            totalPlanCost,
            savings,
            perUserCost: selectedPlan.additionalUserPrice,
            freeUsers: selectedPlan.freeUsers,
            maxUsers: selectedPlan.maxUsers
          }
        }]
      };
      purchaseData.modules.push(moduleData);

      // Update pricing details
      purchaseData.pricingDetails.planCost = totalPlanCost;
      purchaseData.pricingDetails.additionalUsersCost = additionalUsersCost;
      purchaseData.pricingDetails.savings = savings;
      purchaseData.pricingDetails.originalTotal = originalPrice;
    }

    // Add products data if any
    if (cartItems.length > 0) {
      const productsSubtotal = calculateProductsSubtotal();

      const productModule = {
        moduleName: 'Products',
        plans: [{
          planName: 'Product Bundle',
          price: productsSubtotal,
          durationMonths: 0, // One-time purchase
          features: cartItems.map(item => ({
            addonId: item.id,
            addonName: item.name,
            brand: item.brand,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            total: item.price * item.quantity,
            savings: item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0
          })),
          isActive: true,
          employeeLimit: 1,
          moduleAccess: {
            hr: false,
            customer: false,
            lead: false,
            pipeline: false,
            finance: false,
            documentation: false
          },
          pricing: {
            subtotal: productsSubtotal,
            totalProducts: cartItems.length,
            totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0)
          }
        }]
      };
      purchaseData.modules.push(productModule);

      // Update pricing details
      purchaseData.pricingDetails.productsCost = productsSubtotal;
    }

    // Calculate final totals
    purchaseData.pricingDetails.subtotal = calculateSubtotal();
    purchaseData.pricingDetails.tax = calculateTax();
    purchaseData.pricingDetails.total = calculateTotal();

    return purchaseData;
  };

  // Helper function to get plan features
  const getPlanFeatures = (planKey) => {
    const features = {
      lite: [
        '2 Free Users',
        '2000 Active Leads',
        'Up to 5 Campaigns',
        'Basic analytics',
        'Access add-ons',
        'Email support'
      ],
      pulse: [
        'Unlock Free Add-ons',
        'Unlimited Active Leads',
        'Unlimited Campaigns',
        'Advanced analytics',
        'Access add-ons',
        'Priority support'
      ],
      enterprise: [
        'Features included in Pulse plan',
        'Custom Domain',
        'Custom Branding',
        'Customised Add-ons',
        'Customised Mobile App',
        'Customised Reports & Dashboards',
        '24/7 priority support'
      ]
    };
    return features[planKey] || [];
  };

  // Helper function to get module access based on plan
  const getModuleAccess = (planKey) => {
    const access = {
      lite: {
        hr: true,
        customer: true,
        lead: true,
        pipeline: true,
        finance: false,
        documentation: false
      },
      pulse: {
        hr: true,
        customer: true,
        lead: true,
        pipeline: true,
        finance: true,
        documentation: true
      },
      enterprise: {
        hr: true,
        customer: true,
        lead: true,
        pipeline: true,
        finance: true,
        documentation: true
      }
    };
    return access[planKey] || {};
  };

  // Function to handle checkout
  const handleCheckout = () => {
    const purchaseData = packDataForCheckout();
    if (purchaseData) {
      // Store data in localStorage or pass as query params
      localStorage.setItem('checkoutData', JSON.stringify(purchaseData));
      router.push('/en/marketplace/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Image src={logo} alt="logo" className="h-6 w-28 sm:h-6 sm:w-28" />
          <div className="flex items-center space-x-4">
            <h6 className="text-lg sm:text-xl font-bold text-gray-900">
              Account
            </h6>
            {/* Mobile Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="lg:hidden relative p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {(cartItems.length > 0 || selectedPlan) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(cartItems.length + (selectedPlan ? 1 : 0))}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Main Content Area */}
        <div className="flex-1 pr-0 lg:pr-80">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Tab Navigation */}


            {/* Plans Tab Content */}
            {activeTab === 'plans' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                  Choose Your Plan
                </h2>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Yearly
                      {billingCycle === 'yearly' && (
                        <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Save Extra 25%
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  <PricingCard plan="lite" planData={pricingPlans[billingCycle].lite} />
                  <PricingCard plan="pulse" planData={pricingPlans[billingCycle].pulse} isPopular={true} />
                  <PricingCard plan="enterprise" planData={pricingPlans[billingCycle].enterprise} />
                </div>
              </div>
            )}

            {/* Products Tab Content */}
            {activeTab === 'products' && selectedPlan && (
              <div>
                {/* Selected Plan Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Selected Plan: {selectedPlan.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ₹{selectedPlan.price === 0 ? '0' : selectedPlan.price.toLocaleString()}/{selectedPlan.period}
                        {selectedPlan.savings && (
                          <span className="ml-2 text-green-600 font-medium">
                            {selectedPlan.savings}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Users: {getTotalUsers()} ({selectedPlan.maxUsers} base + {additionalUsers} additional)
                      </p>
                    </div>

                    <div className="p-4 border rounded-2xl shadow-sm bg-white w-fit space-y-3">
                      {/* Change Plan */}
                      <div className="flex justify-between items-center">
                        {/* <span className="font-semibold text-gray-700">Current Plan</span> */}
                        <button
                          onClick={() => {
                            setSelectedPlan(null);
                            setActiveTab("plans");
                            setAdditionalUsers(0);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Change Plan
                        </button>
                      </div>

                      {/* Additional Users */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Additional Users</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setAdditionalUsers(additionalUsers - 1)}
                            disabled={additionalUsers <= 0}
                            className="px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="min-w-[30px] text-center text-gray-800 font-semibold">
                            {additionalUsers}
                          </span>
                          <button
                            onClick={() => setAdditionalUsers(additionalUsers + 1)}
                            className="px-2 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {activeCategory === 'All' ? 'All Products' : activeCategory}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {products[activeCategory]?.length || 0} products available
                  </p>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${activeCategory === category
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 bg-gray-50'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {products[activeCategory]?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Empty State */}
                {(!products[activeCategory] || products[activeCategory].length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8v2m-4 5h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">No products found</h3>
                    <p className="text-gray-600 text-center text-sm sm:text-base">No products available in this category yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Cart Section */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200 p-6 fixed right-0 top-0 h-full overflow-y-auto">
          <div className="sticky top-0 bg-white pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Shopping Cart</h3>
            <div className="text-sm text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              {selectedPlan && ` + 1 plan`}
            </div>
          </div>

          {/* Cart Items */}
          <div className="py-4">
            <CartSummary />
          </div>
        </div>

        {/* Mobile Cart Overlay */}
        {isCartOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Shopping Cart</h3>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  {selectedPlan && ` + 1 plan`}
                </div>

                {/* Mobile Cart Items */}
                <div className="max-h-96 overflow-y-auto">
                  <CartSummary />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProductModalOpen && <ProductModal />}
    </div>
  );
};

export default Marketplace;
