"use client"

import { Button } from '@mui/material';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Running Campaigns');

  // Sample data for charts
  const impressionsData = [
    { name: 'Mon', impressions: 8000, reach: 7000 },
    { name: 'Tue', impressions: 9500, reach: 8200 },
    { name: 'Wed', impressions: 11000, reach: 9800 },
    { name: 'Thu', impressions: 10500, reach: 9200 },
    { name: 'Fri', impressions: 12000, reach: 10500 },
    { name: 'Sat', impressions: 13500, reach: 11800 },
    { name: 'Sun', impressions: 14000, reach: 12200 }
  ];

  const engagementData = [
    { name: 'Facebook', value: 4000, fill: '#3b82f6' },
    { name: 'Instagram', value: 3500, fill: '#10b981' },
    { name: 'Twitter', value: 2500, fill: '#f59e0b' },
    { name: 'LinkedIn', value: 3000, fill: '#ef4444' }
  ];

  const demographicsData = [
    { name: '18-24', value: 25, fill: '#3b82f6' },
    { name: '25-34', value: 35, fill: '#10b981' },
    { name: '35-44', value: 20, fill: '#f59e0b' },
    { name: '45-54', value: 15, fill: '#ef4444' },
    { name: '55+', value: 5, fill: '#8b5cf6' }
  ];

  const campaigns = [
    {
      id: 1,
      title: 'MBBS Admission',
      subtitle: 'The Cambridge Global MBBS Admission - 2025 Now Open!',
      status: 'Active',
      platforms: ['instagram', 'facebook'],
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=847&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      metrics: {
        impressions: '24.8K',
        reach: '18.3K',
        clicks: '1245',
        budget: '₹12,500'
      }
    },
    {
      id: 2,
      title: 'MBBS Georgia',
      subtitle: 'Study in the best PCMC',
      status: 'Active',
      platforms: ['instagram'],
      image: 'https://images.unsplash.com/photo-1744829903372-6e6f254780bb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      metrics: {
        impressions: '15.2K',
        reach: '12.7K',
        clicks: '876',
        budget: '₹8,750'
      }
    },
    {
      id: 3,
      title: 'B.Sc Nursing',
      subtitle: 'Join the future of Health Care',
      status: 'Pending',
      platforms: ['facebook', 'twitter'],
      image: 'https://plus.unsplash.com/premium_photo-1681967053996-4275be0191e7?q=80&w=1193&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      metrics: {
        impressions: '9.6K',
        reach: '7.8K',
        clicks: '542',
        budget: '₹6,200'
      }
    },
    {
      id: 4,
      title: 'Choose Destination',
      subtitle: 'STUDY MBBS IN ABROAD',
      status: 'Active',
      platforms: ['instagram', 'whatsapp'],
      image: 'https://plus.unsplash.com/premium_photo-1658506671316-0b293df7c72b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      metrics: {
        impressions: '18.9K',
        reach: '14.2K',
        clicks: '967',
        budget: '₹9,800'
      }
    }
  ];

  const scheduledPosts = [
    { time: '9:00 AM', type: 'Product Post', platform: 'Instagram', color: 'bg-pink-500' },
    { time: '12:00 PM', type: 'Tweet', platform: 'Twitter', color: 'bg-blue-400' },
    { time: '3:00 PM', type: 'Broadcast', platform: 'Facebook', color: 'bg-green-500' },
    { time: '6:00 PM', type: 'Carousel', platform: 'Instagram', color: 'bg-pink-500' },
    { time: '9:00 PM', type: 'Live', platform: 'Facebook', color: 'bg-blue-500' }
  ];

  const topPosts = [
    {
      id: 1,
      title: '#1 Trending Instagram Post',
      content: 'Amazing visual content that went viral',
      likes: '2.4K',
      comments: '387',
      shares: '156',
      platform: 'Instagram',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      title: '#2 Trending Instagram Post',
      content: 'Explore our latest products',
      likes: '2.4K',
      comments: '387',
      shares: '156',
      platform: 'Instagram',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop'
    }
  ];

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
  // Start with current Monday
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday;
  });

  // Add these helper functions
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getWeekDays = (startDate) => {
    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        name: dayNames[i],
        date: date.getDate(),
        fullDate: new Date(date)
      });
    }
    return days;
  };

  const navigateWeek = (direction) => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const getScheduledPostsForWeek = (weekStart) => {
  // Sample data - in real app, this would come from your API
  const samplePosts = [
    {
      time: '9:00 AM',
      dayIndex: 0, // Monday
      type: 'Product Post',
      platform: 'instagram',
      title: 'Summer Collection H',
      color: 'pink'
    },
    {
      time: '9:00 AM',
      dayIndex: 4, // Friday
      type: 'Promo Post',
      platform: 'facebook',
      title: 'Weekend Sale Annou',
      color: 'blue'
    },
    {
      time: '9:00 AM',
      dayIndex: 5, // Saturday
      type: 'Story',
      platform: 'instagram',
      title: 'Behind the Scenes',
      color: 'pink'
    },
    {
      time: '12:00 PM',
      dayIndex: 1, // Tuesday
      type: 'Tweet',
      platform: 'twitter',
      title: 'Industry News Updat',
      color: 'gray'
    },
    {
      time: '3:00 PM',
      dayIndex: 2, // Wednesday
      type: 'Broadcast',
      platform: 'whatsapp',
      title: 'Flash Sale Alert',
      color: 'green'
    },
    {
      time: '3:00 PM',
      dayIndex: 6, // Sunday
      type: 'Video Post',
      platform: 'facebook',
      title: 'Product Tutorial',
      color: 'blue'
    },
    {
      time: '6:00 PM',
      dayIndex: 3, // Thursday
      type: 'Carousel',
      platform: 'instagram',
      title: 'Customer Reviews',
      color: 'pink'
    },
    {
      time: '6:00 PM',
      dayIndex: 4, // Friday
      type: 'Reel',
      platform: 'instagram',
      title: 'Product Showcase',
      color: 'pink'
    },
    {
      time: '9:00 PM',
      dayIndex: 0, // Monday
      type: 'Live',
      platform: 'facebook',
      title: 'Q&A Session',
      color: 'blue'
    },
    {
      time: '9:00 PM',
      dayIndex: 6, // Sunday
      type: 'Poll',
      platform: 'twitter',
      title: 'Customer Prefere',
      color: 'gray'
    }
  ];

  return samplePosts;
};

  const getPostsForTimeAndDay = (time, dayIndex, weekStart) => {
    const scheduledPosts = getScheduledPostsForWeek(weekStart);
    return scheduledPosts.filter(post => post.time === time && post.dayIndex === dayIndex);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: <i class="ri-instagram-line"></i>,
      facebook: <i class="ri-facebook-fill"></i>,
      twitter: <i class="ri-twitter-x-line"></i>,
      whatsapp: <i class="ri-whatsapp-line"></i>
    };
    return icons[platform] || '📱';
  };

  const getColorClasses = (color) => {
    const colorMap = {
      pink: { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-700', icon: 'text-pink-500' },
      blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-500' },
      green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', icon: 'text-green-500' },
      gray: { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-700', icon: 'text-gray-700' }
    };
    return colorMap[color] || colorMap.gray;
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-500">Welcome, Michael Johnson</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                <i class="ri-add-line"></i>
                 Create New Ad Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Running Campaigns Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Running Campaigns</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">View All</span>
              <div className="text-gray-400"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Status and Platform Icons */}
                <div className="flex justify-between items-start p-3">
                  <div className="flex space-x-1">
                    {campaign.platforms.map((platform, index) => (
                      <div key={index} className="text-lg">
                        {getPlatformIcon(platform)}
                      </div>
                    ))}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                {/* Campaign Image */}
                <div className="px-3 pb-3">
                <ImageWithTitleFallback
                    src={campaign.image}
                    title={campaign.title}
                />
                </div>

                {/* Campaign Details */}
                <div className="px-3 pb-3">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{campaign.title}</h3>
                  {/* <p className="text-xs text-gray-600 mb-3">{campaign.subtitle}</p> */}
                  
                  {/* Metrics */}
                  <div className="space-y-2">
                    {/* Row 1: Impressions and Reach */}
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Impressions</div>
                        <div className="text-sm text-left font-semibold text-gray-900">{campaign.metrics.impressions}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Reach</div>
                        <div className="text-sm font-semibold text-gray-900">{campaign.metrics.reach}</div>
                      </div>
                    </div>
                    
                    {/* Row 2: Clicks and Budget */}
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Clicks</div>
                        <div className="text-sm font-semibold text-gray-900">{campaign.metrics.clicks}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Budget</div>
                        <div className="text-sm font-semibold text-gray-900">{campaign.metrics.budget}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full pt-3">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Insights</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Last 7 days</span>
              <Button>Export</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Impressions vs Reach Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Impressions vs Reach</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Impressions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-600">Reach</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={impressionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="reach" stroke="#14b8a6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement by Platform */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Engagement by Platform</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Age & Gender Demographics */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Age & Gender Demographics</h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={demographicsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {demographicsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="ml-4 space-y-2">
                  {demographicsData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm min-w-24">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: entry.fill }}></div>
                        <span className="text-gray-600">{entry.name}</span>
                      </div>
                      <span className="font-medium ml-2">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
              <div className="h-48 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.986579786365!2d76.94090847801193!3d8.500683069730242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xabdef907d58a4cd3%3A0xf4fb31e38785628b!2sCanbridge%20Global%20Study%20Abroad!5e0!3m2!1sen!2sin!4v1752305185944!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Top Performing Posts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Top Performing Post</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      {/* Post Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center">
                            <i className="ri-instagram-line text-pink-500 text-lg"></i>
                          </div>
                          <span className="text-xs text-gray-500">Posted on June 18, 2025</span>
                        </div>
                        
                        <h4 className="font-semibold text-sm text-gray-900 mb-2"> <span className='text-blue-600'>#{index + 1}</span> Trending Instagram Post</h4>
                        
                        {/* Metrics in one row */}
                        <div className="flex justify-between items-center text-xs">
                          <div className="text-center">
                            <div className="text-gray-500">Likes</div>
                            <div className="font-semibold text-base text-blue-600">{post.likes}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Comments</div>
                            <div className="font-semibold text-blue-600 text-base">{post.comments}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Shares</div>
                            <div className="font-semibold text-blue-600 text-base">{post.shares}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Posts */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Scheduled Posts</h2>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigateWeek(-1)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <i className="ri-arrow-left-s-line"></i>
                Previous
              </Button>
              <span className="text-sm font-medium">
                {formatDate(currentWeekStart)} - {formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}, {currentWeekStart.getFullYear()}
              </span>
              <Button 
                onClick={() => navigateWeek(1)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                Next
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header with Time column and Days */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 bg-gray-50 font-medium text-sm text-gray-900 border-r border-gray-200">
                Time
              </div>
              {getWeekDays(currentWeekStart).map((day, index) => (
                <div key={index} className="p-4 text-center border-r border-gray-200 last:border-r-0 font-medium text-sm text-gray-900">
                  <div>{day.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{day.date}</div>
                </div>
              ))}
            </div>

            {/* Time slots and scheduled posts */}
            <div className="divide-y divide-gray-200">
              {['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'].map((time) => (
                <div key={time} className="grid grid-cols-8 min-h-20">
                  <div className="p-4 bg-gray-50 border-r border-gray-200 font-medium text-sm text-gray-900 flex items-start">
                    {time}
                  </div>
                  {getWeekDays(currentWeekStart).map((day, dayIndex) => (
                    <div key={dayIndex} className="p-3 border-r border-gray-200 last:border-r-0">
                      {getPostsForTimeAndDay(time, dayIndex, currentWeekStart).map((post, postIndex) => {
                        const colors = getColorClasses(post.color);
                        return (
                          <div key={postIndex} className={`${colors.bg} border-l-4 ${colors.border} p-2 rounded-r mb-2 last:mb-0`}>
                            <div className="flex items-center space-x-1 mb-1">
                              <span className={colors.icon}>
                                {getPlatformIcon(post.platform)}
                              </span>
                              <span className={`text-xs font-medium ${colors.text}`}>{post.type}</span>
                            </div>
                            <div className="text-xs text-gray-600">{post.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;