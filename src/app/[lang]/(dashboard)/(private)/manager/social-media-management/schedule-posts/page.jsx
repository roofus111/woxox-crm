"use client";

import { Button } from '@mui/material';
import React, { useState } from 'react';

const SchedulePostsComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1));
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPeriod, setSelectedPeriod] = useState('Month');

  const stats = [
    { label: 'Scheduled Posts', value: '28', icon: <i className="ri-calendar-line text-purple-600"></i>, backgroundColor: 'text-purple-600' },
    { label: 'Published This Month', value: '42', icon: <i className="ri-check-double-line text-green-600"></i>, color: 'text-green-600' },
    { label: 'Drafts', value: '7', icon: <i className="ri-draft-line text-blue-600"></i>, color: 'text-blue-600' },
    { label: 'Avg. Engagement', value: '4.2%', icon: <i className="ri-star-line text-yellow-600"></i>, color: 'text-yellow-600' }
  ];

  const platforms = [
    { name: 'Facebook', color: 'bg-blue-500', percentage: 35 },
    { name: 'Instagram', color: 'bg-pink-500', percentage: 30 },
    { name: 'Twitter', color: 'bg-orange-500', percentage: 20 },
    { name: 'LinkedIn', color: 'bg-orange-400', percentage: 15 }
  ];

  const timeSlots = ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
  const bestTimeData = [2, 3, 4, 5, 4, 3, 2];

  const scheduledPosts = [
    { date: 3, title: 'Product Launch', time: '9:00 AM', platform: 'instagram' },
    { date: 5, title: 'Instagram Story', time: '2:30 PM', platform: 'instagram' },
    { date: 13, title: 'Weekly Tips', time: '4:00 PM', platform: 'multiple' },
    { date: 17, title: 'Product Feature', time: '10:00 AM', platform: 'facebook' },
    { date: 19, title: 'Today Post 1', time: '9:00 AM', platform: 'facebook' },
    { date: 19, title: 'Today Post 2', time: '2:00 PM', platform: 'instagram' },
    { date: 21, title: 'Industry News', time: '9:30 AM', platform: 'linkedin' },
    { date: 24, title: 'Team Spotlight', time: '3:00 PM', platform: 'twitter' },
    { date: 25, title: 'Special Offer', time: '5:00 PM', platform: 'facebook' },
    { date: 26, title: 'Customer Q&A', time: '2:00 PM', platform: 'multiple' },
    { date: 30, title: 'Monthly Recap', time: '10:00 AM', platform: 'multiple' }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(date.getDate() - day);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      weekDays.push(currentDay);
    }
    
    return weekDays;
  };

  const getTodayDate = () => {
    // For demo purposes, using June 19, 2025 as "today"
    return new Date(2025, 5, 19);
  };

  const getPostsForDay = (day) => {
    return scheduledPosts.filter(post => post.date === day);
  };

  const getPostsForDate = (date) => {
    return scheduledPosts.filter(post => post.date === date.getDate());
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-100 text-blue-600';
      case 'instagram': return 'bg-pink-100 text-pink-600';
      case 'twitter': return 'bg-orange-100 text-orange-600';
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'multiple': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period === 'Today') {
      setCurrentDate(getTodayDate());
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (selectedPeriod === 'Today') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (selectedPeriod === 'Week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (selectedPeriod === 'Month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const getDisplayTitle = () => {
    if (selectedPeriod === 'Today') {
      return `Today - ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    } else if (selectedPeriod === 'Week') {
      const weekDays = getWeekDays(currentDate);
      const startDate = weekDays[0];
      const endDate = weekDays[6];
      return `Week of ${monthNames[startDate.getMonth()]} ${startDate.getDate()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const renderTodayView = () => {
    const todayPosts = getPostsForDay(currentDate.getDate());
    
    return (
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
        <div className="space-y-4">
          {todayPosts.length > 0 ? (
            todayPosts.map((post, index) => (
              <div key={index} className={`p-4 rounded-lg ${getPlatformColor(post.platform)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{post.title}</h4>
                    <p className="text-sm opacity-75">{post.time}</p>
                  </div>
                  <div className="text-sm capitalize">{post.platform}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="ri-calendar-line text-4xl mb-2"></i>
              <p>No posts scheduled for today</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayPosts = getPostsForDate(day);
          const isToday = day.toDateString() === getTodayDate().toDateString();
          
          return (
            <div key={index} className={`border rounded-lg p-3 min-h-[200px] ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
              <div className="text-center mb-3">
                <div className="text-xs text-gray-500">{dayNames[index]}</div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="space-y-2">
                {dayPosts.map((post, postIndex) => (
                  <div key={postIndex} className={`text-xs p-2 rounded ${getPlatformColor(post.platform)}`}>
                    <div className="font-medium truncate">{post.title}</div>
                    <div className="opacity-75">{post.time}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div key={index} className="min-h-[100px] border border-gray-200 p-1">
            {day && (
              <>
                <div className="text-sm text-gray-900 mb-1">{day}</div>
                {getPostsForDay(day).map((post, postIndex) => (
                  <div
                    key={postIndex}
                    className={`text-xs p-1 rounded mb-1 ${getPlatformColor(post.platform)}`}
                  >
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs opacity-75">{post.time}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Posts</h1>
          <p className="text-gray-600">Plan and Schedule your social media content across multiple platforms</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <i className="ri-add-line"></i>
          Create New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Posting Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posting Frequency */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Posting Frequency</h3>
            <div className="h-32">
              <svg className="w-full h-full" viewBox="0 0 300 120">
                <path
                  d="M 20 100 Q 60 60 100 70 T 180 50 Q 220 40 260 60 T 280 80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <circle cx="60" cy="60" r="3" fill="#3b82f6" />
                <circle cx="100" cy="70" r="3" fill="#3b82f6" />
                <circle cx="140" cy="50" r="3" fill="#3b82f6" />
                <circle cx="180" cy="50" r="3" fill="#3b82f6" />
                <circle cx="220" cy="60" r="3" fill="#3b82f6" />
                <circle cx="260" cy="80" r="3" fill="#3b82f6" />
              </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Platform Distribution */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Platform Distribution</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background circle */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  
                  {/* Facebook - 35% */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="8" 
                          strokeDasharray={`${35 * 3.14} 314`} strokeDashoffset="0" />
                  
                  {/* Instagram - 30% */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#ec4899" strokeWidth="8"
                          strokeDasharray={`${30 * 3.14} 314`} strokeDashoffset={`-${35 * 3.14}`} />
                  
                  {/* Twitter - 20% */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f97316" strokeWidth="8"
                          strokeDasharray={`${20 * 3.14} 314`} strokeDashoffset={`-${65 * 3.14}`} />
                  
                  {/* LinkedIn - 15% */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#fb923c" strokeWidth="8"
                          strokeDasharray={`${15 * 3.14} 314`} strokeDashoffset={`-${85 * 3.14}`} />
                </svg>
              </div>
              
              <div className="flex-1 space-y-2">
                {platforms.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${platform.color}`}></div>
                      <span>{platform.name}</span>
                    </div>
                    <span className="text-gray-500">{platform.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best Performing Time Slot */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Best Performing Time Slot</h3>
            <div className="h-32 flex items-end justify-center gap-1">
              {timeSlots.map((time, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-6 bg-teal-400 rounded-t-sm"
                    style={{ height: `${(bestTimeData[index] / 5) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-center whitespace-nowrap">
                    {time}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 bg-teal-400 rounded-full mr-1"></span>
                Performance Score (0-5)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Button
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} rounded`}
              onClick={() => setViewMode('grid')}
            >
              <i className="ri-layout-grid-2-line"></i>
            </Button>
            <Button
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} rounded`}
              onClick={() => setViewMode('list')}
            >
              <i className="ri-list-check"></i>
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search posts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="p-2 hover:bg-gray-100 rounded">
              <i className="ri-equalizer-2-line"></i>
            </Button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => navigateDate(-1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <i className="ri-arrow-left-line"></i>
          </Button>
          
          <h2 className="text-xl font-semibold">
            {getDisplayTitle()}
          </h2>
          
          <Button
            onClick={() => navigateDate(1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <i className="ri-arrow-right-line"></i>
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-4">
          {['Today', 'Week', 'Month'].map((period) => (
            <Button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Calendar Views */}
        {selectedPeriod === 'Today' && renderTodayView()}
        {selectedPeriod === 'Week' && renderWeekView()}
        {selectedPeriod === 'Month' && renderMonthView()}

        {/* Platform Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Facebook</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-sm">Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm">Twitter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
            <span className="text-sm">LinkedIn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Multiple Platforms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePostsComponent;