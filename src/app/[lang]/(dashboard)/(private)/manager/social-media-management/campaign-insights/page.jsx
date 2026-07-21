'use client';

import React, { useState } from 'react';
import { Button } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const performanceTrendData = [
  { date: 'May 25', impressions: 125000, engagement: 4000, clicks: 2000, conversions: 800 },
  { date: 'May 30', impressions: 130000, engagement: 4500, clicks: 2100, conversions: 900 },
  { date: 'Jun 4',  impressions: 100000, engagement: 3800, clicks: 1800, conversions: 700 },
  { date: 'Jun 9',  impressions: 150000, engagement: 5000, clicks: 2400, conversions: 1100 },
  { date: 'Jun 14', impressions: 180000, engagement: 5500, clicks: 2600, conversions: 1300 },
  { date: 'Jun 19', impressions: 230000, engagement: 6000, clicks: 3000, conversions: 1500 },
  { date: 'Jun 24', impressions: 210000, engagement: 5800, clicks: 2900, conversions: 1400 },
];

const platformData = [
  { name: 'Instagram', value: 42, color: '#E91E63' },
  { name: 'Facebook',  value: 35, color: '#1877F2' },
  { name: 'X',         value: 18, color: '#000000' },
  { name: 'WhatsApp',  value:  5, color: '#25D366' },
];

const ageData = [
  { age: '18–24', value: 18 },
  { age: '25–34', value: 42 },
  { age: '35–44', value: 25 },
  { age: '45–54', value: 10 },
  { age: '55+',   value:  5 },
];

const genderData = [
  { name: 'Male',   value: 38, color: '#FF9800' },
  { name: 'Female', value: 62, color: '#4DB6AC' },
];

const deviceData = [
  { name: 'Mobile',  value: 68, color: '#2196F3' },
  { name: 'Desktop', value: 22, color: '#FF9800' },
  { name: 'Tablet',  value: 10, color: '#4CAF50' },
];

const peakHoursData = [
  { hour: '6AM', value: 5 },
  { hour: '12PM', value: 15 },
  { hour: '6PM', value: 25 },
  { hour: '12AM', value: 10 },
];

const regionData = [
  { name: 'Maharashtra', value: 24, color: '#2196F3' },
  { name: 'Delhi NCR', value: 18, color: '#2196F3' },
  { name: 'Karnataka', value: 15, color: '#2196F3' },
];

const timeData = [
  { hour: '6 AM',  value:  5 },
  { hour: '12 PM', value: 15 },
  { hour: '6 PM',  value: 25 },
  { hour: '12 AM', value: 10 },
];

const getPlatformIcon = (platform) => {
  const icons = {
    instagram: <i className="ri-instagram-line" />,
    facebook:  <i className="ri-facebook-fill" />,
    twitter:   <i className="ri-twitter-x-line" />,
    whatsapp:  <i className="ri-whatsapp-line" />,
  };
  return icons[platform] || '📱';
};

const ImageWithTitleFallback = ({ src, title }) => {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg text-gray-700 font-semibold text-sm">
        {title}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={title}
      className="w-full h-32 object-cover rounded-lg"
      onError={() => setErrored(true)}
    />
  );
};

