import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend } from 'recharts';
import ProductivityOverviewTab from './ProductivityOverviewTab';
import axios from 'axios';

const Reports = ({ tasks, users, onBack }) => {
  const [activeTab, setActiveTab] = useState('Task Completion');
  const [reportData, setReportData] = useState({
    completionRate: 0,
    completionTrend: 0,
    monthlyData: [],
    statusDistribution: [],
    teamPerformance: [],
    productivityMetrics: {},
    apiData: null,
    performanceData: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorTasks, setErrorTasks] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [monthlyChartData, setMonthlyChartData] = useState([]);

  useEffect(() => {
    fetchTaskCounts();
  }, [tasks, users]);

  const fetchTaskCounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const [taskCountsResponse, performanceData] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/getcounts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        fetchPerformanceData()
      ]);
      
      const apiData = taskCountsResponse.data;
      
      const completedTasks = apiData.statusCounts.Completed || 0;
      const totalTasks = apiData.totalTasks || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const statusDistribution = Object.entries(apiData.statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        percentage: Math.round((count / totalTasks) * 100)
      }));

      const teamPerformance = transformAssigneeData(apiData.assigneeStatusCounts || [], totalTasks);

      // Set initial month to the latest available data
      if (performanceData.length > 0) {
        const latestYear = Math.max(...performanceData.map(data => data.year));
        setSelectedYear(latestYear);
      }

      // Generate chart data for all months
      const chartData = generateMonthlyChartData(performanceData);

      setReportData({
        completionRate,
        completionTrend: 5,
        monthlyData: performanceData,
        statusDistribution,
        teamPerformance,
        productivityMetrics: {
          avgTasksPerDay: (totalTasks / 30).toFixed(1),
          overdueTasks: 0,
          highPriorityTasks: apiData.priorityCounts?.high || 0,
          totalTasks: totalTasks
        },
        apiData: apiData,
        performanceData: performanceData
      });

      setMonthlyChartData(chartData);
    } catch (error) {
      console.error('Error fetching task counts:', error);
      setError('Failed to fetch task data. Please try again.');
      
      // ... existing error handling ...
    } finally {
      setLoading(false);
    }
  };

  //  useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) return;
  //   const fetchAllTasks = async () => {
  //     setLoadingTasks(true);
  //     setErrorTasks(null);
  //     try {
  //       const response = await axios.get(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/getalltasks`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  //       setAllTasks(response.data);
  //     } catch (err) {
  //       console.error('Error fetching all tasks:', err);
  //       setErrorTasks(err);
  //     } finally {
  //       setLoadingTasks(false);
  //     }
  //   };
  //   fetchAllTasks();
  // }, [token]);

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/performance/calculate`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.metrics && response.data.metrics.metrics) {
        const performanceData = response.data.metrics.metrics.map(metric => ({
          month: metric.month,
          year: metric.year,
          completedTasks: metric.completedTasks, 
          createdTasks: metric.createdTasks,
          totalPendingTasks: metric.totalPendingTasks,
          completionRate: metric.createdTasks > 0 ? Math.round((metric.completedTasks / metric.createdTasks) * 100) : 0,
          userMetrics: metric.userMetrics || []
        }));

        return performanceData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching performance data:', error);
      return [];
    }
  };

  const transformAssigneeData = (assigneeStatusCounts, totalTasks) => {
    if (!assigneeStatusCounts || assigneeStatusCounts.length === 0) return [];

    const assigneeGroups = assigneeStatusCounts.reduce((acc, item) => {
      if (!acc[item.assignee]) {
        acc[item.assignee] = {
          name: item.assigneeName || 'Unknown',
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          otherTasks: 0
        };
      }
      
      acc[item.assignee].totalTasks += item.count;
      
      if (item.status === 'Completed') {
        acc[item.assignee].completedTasks += item.count;
      } else if (item.status === 'Pending') {
        acc[item.assignee].pendingTasks += item.count;
      } else {
        acc[item.assignee].otherTasks += item.count;
      }
      
      return acc;
    }, {});

    return Object.values(assigneeGroups).map(assignee => ({
      ...assignee,
      completionRate: assignee.totalTasks > 0 ? Math.round((assignee.completedTasks / assignee.totalTasks) * 100) : 0
    }));
  };

  const generateMonthlyChartData = (performanceData) => {
    if (!performanceData || performanceData.length === 0) return [];
    
    const monthlyData = performanceData.map(metric => {
      const monthName = getMonthName(metric.month);
      return {
        month: monthName,
        completed: metric.completedTasks,
        pending: metric.totalPendingTasks,
        created: metric.createdTasks,
        completionRate: metric.createdTasks > 0 ? Math.round((metric.completedTasks / metric.createdTasks) * 100) : 0
      };
    });

    return monthlyData;
  };
  
  
    const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1];
  };

  const navigateYear = (direction) => {
    const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
    
    const currentIndex = availableYears.findIndex(year => year === selectedYear);
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
    } else {
      newIndex = currentIndex < availableYears.length - 1 ? currentIndex + 1 : currentIndex;
    }
    
    if (availableYears[newIndex] && newIndex !== currentIndex) {
      setSelectedYear(availableYears[newIndex]);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const TabButton = ({ title, isActive, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: isActive ? '#3b82f6' : '#6b7280',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {title}
    </button>
  );

  const MetricCard = ({ title, value, subtitle, trend }) => (
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
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#6b7280',
          marginBottom: '0.5rem',
          margin: 0
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#1f2937'
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: '0.875rem',
              color: trend > 0 ? '#10b981' : '#ef4444',
              fontWeight: '500'
            }}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  const TaskCompletionTab = () => {
  const currentYearData = reportData.performanceData.filter(data => data.year === selectedYear);
  
  const yearTotals = currentYearData.reduce((acc, month) => ({
    completedTasks: acc.completedTasks + month.completedTasks,
    totalPendingTasks: acc.totalPendingTasks + month.totalPendingTasks,
    createdTasks: acc.createdTasks + month.createdTasks
  }), { completedTasks: 0, totalPendingTasks: 0, createdTasks: 0 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            color: '#dc2626'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={fetchTaskCounts}
              style={{
                marginLeft: 'auto',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <MetricCard
          title="Task Completion Rate"
          value={`${reportData.completionRate}%`}
          subtitle="Overall completion rate"
          // trend={reportData.completionTrend}
        />
        <MetricCard
          title="Total Tasks"
          value={reportData.apiData?.totalTasks || 0}
          subtitle="All tasks"
        />
        <MetricCard
          title="Completed Tasks"
          value={reportData.apiData?.statusCounts?.Completed || 0}
          subtitle="Successfully completed"
        />
        <MetricCard
          title="Pending Tasks"
          value={reportData.apiData?.statusCounts?.Pending || 0}
          subtitle="Awaiting completion"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Updated Task Completion Trend Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  margin: '0 0 0.5rem 0'
                }}
              >
                Tasks Completed Over Time ({selectedYear})
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}
                >
                  {yearTotals.completedTasks}
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#10b981',
                    fontWeight: '500'
                  }}
                >
                  Completed
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: '0.25rem 0 0 0'
                }}
              >
                {yearTotals.totalPendingTasks} Pending | {yearTotals.createdTasks} Created
              </p>
            </div>
            
            {/* Year Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigateYear('prev')}
                disabled={(() => {
                  const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                  const currentIndex = availableYears.findIndex(year => year === selectedYear);
                  return currentIndex <= 0;
                })()}
                style={{
                  padding: '0.5rem',
                  backgroundColor: (() => {
                    const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                    const currentIndex = availableYears.findIndex(year => year === selectedYear);
                    return currentIndex <= 0 ? '#f3f4f6' : '#f9fafb';
                  })(),
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: (() => {
                    const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                    const currentIndex = availableYears.findIndex(year => year === selectedYear);
                    return currentIndex <= 0 ? 'not-allowed' : 'pointer';
                  })(),
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}
              >
                ←
              </button>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  minWidth: '60px',
                  textAlign: 'center'
                }}
              >
                {selectedYear}
              </span>
              <button
                onClick={() => navigateYear('next')}
                disabled={(() => {
                  const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                  const currentIndex = availableYears.findIndex(year => year === selectedYear);
                  return currentIndex >= availableYears.length - 1;
                })()}
                style={{
                  padding: '0.5rem',
                  backgroundColor: (() => {
                    const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                    const currentIndex = availableYears.findIndex(year => year === selectedYear);
                    return currentIndex >= availableYears.length - 1 ? '#f3f4f6' : '#f9fafb';
                  })(),
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: (() => {
                    const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                    const currentIndex = availableYears.findIndex(year => year === selectedYear);
                    return currentIndex >= availableYears.length - 1 ? 'not-allowed' : 'pointer';
                  })(),
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}
              >
                →
              </button>
            </div>
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentYearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => getMonthName(value)}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => `${getMonthName(value)} ${selectedYear}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completedTasks" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Completed Tasks"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalPendingTasks" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Pending Tasks"
                />
                <Line 
                  type="monotone" 
                  dataKey="createdTasks" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Created Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown - shows data for selected year */}
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
            {selectedYear} Status Breakdown
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937' }}>
              {yearTotals.createdTasks}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Total Tasks Created
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}
              />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>Completed</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{yearTotals.completedTasks}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    ({yearTotals.createdTasks > 0 ? Math.round((yearTotals.completedTasks / yearTotals.createdTasks) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b'
                }}
              />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>Pending</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{yearTotals.totalPendingTasks}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    ({yearTotals.createdTasks > 0 ? Math.round((yearTotals.totalPendingTasks / yearTotals.createdTasks) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }

  const TeamPerformanceTab = () => {
    // Add state for month navigation
    const [selectedMonth, setSelectedMonth] = useState(() => {
      const currentYearData = reportData.performanceData.filter(data => data.year === selectedYear);
      return currentYearData.length > 0 ? Math.max(...currentYearData.map(data => data.month)) : 1;
    });

    // Get current year and month data
    const currentYearData = reportData.performanceData.filter(data => data.year === selectedYear);
    const currentMonthData = currentYearData.find(data => data.month === selectedMonth);
    
    // Calculate aggregated team metrics for the selected year
    const yearTeamMetrics = currentYearData.reduce((acc, monthData) => {
      if (monthData.userMetrics) {
        monthData.userMetrics.forEach(user => {
          if (!acc[user.userId]) {
            acc[user.userId] = {
              userId: user.userId,
              userName: user.userName,
              completedTasks: 0,
              createdTasks: 0,
              pendingTasks: 0,
              averageCompletionTime: 0,
              onTimeCompletionRate: 0,
              totalMonths: 0
            };
          }
          acc[user.userId].completedTasks += user.completedTasks;
          acc[user.userId].createdTasks += user.createdTasks;
          acc[user.userId].pendingTasks += user.pendingTasks;
          acc[user.userId].averageCompletionTime += user.averageCompletionTime;
          acc[user.userId].onTimeCompletionRate += user.onTimeCompletionRate;
          acc[user.userId].totalMonths += 1;
        });
      }
      return acc;
    }, {});

    // Convert to array and calculate averages for yearly stats
    const teamPerformanceData = Object.values(yearTeamMetrics).map(user => ({
      ...user,
      completionRate: user.createdTasks > 0 ? Math.round((user.completedTasks / user.createdTasks) * 100) : 0,
      averageCompletionTime: user.totalMonths > 0 ? Math.round(user.averageCompletionTime / user.totalMonths) : 0,
      onTimeCompletionRate: user.totalMonths > 0 ? Math.round(user.onTimeCompletionRate / user.totalMonths) : 0
    }));

    // Prepare chart data for the selected month
    const monthlyUserChartData = currentMonthData && currentMonthData.userMetrics ? 
      currentMonthData.userMetrics.map(user => {
        const completionRate = user.createdTasks > 0
          ? Math.round((user.completedTasks / user.createdTasks) * 100)
          : 0;
        const other = Math.max(0, user.createdTasks - user.completedTasks - user.pendingTasks);
        return {
          name: user.userName.split(' ')[0],
          fullName: user.userName,
          completed: user.completedTasks,
          pending: user.pendingTasks,
          // Option A: If you want to show “Created” total separately (grouped bars):
          totalCreated: user.createdTasks,
          // Option B: If you want to break “Created” into completed + pending + other (stacked bars):
          other: other,
          completionRate
        };
      }).sort((a, b) => {
        if (b.completed !== a.completed) {
          return b.completed - a.completed;
        }
        return b.completionRate - a.completionRate;
      }) : [];

    // Calculate overall team stats with updated top performer logic
    const overallStats = {
      activeMembers: teamPerformanceData.length,
      totalTasksAssigned: teamPerformanceData.reduce((sum, user) => sum + user.createdTasks, 0),
      totalTasksCompleted: teamPerformanceData.reduce((sum, user) => sum + user.completedTasks, 0),
      avgTeamCompletionRate: teamPerformanceData.length > 0 ? 
        Math.round(teamPerformanceData.reduce((sum, user) => sum + user.completionRate, 0) / teamPerformanceData.length) : 0,
      topPerformer: teamPerformanceData.length > 0 ? 
        teamPerformanceData.reduce((prev, current) => {
          // Prioritize by completed tasks first, then by completion rate
          if (current.completedTasks > prev.completedTasks) {
            return current;
          } else if (current.completedTasks === prev.completedTasks) {
            return current.completionRate > prev.completionRate ? current : prev;
          }
          return prev;
        }) : null
    };

    // Month navigation functions
    const navigateMonth = (direction) => {
      const availableMonths = currentYearData.map(data => data.month).sort((a, b) => a - b);
      const currentIndex = availableMonths.findIndex(month => month === selectedMonth);
      
      let newIndex;
      if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      } else {
        newIndex = currentIndex < availableMonths.length - 1 ? currentIndex + 1 : currentIndex;
      }
      
      if (availableMonths[newIndex] && newIndex !== currentIndex) {
        setSelectedMonth(availableMonths[newIndex]);
      }
    };

    // Update selectedMonth when year changes
    React.useEffect(() => {
      const currentYearData = reportData.performanceData.filter(data => data.year === selectedYear);
      if (currentYearData.length > 0) {
        const availableMonth = Math.max(...currentYearData.map(data => data.month));
        setSelectedMonth(availableMonth);
      }
    }, [selectedYear, reportData.performanceData]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Team Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <MetricCard
            title="Active Team Members"
            value={overallStats.activeMembers}
            subtitle={`In ${selectedYear}`}
          />
          <MetricCard
            title="Total Tasks Created"
            value={overallStats.totalTasksAssigned}
            subtitle={`In ${selectedYear}`}
          />
          <MetricCard
            title="Total Tasks Completed"
            value={overallStats.totalTasksCompleted}
            subtitle={`In ${selectedYear}`}
          />
          <MetricCard
            title="Top Performer"
            value={overallStats.topPerformer ? overallStats.topPerformer.userName.split(' ')[0] : 'N/A'}
            subtitle={overallStats.topPerformer ? 
              `${overallStats.topPerformer.completedTasks} completed • ${overallStats.topPerformer.completionRate}% rate` : 
              'No data'
            }
          />
        </div>

        {/* Individual User Performance Chart with Monthly Navigation */}
        {monthlyUserChartData.length > 0 && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 0.5rem 0'
                  }}
                >
                  Individual User Performance - {getMonthName(selectedMonth)} {selectedYear}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  Task breakdown by team member - Stacked view of Created, Completed, and Pending tasks
                </p>
              </div>
              
              {/* Year and Month Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Month Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Month:</span>
                  <button
                    onClick={() => navigateMonth('prev')}
                    disabled={(() => {
                      const availableMonths = currentYearData.map(data => data.month).sort((a, b) => a - b);
                      const currentIndex = availableMonths.findIndex(month => month === selectedMonth);
                      return currentIndex <= 0;
                    })()}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: (() => {
                        const availableMonths = currentYearData.map(data => data.month).sort((a, b) => a - b);
                        const currentIndex = availableMonths.findIndex(month => month === selectedMonth);
                        return currentIndex <= 0 ? '#f3f4f6' : '#f9fafb';
                      })(),
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      cursor: (() => {
                        const availableMonths = currentYearData.map(data => data.month).sort((a, b) => a - b);
                        const currentIndex = availableMonths.findIndex(month => month === selectedMonth);
                        return currentIndex <= 0 ? 'not-allowed' : 'pointer';
                      })(),
                      color: '#6b7280',
                      fontSize: '0.75rem'
                    }}
                  >
                    ←
                  </button>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}
                  >
                    {getMonthName(selectedMonth)}
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    disabled={(() => {
                      const availableMonths = currentYearData.map(data => data.month).sort((a, b) => a - b);
                      const currentIndex = availableMonths.findIndex(month => month === selectedMonth);
                      return currentIndex >= availableMonths.length - 1;
                    })()}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: (() => {
                        const availableMonths = currentYearData.map(data => data.month).sort((a, b) => a - b);
                        const currentIndex = availableMonths.findIndex(month => month === selectedMonth);
                        return currentIndex >= availableMonths.length - 1 ? '#f3f4f6' : '#f9fafb';
                      })(),
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      cursor: (() => {
                        const availableMonths = currentYearData.map(data => data.month).sort((a, b) => a - b);
                        const currentIndex = availableMonths.findIndex(month => month === selectedMonth);
                        return currentIndex >= availableMonths.length - 1 ? 'not-allowed' : 'pointer';
                      })(),
                      color: '#6b7280',
                      fontSize: '0.75rem'
                    }}
                  >
                    →
                  </button>
                </div>

                {/* Year Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Year:</span>
                  <button
                    onClick={() => navigateYear('prev')}
                    disabled={(() => {
                      const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                      const currentIndex = availableYears.findIndex(year => year === selectedYear);
                      return currentIndex <= 0;
                    })()}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: (() => {
                        const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                        const currentIndex = availableYears.findIndex(year => year === selectedYear);
                        return currentIndex <= 0 ? '#f3f4f6' : '#f9fafb';
                      })(),
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      cursor: (() => {
                        const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                        const currentIndex = availableYears.findIndex(year => year === selectedYear);
                        return currentIndex <= 0 ? 'not-allowed' : 'pointer';
                      })(),
                      color: '#6b7280',
                      fontSize: '0.75rem'
                    }}
                  >
                    ←
                  </button>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      minWidth: '50px',
                      textAlign: 'center'
                    }}
                  >
                    {selectedYear}
                  </span>
                  <button
                    onClick={() => navigateYear('next')}
                    disabled={(() => {
                      const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                      const currentIndex = availableYears.findIndex(year => year === selectedYear);
                      return currentIndex >= availableYears.length - 1;
                    })()}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: (() => {
                        const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                        const currentIndex = availableYears.findIndex(year => year === selectedYear);
                        return currentIndex >= availableYears.length - 1 ? '#f3f4f6' : '#f9fafb';
                      })(),
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      cursor: (() => {
                        const availableYears = [...new Set(reportData.performanceData.map(data => data.year))].sort();
                        const currentIndex = availableYears.findIndex(year => year === selectedYear);
                        return currentIndex >= availableYears.length - 1 ? 'not-allowed' : 'pointer';
                      })(),
                      color: '#6b7280',
                      fontSize: '0.75rem'
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyUserChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        // Map keys to display names
                        const displayName = name === 'totalCreated' 
                          ? 'Created Tasks' 
                          : name === 'completed' 
                            ? 'Completed Tasks' 
                            : name === 'pending' 
                              ? 'Pending Tasks'
                              : name;
                        return [value, displayName];
                      }}
                      labelFormatter={(label) => {
                        const user = monthlyUserChartData.find(u => u.name === label);
                        return user ? `${user.fullName} (${user.completionRate}% completion rate)` : label;
                      }}
                    />
                  <Legend />
                  <Bar dataKey="totalCreated" name="Created Tasks"   stackId="tasks" fill="#3b82f6" />
                  <Bar dataKey="completed"    name="Completed Tasks" stackId="tasks" fill="#10b981" />
                  <Bar dataKey="pending"      name="Pending Tasks"   stackId="tasks" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Monthly Performance Stats */}
        {currentMonthData && currentMonthData.userMetrics && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}
              >
                {getMonthName(selectedMonth)} {selectedYear} Performance Details
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                Detailed breakdown for the selected month
              </p>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Team Member
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Created
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Completed
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Pending
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Completion Rate
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Avg Completion Time
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      On-Time Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyUserChartData.map((member, index) => (
                    <tr key={member.fullName} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                        <div>
                          <div>{member.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            #{index + 1} this month
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {member.created}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
                        {member.completed}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#f59e0b', fontWeight: '500' }}>
                        {member.pending}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${member.completionRate}%`,
                                height: '100%',
                                backgroundColor: member.completionRate >= 80 ? '#10b981' : member.completionRate >= 60 ? '#f59e0b' : '#ef4444',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                            {member.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {currentMonthData.userMetrics.find(u => u.userName === member.fullName)?.averageCompletionTime > 0 ? 
                          `${Math.round(currentMonthData.userMetrics.find(u => u.userName === member.fullName).averageCompletionTime / (1000 * 60 * 60))}h` : 'N/A'
                        }
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            color: (() => {
                              const onTimeRate = currentMonthData.userMetrics.find(u => u.userName === member.fullName)?.onTimeCompletionRate || 0;
                              return onTimeRate >= 80 ? '#10b981' : onTimeRate >= 60 ? '#f59e0b' : '#ef4444';
                            })(),
                            fontWeight: '500'
                          }}>
                            {currentMonthData.userMetrics.find(u => u.userName === member.fullName)?.onTimeCompletionRate || 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Individual Performance Table for Year Overview */}
        {teamPerformanceData.length > 0 && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}
              >
                {selectedYear} Annual Performance Summary
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                Comprehensive year-to-date performance for each team member
              </p>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Team Member
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Created Tasks
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Completed
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Pending
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Completion Rate
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Avg Completion Time
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      On-Time Rate
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformanceData
                    .sort((a, b) => {
                      // Sort by completed tasks first, then by completion rate
                      if (b.completedTasks !== a.completedTasks) {
                        return b.completedTasks - a.completedTasks;
                      }
                      return b.completionRate - a.completionRate;
                    })
                    .map((member, index) => (
                    <tr key={member.userId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {member.userName}
                            {index === 0 && (
                              <span style={{
                                fontSize: '0.6rem',
                                fontWeight: '600',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '9999px',
                                backgroundColor: '#fbbf24',
                                color: '#92400e'
                              }}>
                                TOP
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            #{index + 1} in team
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {member.createdTasks}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
                        {member.completedTasks}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#f59e0b', fontWeight: '500' }}>
                        {member.pendingTasks}
                      </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '60px',
                                height: '8px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  width: `${member.completionRate}%`,
                                  height: '100%',
                                  backgroundColor: member.completionRate >= 80 ? '#10b981' : member.completionRate >= 60 ? '#f59e0b' : '#ef4444',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                              {member.completionRate}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          {member.averageCompletionTime > 0 ? 
                            `${Math.round(member.averageCompletionTime / (1000 * 60 * 60))}h` : 'N/A'
                          }
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ 
                              fontSize: '0.875rem', 
                              color: member.onTimeCompletionRate >= 80 ? '#10b981' : member.onTimeCompletionRate >= 60 ? '#f59e0b' : '#ef4444',
                              fontWeight: '500'
                            }}>
                              {member.onTimeCompletionRate}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                              backgroundColor: member.completionRate >= 80 ? '#dcfce7' : member.completionRate >= 60 ? '#fef3c7' : '#fee2e2',
                              color: member.completionRate >= 80 ? '#166534' : member.completionRate >= 60 ? '#92400e' : '#dc2626'
                            }}
                          >
                            {member.completionRate >= 80 ? 'Excellent' : member.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Data State */}
          {teamPerformanceData.length === 0 && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                padding: '3rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                No Team Data Available
              </h3>
              <p style={{ color: '#6b7280', margin: 0 }}>
                No team performance data found for {selectedYear}. Create some tasks to see team metrics.
              </p>
            </div>
          )}
        </div>
      );
    };

  // const ProductivityOverviewTab = () => (
  //   <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
  //     {/* Productivity Metrics */}
  //     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
  //       <MetricCard
  //         title="Avg Tasks Per Day"
  //         value={reportData.productivityMetrics.avgTasksPerDay}
  //         subtitle="Last 30 days"
  //       />
  //       <MetricCard
  //         title="Overdue Tasks"
  //         value={reportData.productivityMetrics.overdueTasks}
  //         subtitle="Requires attention"
  //       />
  //       <MetricCard
  //         title="High Priority Tasks"
  //         value={reportData.productivityMetrics.highPriorityTasks}
  //         subtitle="Active"
  //       />
  //       <MetricCard
  //         title="Total Tasks"
  //         value={reportData.productivityMetrics.totalTasks}
  //         subtitle="All time"
  //       />
  //     </div>

  //     {/* Charts */}
  //     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
  //       {/* Priority Distribution */}
  //       <div
  //         style={{
  //           backgroundColor: 'white',
  //           borderRadius: '12px',
  //           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  //           padding: '1.5rem',
  //           border: '1px solid #e5e7eb'
  //         }}
  //       >
  //         <h3
  //           style={{
  //             fontSize: '1.125rem',
  //             fontWeight: '600',
  //             color: '#1f2937',
  //             marginBottom: '1rem',
  //             margin: '0 0 1rem 0'
  //           }}
  //         >
  //           Priority Distribution
  //         </h3>
  //         <div style={{ height: '300px', width: '100%' }}>
  //           <ResponsiveContainer width="100%" height="100%">
  //             <PieChart>
  //               <Pie
  //                 data={[
  //                   { name: 'High', value: reportData.apiData?.priorityCounts?.high || 0, color: '#ef4444' },
  //                   { name: 'Medium', value: reportData.apiData?.priorityCounts?.medium || 0, color: '#f59e0b' },
  //                   { name: 'Low', value: reportData.apiData?.priorityCounts?.low || 0, color: '#10b981' }
  //                 ]}
  //                 cx="50%"
  //                 cy="50%"
  //                 outerRadius={80}
  //                 fill="#8884d8"
  //                 dataKey="value"
  //                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
  //               >
  //                 {[
  //                   { name: 'High', value: reportData.apiData?.priorityCounts?.high || 0, color: '#ef4444' },
  //                   { name: 'Medium', value: reportData.apiData?.priorityCounts?.medium || 0, color: '#f59e0b' },
  //                   { name: 'Low', value: reportData.apiData?.priorityCounts?.low || 0, color: '#10b981' }
  //                 ].map((entry, index) => (
  //                   <Cell key={`cell-${index}`} fill={entry.color} />
  //                 ))}
  //               </Pie>
  //               <Tooltip />
  //             </PieChart>
  //           </ResponsiveContainer>
  //         </div>
  //       </div>

  //       {/* Status Distribution */}
  //       <div
  //         style={{
  //           backgroundColor: 'white',
  //           borderRadius: '12px',
  //           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  //           padding: '1.5rem',
  //           border: '1px solid #e5e7eb'
  //         }}
  //       >
  //         <h3
  //           style={{
  //             fontSize: '1.125rem',
  //             fontWeight: '600',
  //             color: '#1f2937',
  //             marginBottom: '1rem',
  //             margin: '0 0 1rem 0'
  //           }}
  //         >
  //           Status Distribution
  //         </h3>
  //         <div style={{ height: '300px', width: '100%' }}>
  //           <ResponsiveContainer width="100%" height="100%">
  //             <PieChart>
  //               <Pie
  //                 data={reportData.statusDistribution}
  //                 cx="50%"
  //                 cy="50%"
  //                 outerRadius={80}
  //                 fill="#8884d8"
  //                 dataKey="value"
  //                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
  //               >
  //                 {reportData.statusDistribution.map((entry, index) => (
  //                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  //                 ))}
  //               </Pie>
  //               <Tooltip />
  //             </PieChart>
  //           </ResponsiveContainer>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}
            />
            <p style={{ color: '#6b7280' }}>Loading reports...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'Task Completion':
        return <TaskCompletionTab />;
      case 'Team Performance':
        return <TeamPerformanceTab />;
      case 'Productivity Overview':
        if (loadingTasks) {
          return <div>Loading productivity data...</div>;
        }
        if (errorTasks) {
          return <div>Error loading tasks: {errorTasks.message}</div>;
        }
        // Pass the fetched tasks array to the child:
        return <ProductivityOverviewTab tasks={allTasks} />;
      default:
        return <TaskCompletionTab />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              ←
            </button>
            <div>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}
              >
                Reports
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                Analyze task completion, team performance, and overall productivity.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <TabButton
              title="Task Completion"
              isActive={activeTab === 'Task Completion'}
              onClick={() => setActiveTab('Task Completion')}
            />
            <TabButton
              title="Team Performance"
              isActive={activeTab === 'Team Performance'}
              onClick={() => setActiveTab('Team Performance')}
            />
            <TabButton
              title="Productivity Overview"
              isActive={activeTab === 'Productivity Overview'}
              onClick={() => setActiveTab('Productivity Overview')}
            />
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Add keyframes for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Reports;