"use client";

import React, { useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AdsManager = () => {
  const [activeTab, setActiveTab] = useState('list');

    const performanceData = [
    { date: 'Jun 26', impressions: 12000, clicks: 150, conversions: 8 },
    { date: 'Jun 27', impressions: 11500, clicks: 140, conversions: 7 },
    { date: 'Jun 28', impressions: 12200, clicks: 155, conversions: 9 },
    { date: 'Jun 29', impressions: 11800, clicks: 145, conversions: 8 },
    { date: 'Jun 30', impressions: 11200, clicks: 138, conversions: 7 },
    { date: 'Jul 1', impressions: 12500, clicks: 160, conversions: 10 },
    { date: 'Jul 2', impressions: 13000, clicks: 170, conversions: 11 },
    { date: 'Jul 3', impressions: 14200, clicks: 185, conversions: 12 },
    { date: 'Jul 4', impressions: 15500, clicks: 200, conversions: 14 },
    { date: 'Jul 5', impressions: 16000, clicks: 210, conversions: 15 },
    { date: 'Jul 6', impressions: 15800, clicks: 205, conversions: 13 },
    { date: 'Jul 7', impressions: 16200, clicks: 215, conversions: 16 },
    { date: 'Jul 8', impressions: 15900, clicks: 208, conversions: 14 },
    { date: 'Jul 9', impressions: 16500, clicks: 220, conversions: 17 },
    { date: 'Jul 10', impressions: 16800, clicks: 225, conversions: 18 }
  ];

  const platformData = [
    { name: 'Facebook', value: 35, color: '#1877F2' },
    { name: 'Instagram', value: 28, color: '#E4405F' },
    { name: 'Google Search', value: 22, color: '#4285F4' },
    { name: 'YouTube', value: 15, color: '#FF0000' }
  ];

  const campaignPerformanceData = [
    { name: 'Summer Collection', value: 45000 },
    { name: 'Festive Promo', value: 32000 },
    { name: 'Product Awareness', value: 18000 },
    { name: 'Brand Awareness', value: 42000 },
    { name: 'Holiday Special', value: 15000 },
    { name: 'New Product', value: 28000 }
  ];

    const campaigns = [
    {
      id: 1,
      name: 'Study MBBS in Abroad',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=100&auto=format&fit=crop',
      platforms: ['facebook', 'instagram'],
      status: 'Active',
      duration: 'Jun 15 - Jul 15, 2025',
      daysLeft: 30,
      budget: '₹12,500 / ₹12,500',
      budgetSpent: '48% spent',
      impressions: '24.8K',
      ctr: '6.1%',
      clicks: '₹4.52',
      cpc: '₹4.52',
      createdDate: 'Created on June 15, 2025'
    },
    {
      id: 2,
      name: 'Study MBBS in Abroad',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=100&auto=format&fit=crop',
      platforms: ['facebook', 'instagram'],
      status: 'Active',
      duration: 'Jun 15 - Jul 15, 2025',
      daysLeft: 30,
      budget: '₹12,500 / ₹12,500',
      budgetSpent: '48% spent',
      impressions: '24.8K',
      ctr: '5.01%',
      clicks: '₹4.52',
      cpc: '₹4.52',
      createdDate: 'Created on June 15, 2025'
    },
    {
      id: 3,
      name: 'Study MBBS in Abroad',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=100&auto=format&fit=crop',
      platforms: ['facebook', 'instagram'],
      status: 'Active',
      duration: 'Jun 15 - Jul 15, 2025',
      daysLeft: 30,
      budget: '₹12,500 / ₹12,500',
      budgetSpent: '48% spent',
      impressions: '24.8K',
      ctr: '5.01%',
      clicks: '₹4.52',
      cpc: '₹4.52',
      createdDate: 'Created on June 15, 2025'
    },
    {
      id: 4,
      name: 'Study MBBS in Abroad',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=100&auto=format&fit=crop',
      platforms: ['facebook', 'instagram'],
      status: 'Active',
      duration: 'Jun 15 - Jul 15, 2025',
      daysLeft: 30,
      budget: '₹12,500 / ₹12,500',
      budgetSpent: '48% spent',
      impressions: '24.8K',
      ctr: '5.01%',
      clicks: '₹4.52',
      cpc: '₹4.52',
      createdDate: 'Created on June 15, 2025'
    },
    {
      id: 5,
      name: 'Study MBBS in Abroad',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=100&auto=format&fit=crop',
      platforms: ['facebook', 'instagram'],
      status: 'Active',
      duration: 'Jun 15 - Jul 15, 2025',
      daysLeft: 30,
      budget: '₹12,500 / ₹12,500',
      budgetSpent: '48% spent',
      impressions: '24.8K',
      ctr: '5.01%',
      clicks: '₹4.52',
      cpc: '₹4.52',
      createdDate: 'Created on June 15, 2025'
    },
    {
      id: 6,
      name: 'Study MBBS in Abroad',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=100&auto=format&fit=crop',
      platforms: ['facebook', 'instagram'],
      status: 'Active',
      duration: 'Jun 15 - Jul 15, 2025',
      daysLeft: 30,
      budget: '₹12,500 / ₹12,500',
      budgetSpent: '48% spent',
      impressions: '24.8K',
      ctr: '5.01%',
      clicks: '₹4.52',
      cpc: '₹4.52',
      createdDate: 'Created on June 15, 2025'
    }
  ];

    const getPlatformIcon = (platform) => {
    const icons = {
      facebook: (
        <i class="ri-facebook-fill text-blue-500"></i>
      ),
      instagram: (
        <i className="ri-instagram-line bg-gradient-to-br from-purple-600 to-pink-600"></i>
      )
    };
    return icons[platform] || null;
  };
  
  const campaignData = [
    {
      id: 1,
      name: "Study MBBS in Abroad",
      platforms: ["instagram", "facebook"],
      status: "Active",
      duration: "Jun 15 - Jul 15, 2025",
      days: "30 days",
      budget: "₹12,500 / ₹12,500",
      budgetSpent: "36% spent",
      impressions: "24.8K",
      clicks: "₹4.52",
      ctr: "5.01%",
      cpc: "₹4.52",
      createdDate: "Created on June 15, 2025"
    },
    {
      id: 2,
      name: "Study MBBS in Abroad",
      platforms: ["instagram", "facebook"],
      status: "Active",
      duration: "Jun 15 - Jul 15, 2025",
      days: "30 days",
      budget: "₹12,500 / ₹12,500",
      budgetSpent: "36% spent",
      impressions: "24.8K",
      clicks: "₹4.52",
      ctr: "5.01%",
      cpc: "₹4.52",
      createdDate: "Created on June 15, 2025"
    },
    {
      id: 3,
      name: "Study MBBS in Abroad",
      platforms: ["instagram", "facebook"],
      status: "Active",
      duration: "Jun 15 - Jul 15, 2025",
      days: "30 days",
      budget: "₹12,500 / ₹12,500",
      budgetSpent: "36% spent",
      impressions: "24.8K",
      clicks: "₹4.52",
      ctr: "5.01%",
      cpc: "₹4.52",
      createdDate: "Created on June 15, 2025"
    },
    {
      id: 4,
      name: "Study MBBS in Abroad",
      platforms: ["instagram", "facebook"],
      status: "Active",
      duration: "Jun 15 - Jul 15, 2025",
      days: "30 days",
      budget: "₹12,500 / ₹12,500",
      budgetSpent: "36% spent",
      impressions: "24.8K",
      clicks: "₹4.52",
      ctr: "5.01%",
      cpc: "₹4.52",
      createdDate: "Created on June 15, 2025"
    },
    {
      id: 5,
      name: "Study MBBS in Abroad",
      platforms: ["instagram", "facebook"],
      status: "Active",
      duration: "Jun 15 - Jul 15, 2025",
      days: "30 days",
      budget: "₹12,500 / ₹12,500",
      budgetSpent: "36% spent",
      impressions: "24.8K",
      clicks: "₹4.52",
      ctr: "5.01%",
      cpc: "₹4.52",
      createdDate: "Created on June 15, 2025"
    },
    {
      id: 6,
      name: "Study MBBS in Abroad",
      platforms: ["instagram", "facebook"],
      status: "Active",
      duration: "Jun 15 - Jul 15, 2025",
      days: "30 days",
      budget: "₹12,500 / ₹12,500",
      budgetSpent: "36% spent",
      impressions: "24.8K",
      clicks: "₹4.52",
      ctr: "5.01%",
      cpc: "₹4.52",
      createdDate: "Created on June 15, 2025"
    }
  ];

  const PlatformIcon = ({ platform }) => {
    const iconClass = "w-4 h-4 rounded";
    
    if (platform === "instagram") {
      return (
        <div className={`${iconClass} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">📷</span>
        </div>
      );
    }
    
    if (platform === "facebook") {
      return (
        <div className={`${iconClass} bg-blue-600 flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">f</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Ads Manager</h1>
            <p className="text-gray-600 mt-1">Create, monitor, and optimize your Meta and Google Ads effortlessly.</p>
          </div>
          <Button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <i class="ri-refresh-line"></i>
            <span className="text-sm">Refresh Status</span>
          </Button>
        </div>

        {/* Campaign Creation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Meta Ad Campaign */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              < IconButton>
              <i className="ri-information-line"></i>
              </IconButton>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Meta Ad Campaign</h3>
              <p className="text-sm text-gray-600">Run ads across Instagram, Facebook, WhatsApp & X</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm text-gray-700">Instagram</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm text-gray-700">Facebook</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span className="text-sm text-gray-700">WhatsApp</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
                <span className="text-sm text-gray-700">X</span>
              </div>
            </div>
            
            <Button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <i className="ri-add-line"></i>
              <span>Create Meta Ad</span>
            </Button>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Reach audiences across Meta platforms with a single campaign
            </p>
          </div>

          {/* Google Ad Campaign */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              < IconButton>
              <i className="ri-information-line"></i>
              </IconButton>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Google Ad Campaign</h3>
              <p className="text-sm text-gray-600">Run ads on Google Search, YouTube & Display Network</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span className="text-sm text-gray-700">Search</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-sm text-gray-700">YouTube</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
                <span className="text-sm text-gray-700">Display</span>
              </div>
            </div>
            
            <Button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <i className="ri-add-line"></i>
              <span>Create Google Ad</span>
            </Button>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Promote across Google's powerful ad network
            </p>
          </div>
        </div>

        {/* Campaign List */}
        <div className="rounded-xl">
          {/* List Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">≡</span>
                  </div>
                  <span className="font-medium text-gray-900">List</span>
                </div>
                <span className="text-sm text-gray-600">Showing 15 of 24 campaigns</span>
              </div>
              <div className="flex items-center gap-3">
                <Button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <i class="ri-download-line"></i>
                  <span className="text-sm">Export</span>
                </Button>
                <Button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                  <i class="ri-refresh-line"></i>
                  <span className="text-sm">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platforms
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={campaign.image} 
                          alt={campaign.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-xs text-gray-500">{campaign.createdDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {campaign.platforms.map((platform, index) => (
                          <div key={index}>
                            {getPlatformIcon(platform)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{campaign.duration}</div>
                      <div className="text-xs text-gray-500">{campaign.daysLeft} days</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{campaign.budget}</div>
                      <div className="text-xs text-orange-600">{campaign.budgetSpent}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-blue-600 font-medium">Impressions</div>
                          <div className="text-gray-900">{campaign.impressions}</div>
                        </div>
                        <div>
                          <div className="text-blue-600 font-medium">CTR</div>
                          <div className="text-green-500">{campaign.ctr}</div>
                        </div>
                        <div>
                          <div className="text-blue-600 font-medium">Clicks</div>
                          <div className="text-gray-900">{campaign.clicks}</div>
                        </div>
                        <div>
                          <div className="text-blue-600 font-medium">CPC</div>
                          <div className="text-gray-900">{campaign.cpc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <IconButton className="text-blue-600 hover:text-blue-800">
                          <i class="ri-pencil-line"></i>
                        </IconButton>
                        <IconButton className="text-red-600 hover:text-red-800">
                          <i class="ri-delete-bin-4-line"></i>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl mt-8 border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Performance Summary</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Last 30 days</span>
                <IconButton className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </IconButton>
                <IconButton className="text-gray-400 hover:text-gray-600 ml-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </IconButton>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Impressions</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">172.8K</span>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">+17.5%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clicks</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">8,542</span>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">+8.1%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CTR</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">4.94%</span>
                    <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">-3.7%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spend</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">₹88,000</span>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">+12.8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
                    name="Impressions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
                    name="Clicks"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 0, r: 3 }}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Impressions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Clicks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Conversions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Platform Distribution */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Platform Distribution</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 ml-8">
                  {platformData.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: platform.color }}
                        ></div>
                        <span className="text-sm text-gray-700">{platform.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{platform.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformanceData} layout="horizontal">
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      width={120}
                    />
                    <Bar dataKey="value" fill="#60A5FA" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsManager;