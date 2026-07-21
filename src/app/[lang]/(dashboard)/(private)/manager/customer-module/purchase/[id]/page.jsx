"use client";

import { Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'; 

const ProductDetailsPage = () => {
  const { id } = useParams(); 
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState('overview');
  
  // API state
  const [customerData, setCustomerData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customer and sales data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/customer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setCustomerData(response.data.customer);
          setSalesData(response.data.sales || []);
        } else {
          setError('Failed to fetch customer data');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching data');
        console.error('Error fetching customer data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  // Transform API data to match your component structure (safe with new backend `items`)
  const transformProductData = (sale) => {
    // Use items from backend (each item: { product, itemName, quantity, unitPrice, description, total })
    const item = sale?.items?.[0] ?? null;

    const itemName = item?.itemName || item?.name || 'Product';
    const unitPrice = Number(item?.unitPrice ?? item?.price ?? 0);
    const quantity = Number(item?.quantity ?? 1);

    // Compute totalAmount: prefer sale.totalAmount if backend provides, else sum items totals
    const computedTotalAmount = (() => {
      if (typeof sale?.totalAmount === 'number') return sale.totalAmount;
      if (Array.isArray(sale?.items) && sale.items.length > 0) {
        return sale.items.reduce((t, it) => t + (Number(it.total) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      }
      return quantity * unitPrice;
    })();

    return {
      name: itemName,
      slug: (itemName || 'product').toLowerCase().replace(/\s+/g, '-'),
      description: item?.description || item?.desc || sale?.notes || '',
      currency: sale?.currency === 'USD' ? '$' : (sale?.currency || ''),
      sku: sale?.salesId || sale?._id,
      price: unitPrice,
      totalAmount: computedTotalAmount,
      leadInfo: sale?.leadId ?? null,
      saleInfo: {
        status: sale?.status ?? 'pending',
        accepted: sale?.accepted ?? false,
        notes: sale?.notes ?? '',
        createdAt: sale?.createdAt ?? sale?.createdAt,
        createdBy: sale?.createdBy ?? {}
      },
      invoiceId: sale?.invoices && sale.invoices.length > 0 ? (sale.invoices[0]._id ?? sale.invoices[0]) : null,
      inStock: sale?.status === 'active' || sale?.status === 'in-progress'
    };
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle invoice navigation
  const handleViewInvoice = () => {
    const currentSale = salesData?.[0];
    if (!currentSale) {
      alert('No sale available');
      return;
    }

    const invoiceId = currentSale?.invoices?.[0]?._id ?? currentSale?.invoices?.[0] ?? null;

    if (invoiceId) {
      // navigate to invoice preview — keep same locale if needed
      router.push(`/en/manager/saleRequest/preview?id=${invoiceId}`);
    } else {
      // Handle case where no invoice exists
      alert('No invoice available for this sale');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No sales data
  if (!salesData || salesData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No purchase data found for this customer.</p>
        </div>
      </div>
    );
  }

  // Get the first sale for display (you might want to modify this logic)
  const currentSale = salesData[0];
  const product = transformProductData(currentSale);

  return (
    <div className="min-h-screen">
      {/* Customer Info Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl mb-4 font-semibold text-gray-900">Customer Information</h2>
              <p className="text-gray-900">
                • {customerData?.email ?? '—'} • {customerData?.phone ?? '—'}
              </p>
            </div>
            <div className="mt-2 sm:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.saleInfo.status)}`}>
                {String(product.saleInfo.status || '').replace('-', ' ').toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row">
        {/* Product Placeholder */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
          <div className="lg:sticky lg:top-8">
            {/* Product Icon Placeholder */}
            <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
              <div className="text-center">
                <i className="ri-product-hunt-line text-6xl text-gray-400 mb-4"></i>
                <p className="text-gray-500 text-lg font-medium">{product.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
          <div className="max-w-lg mx-auto lg:mx-0">
            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* SKU */}
            <p className="text-sm text-gray-600 mb-2">Sale ID: {product.sku}</p>

            {/* Purchase Date */}
            <p className="text-sm text-gray-600 mb-4">
              Purchased on: {formatDate(product.saleInfo.createdAt)}
            </p>

            {/* Price Display */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">
                {product.currency} {product.price}
                <span className="text-base font-normal text-gray-600"> per session</span>
              </div>
              <div className="text-lg font-semibold text-blue-600 mt-2">
                Total Amount: {product.currency} {product.totalAmount}
              </div>
            </div>

            {/* Sale Notes */}
            {product.saleInfo.notes && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Special Notes:</h4>
                <p className="text-sm text-yellow-700">{product.saleInfo.notes}</p>
              </div>
            )}

            {/* Created By */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Sale Representative:</h4>
              <p className="text-sm text-gray-600">
                {(product.saleInfo.createdBy?.name) ? `${product.saleInfo.createdBy.name} (${product.saleInfo.createdBy.email ?? '—'})` : '—'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-8">
              <Button 
                onClick={handleViewInvoice}
                disabled={!product.invoiceId}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {product.invoiceId ? 'View Invoice' : 'No Invoice Available'}
              </Button>
              <Button
                sx={{
                  border: '1px solid #ccc',
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Button>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2 mb-6">
              <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {product.inStock ? 'Service Active' : 'Service Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section - Only show if description exists */}
      {product.description && (
        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="border border-gray-200 rounded-2xl">
              <div
                onClick={() => toggleSection('overview')}
                className="w-full flex cursor-pointer items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-xl text-gray-900">Overview</span>
                {expandedSection === 'overview'
                  ? <i className="ri-arrow-up-line text-xl" />
                  : <i className="ri-arrow-down-line text-xl" />
                }
              </div>
              <div
                className={`px-6 pb-6 overflow-hidden transition-all duration-300 ${
                  expandedSection === 'overview' ? 'max-h-none' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600 mb-6">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