const CampaignInsights = () => {
  const [selectedTab, setSelectedTab]   = useState('Overview');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [dateRange, setDateRange]       = useState('Last 7 days');
  const [sortBy, setSortBy]             = useState('Date (Newest)');
  const [searchTerm, setSearchTerm]     = useState('');

  const performanceData = [
    { metric: 'Impressions', value: '2.4M', change: '+12%', trend: 'up' },
    { metric: 'Reach',       value: '5.7%', change: '+0.3%', trend: 'up' },
    { metric: 'CTR',         value: '4.2%', change: '-0.5%', trend: 'down' },
    { metric: 'CVR',         value: '2.8%', change: '+0.8%', trend: 'up' },
  ];

const campaignComparison = [
  { 
    name: 'MBBS in Georgia', 
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=847',
    impressions: '542.8K', 
    engagementRate: '6.2%', 
    engagementChange: '+0.8%',
    ctr: '5.1%', 
    ctrChange: '+0.3%',
    cvr: '3.4%', 
    cvrChange: '+0.5%',
    cpc: '₹4.52',
    roi: '285%',
    roiChange: '+15%'
  },
  { 
    name: 'MBBS Admission', 
    image: 'https://images.unsplash.com/photo-1744829903372-6e6f254780bb?q=80&w=687',
    impressions: '328.5K', 
    engagementRate: '5.8%', 
    engagementChange: '+0.4%',
    ctr: '5.7%', 
    ctrChange: '+0.9%',
    cvr: '2.9%', 
    cvrChange: '-0.2%',
    cpc: '₹5.20',
    roi: '210%',
    roiChange: '-6%'
  },
  { 
    name: 'MBBS Abroad', 
    image: 'https://plus.unsplash.com/premium_photo-1681967053996-4275be0191e7?q=80&w=1193',
    impressions: '412.7K', 
    engagementRate: '5.4%', 
    engagementChange: '+0.2%',
    ctr: '5.1%', 
    ctrChange: '+0.1%',
    cvr: '3.2%', 
    cvrChange: '+0.3%',
    cpc: '₹6.85',
    roi: '195%',
    roiChange: '+8%'
  },
  { 
    name: 'MBBS in Georgia', 
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=847',
    impressions: '542.8K', 
    engagementRate: '6.2%', 
    engagementChange: '+0.8%',
    ctr: '5.1%', 
    ctrChange: '+0.3%',
    cvr: '3.4%', 
    cvrChange: '+0.5%',
    cpc: '₹4.52',
    roi: '285%',
    roiChange: '+15%'
  },
  { 
    name: 'MBBS Admission', 
    image: 'https://images.unsplash.com/photo-1744829903372-6e6f254780bb?q=80&w=687',
    impressions: '328.5K', 
    engagementRate: '5.8%', 
    engagementChange: '+0.4%',
    ctr: '5.7%', 
    ctrChange: '+0.9%',
    cvr: '2.9%', 
    cvrChange: '-0.2%',
    cpc: '₹5.20',
    roi: '210%',
    roiChange: '-6%'
  },
];

  const campaigns = [
    {
      id: 1, 
      title: 'MBBS in Georgia', 
      status: 'Active',
      platforms: ['instagram'],
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=847',
      metrics: { 
        impressions: '45.2K', 
        views: '3.8K',
        likes: '492',
        comments: '298',
        engagementRate: '8.4%'
      }
    },
    {
      id: 2, 
      title: 'MBBS Admission', 
      status: 'Active',
      platforms: ['facebook'],
      image: 'https://images.unsplash.com/photo-1744829903372-6e6f254780bb?q=80&w=687',
      metrics: { 
        impressions: '38.7K', 
        views: '2.9K',
        likes: '356',
        comments: '187',
        engagementRate: '7.5%'
      }
    },
    {
      id: 3, 
      title: 'B.Sc Nursing', 
      status: 'Pending',
      platforms: ['facebook'],
      image: 'https://plus.unsplash.com/premium_photo-1681967053996-4275be0191e7?q=80&w=1193',
      metrics: { 
        impressions: '32.1K', 
        views: '2.4K',
        likes: '298',
        comments: '145',
        engagementRate: '7.4%'
      }
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header + Stats Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Campaign Insights</h1>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="contained" color="primary">Create Insights</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceData.map((d) => (
              <div key={d.metric} className="bg-white rounded-xl p-6 border">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">{d.metric}</span>
                  <i className={`ri-arrow-${d.trend}-line text-${d.trend === 'up' ? 'green' : 'red'}-600`} />
                </div>
                <div className="text-2xl font-bold">{d.value}</div>
                <div className={`text-sm ${d.trend==='up'? 'text-green-600':'text-red-600'}`}>{d.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex flex-wrap gap-4">
            {[
              ['Status', statusFilter, setStatusFilter, ['All Status','Active','Paused','Ended']],
              ['Platform', platformFilter, setPlatformFilter, ['All Platforms','Facebook','Instagram','Twitter']],
              ['Date Range', dateRange, setDateRange, ['Last 7 days','Last 30 days','Last 90 days']],
              ['Sort By', sortBy, setSortBy, ['Date (Newest)','Date (Oldest)','Budget (High to Low)','Budget (Low to High)']],
            ].map(([label, value, setter, opts]) => (
              <div key={label} className="flex items-center gap-2">
                <label className="text-sm font-medium">{label}</label>
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Search</label>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Performance Trends</h2>
            <Legend
              payload={[
                { value: 'Impressions', color: '#5AC8FA' },
                { value: 'Engagement',  color: '#4CD964' },
                { value: 'Clicks',      color: '#FFCC00' },
                { value: 'Conversions', color: '#FF3B30' },
              ]}
              wrapperStyle={{ display: 'flex', gap: 16 }}
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={performanceTrendData} margin={{ left: -20, right: 0 }}>
              <XAxis dataKey="date" tick={{ fill: '#6B7280' }} />
              <YAxis tickFormatter={v => `${v/1000}k`} tick={{ fill: '#6B7280' }} />
              <ReTooltip formatter={v => new Intl.NumberFormat().format(v)} />
              <Area type="monotone" dataKey="impressions" stroke="#5AC8FA" fill="#E5F6FF" strokeWidth={2} />
              <Area type="monotone" dataKey="engagement"  stroke="#4CD964" fill="rgba(76,217,100,0.2)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicks"      stroke="#FFCC00" fill="rgba(255,204,0,0.2)" strokeWidth={2} />
              <Area type="monotone" dataKey="conversions" stroke="#FF3B30" fill="rgba(255,59,48,0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Platform Performance */}
  <div className="bg-white rounded-xl border p-6">
    <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>
    <div className="flex justify-center mb-4">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={platformData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {platformData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 gap-3 text-sm">
    {platformData.map(p => (
      <div key={p.name} className="flex flex-col border p-3 rounded-xl space-y-2">
        <div className="flex items-center space-x-2">
          {/* Platform Icons */}
          {p.name === 'Instagram' && (
            <i className="ri-instagram-line text-pink-500 text-lg"></i>
          )}
          {p.name === 'Facebook' && (
            <i className="ri-facebook-fill text-blue-600 text-lg"></i>
          )}
          {p.name === 'X' && (
            <i className="ri-twitter-x-line text-black text-lg"></i>
          )}
          {p.name === 'WhatsApp' && (
            <i className="ri-whatsapp-line text-green-500 text-lg"></i>
          )}
          <span className="font-medium">{p.name}</span>
        </div>
        <p className="text-gray-600">{p.value}% of total engagement</p>
      </div>
    ))}
  </div>
  </div>

  {/* Audience Demographics */}
  <div className="bg-white rounded-xl border p-6">
    <h2 className="text-lg font-semibold mb-4">Audience Demographics</h2>
    
    <div className="grid grid-cols-2 gap-6">
      {/* Age Distribution */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Age Distribution</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={ageData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="age" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Bar dataKey="value" fill="#42A5F5" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gender Distribution */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Gender Distribution</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                innerRadius={35}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Geographic Distribution */}
  <div className="bg-white rounded-xl border p-6">
    <h2 className="text-lg font-semibold mb-4">Geographic Distribution</h2>
    <div className="mb-4">
      <iframe
        title="India Map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.9865795618434!2d76.94320447485228!3d8.500683091541081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xabdef907d58a4cd3%3A0xf4fb31e38785628b!2sCanbridge%20Global%20Study%20Abroad!5e0!3m2!1sen!2sin!4v1752752414081!5m2!1sen!2sin"
        width="100%"
        height="200"
        style={{ border: 0, borderRadius: '8px' }}
        allowFullScreen=""
        loading="lazy"
      />
    </div>
    
    {/* Region Stats */}
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">Top Region</span>
          <div className="text-lg font-semibold">Maharashtra (24%)</div>
        </div>
        <div>
          <span className="text-sm font-medium">Top City</span>
          <div className="text-lg font-semibold">Mumbai (18%)</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {regionData.map((region, index) => (
          <div key={region.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">{region.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-blue-500 rounded-full" 
                  style={{ width: `${(region.value / 24) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{region.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Device & Time Analysis */}
  <div className="bg-white rounded-xl border p-6">
    <h2 className="text-lg font-semibold mb-4">Device & Time Analysis</h2>
    
    <div className="grid grid-cols-2 gap-6">
      {/* Device Usage */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Device Usage</h3>
        <div className="flex justify-center mb-3">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={deviceData}
                dataKey="value"
                nameKey="name"
                innerRadius={35}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak Engagement Hours */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Peak Engagement Hours</h3>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={peakHoursData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="hour" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 30]} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#FF6B35" 
              fill="rgba(255, 107, 53, 0.2)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
</div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Campaign Performance Comparison</h2>
            <div className="flex space-x-2">
              {['Engagement', 'Conversion', 'ROI'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm rounded-lg font-medium ${tab === 'Engagement' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Campaign</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Impressions</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Engagement Rate</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">CTR</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Conversion Rate</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">CPC</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">ROI</th>
                </tr>
              </thead>
              <tbody>
                {campaignComparison.map((campaign, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={campaign.image} 
                            alt={campaign.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">{campaign.impressions}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{campaign.engagementRate}</span>
                        <span className={`text-xs ${campaign.engagementChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {campaign.engagementChange}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{campaign.ctr}</span>
                        <span className={`text-xs ${campaign.ctrChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {campaign.ctrChange}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{campaign.cvr}</span>
                        <span className={`text-xs ${campaign.cvrChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {campaign.cvrChange}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">{campaign.cpc}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{campaign.roi}</span>
                        <span className={`text-xs ${campaign.roiChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {campaign.roiChange}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Top Performing Content</h2>
            <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">View All</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow">
                {/* Platform Icon */}
                <div className="flex justify-start p-3">
                  <div className="flex space-x-1">
                    {c.platforms.map((p, i) => (
                      <div key={i} className={`px-2 py-1 rounded text-xs text-white ${p === 'instagram' ? 'bg-pink-500' : 'bg-blue-600'}`}>
                        {p === 'instagram' ? 'Instagram' : 'Facebook'}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Image */}
                <div className="px-3 pb-3">
                  <ImageWithTitleFallback src={c.image} title={c.title} />
                </div>
                
                {/* Content */}
                <div className="px-3 pb-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{c.title}</h3>
                  
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <i className="ri-eye-line text-gray-500 text-sm"></i>
                    <span className="text-sm font-medium">{c.metrics.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-heart-line text-gray-500 text-sm"></i>
                    <span className="text-sm font-medium">{c.metrics.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-chat-3-line text-gray-500 text-sm"></i>
                    <span className="text-sm font-medium">{c.metrics.comments}</span>
                  </div>
                </div>
                  
                  {/* Engagement Rate Bar */}
                  <div className="flex items-center space-x-2">
                    <i className="ri-arrow-up-line text-green-500 text-sm"></i>
                    <span className="text-sm font-medium text-green-600">{c.metrics.engagementRate} engagement rate</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Recommendations & Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Optimal Posting Times */}
            <div className="bg-white rounded-2xl border p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-time-line text-blue-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Optimal Posting Times</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your audience is most active between 6-8 PM on weekdays. Consider scheduling posts during these peak hours to maximize engagement.
              </p>
              <Button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <span>View detailed analysis</span>
                <i className="ri-arrow-right-line"></i>
              </Button>
            </div>

            {/* Content Strategy */}
            <div className="bg-white rounded-2xl border p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-file-text-line text-purple-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Content Strategy</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Video content is outperforming images by 32% in engagement rate. Consider increasing video content in your upcoming campaigns.
              </p>
              <Button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <span>View content performance</span>
                <i className="ri-arrow-right-line"></i>
              </Button>
            </div>

            {/* Audience Targeting */}
            <div className="bg-white rounded-2xl border p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-group-line text-green-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Audience Targeting</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your campaigns are performing 45% better with the 25-34 age group. Consider refining your targeting parameters for better ROI.
              </p>
              <Button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <span>View audience insights</span>
                <i className="ri-arrow-right-line"></i>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CampaignInsights;
