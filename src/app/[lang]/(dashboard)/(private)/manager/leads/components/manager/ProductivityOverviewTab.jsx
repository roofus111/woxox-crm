"use client";

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const MetricCard = ({ title, value, subtitle }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    border: '1px solid #e5e7eb'
  }}>
    <h3 style={{
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '0.5rem',
      margin: '0 0 0.5rem 0'
    }}>
      {title}
    </h3>
    <div style={{
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.25rem'
    }}>
      {value}
    </div>
    <p style={{
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0'
    }}>
      {subtitle}
    </p>
  </div>
);

const ProductivityOverviewTab = ({ tasks }) => {
  const [reportData, setReportData] = useState({
    productivityMetrics: {
      avgTasksPerDay: 0,
      overdueTasks: 0,
      highPriorityTasks: 0,
      totalTasks: 0
    },
    priorityDistribution: [],
    statusDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    if (Array.isArray(tasks)) {
      const calculatedData = calculateMetrics(tasks);
      setReportData(calculatedData);
    }
  }, [tasks]);

  // Function to calculate productivity metrics from API data
  const calculateMetrics = (tasks) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Filter tasks from last 30 days
    const recentTasks = tasks.filter(task => 
      new Date(task.createdAt) >= thirtyDaysAgo
    );
    
    // Calculate average tasks per day (last 30 days)
    const avgTasksPerDay = Math.round((recentTasks.length / 30) * 10) / 10;
    
    // Count overdue tasks
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status !== 'Completed' && task.status !== 'Cancelled';
    }).length;
    
    // Count high priority tasks
    const highPriorityTasks = tasks.filter(task => 
      task.priority === 'high' && task.status !== 'Completed' && task.status !== 'Cancelled'
    ).length;
    
    // Total tasks
    const totalTasks = tasks.length;
    
    // Priority distribution
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    const priorityDistribution = [
      { name: 'High', value: priorityCounts.high || 0, color: '#ef4444' },
      { name: 'Medium', value: priorityCounts.medium || 0, color: '#f59e0b' },
      { name: 'Low', value: priorityCounts.low || 0, color: '#10b981' }
    ].filter(item => item.value > 0);
    
    // Status distribution
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
    
    return {
      productivityMetrics: {
        avgTasksPerDay,
        overdueTasks,
        highPriorityTasks,
        totalTasks
      },
      priorityDistribution,
      statusDistribution
    };
  };

    useEffect(() => {
    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No auth token found');
        }
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/getalltasks`,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        let tasks = [];
        if (Array.isArray(response.data)) {
            tasks = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {

            tasks = response.data.data;
        } else {
            console.warn('Unexpected response shape:', response.data);

            tasks = [];
        }

        const calculatedData = calculateMetrics(tasks);
        setReportData(calculatedData);
        } catch (err) {
        console.error('Error fetching tasks:', err);
        let message = '';
        if (axios.isAxiosError(err)) {
            if (err.response) {
            message = `Request failed with status ${err.response.status}`;
            } else if (err.request) {
            message = 'No response received from server';
            } else {
            message = err.message;
            }
        } else {
            message = err.message || 'Unknown error';
        }
        setError(message);
        } finally {
        setLoading(false);
        }
    };

  fetchTasks();
}, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Loading productivity data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.125rem', color: '#ef4444' }}>
          Error loading data: {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Productivity Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <MetricCard
          title="Avg Tasks Per Day"
          value={reportData.productivityMetrics.avgTasksPerDay}
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Overdue Tasks"
          value={reportData.productivityMetrics.overdueTasks}
          subtitle="Requires attention"
        />
        <MetricCard
          title="High Priority Tasks"
          value={reportData.productivityMetrics.highPriorityTasks}
          subtitle="Active"
        />
        <MetricCard
          title="Total Tasks"
          value={reportData.productivityMetrics.totalTasks}
          subtitle="All time"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Priority Distribution */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}
          >
            Priority Distribution
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            {reportData.priorityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                color: '#6b7280'
              }}>
                No priority data available
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}
          >
            Status Distribution
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            {reportData.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                color: '#6b7280'
              }}>
                No status data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityOverviewTab;