"use client";

import { Button, IconButton } from '@mui/material';
import React, { useState } from 'react';

const CampaignManager = () => {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [sortBy, setSortBy] = useState('Date (Newest)');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Manager</h1>
          <p className="text-gray-600">Manage all your social media advertising campaigns in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="ri-megaphone-line text-blue-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-green-600">+4 from last month</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i class="ri-money-rupee-circle-line text-green-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">₹142,500</div>
            <div className="text-sm text-green-600">+16.2%</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Impressions</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="ri-eye-line text-blue-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">1.2M</div>
            <div className="text-sm text-green-600">+8.4%</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="ri-arrow-turn-back-line text-purple-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">3.8%</div>
            <div className="text-sm text-red-600">-0.5%</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Paused</option>
                  <option>Ended</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Platform</label>
                <select 
                  value={platformFilter} 
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Platforms</option>
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>Twitter</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Date (Newest)</option>
                  <option>Date (Oldest)</option>
                  <option>Budget (High to Low)</option>
                  <option>Budget (Low to High)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <input 
                  type="text" 
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">24</span>
                </div>
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">≡</span>
                </div>
              </div>
              <span className="text-sm text-gray-600">Showing 15 of 24 campaigns</span>
            </div>
            <div className="flex items-center gap-2">
              <Button className="text-sm text-blue-600 hover:text-blue-800">+ Export</Button>
              <Button className="text-sm text-gray-600 hover:text-gray-800">⟲ Refresh</Button>
            </div>
          </div>
        </div>

        {/* Table */}
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

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1-7 of 24 campaigns
          </div>
          <div className="flex items-center space-x-2">
            <Button
            variant="outlined"
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              Previous
            </Button>
            <Button
             variant="outlined"
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </Button>
            <Button
             variant="outlined"
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              2
            </Button>
            <Button
             variant="outlined"
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              3
            </Button>
            <Button
             variant="outlined"
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              4
            </Button>
            <Button
             variant="outlined"
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;