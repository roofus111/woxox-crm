import { Button, IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';

const Calendar = ({ users, tasks = [], onBack, onTaskClick, onTaskCreated }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'Open',
    assignee: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Helper: format date to YYYY-MM-DD
  const getDateString = (date) => {
    if (!date) return null;
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compute tasks for a date from tasks prop
  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateString = getDateString(date);
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDateString = getDateString(task.dueDate);
      return taskDateString === dateString;
    });
  };

  // Whenever selectedDate or tasks prop changes, update tasksForSelectedDate
  useEffect(() => {
    if (selectedDate) {
      const dayTasks = getTasksForDate(selectedDate);
      setTasksForSelectedDate(dayTasks);
    } else {
      setTasksForSelectedDate([]);
    }
  }, [selectedDate, tasks]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Generate calendar grid days
  const generateCalendarDays = (targetDate) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDateObj);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const dayTasks = getTasksForDate(date);
      days.push({
        date,
        isCurrentMonth,
        isToday,
        tasks: dayTasks,
        hasHighPriorityTasks: dayTasks.some(t => t.priority === 'high'),
        taskCount: dayTasks.length
      });
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const currentCalendarDays = generateCalendarDays(currentDate);
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
  const nextCalendarDays = generateCalendarDays(nextMonthDate);

  // Handle clicking a date cell
  const handleDateClick = (dayObj) => {
    if (dayObj.isCurrentMonth) {
      setSelectedDate(dayObj.date);
      setShowNewTaskForm(false);
    }
  };

  // Handle “+ Add Task”
  const handleAddNewTask = () => {
    if (selectedDate) {
      setNewTask(prev => ({
        ...prev,
        dueDate: getDateString(selectedDate)
      }));
      setShowNewTaskForm(true);
    }
  };

  // Input change in form
  const handleInputChange = (field, value) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create task API call
  const createTask = async () => {
    if (!newTask.title.trim()) return;
    console.log('createTask called with:', newTask);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const taskData = {
        ...newTask,
        // ensure dueDate is set: either from newTask.dueDate or selectedDate
        dueDate: selectedDate ? getDateString(selectedDate) : newTask.dueDate
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/createTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) {
        console.error('Failed to create task, status:', response.status);
        setLoading(false);
        return;
      }
      const createdTask = await response.json();
      console.log('Task created response:', createdTask);

      // Inform parent
      if (typeof onTaskCreated === 'function') {
        console.log('Calling onTaskCreated callback');
        onTaskCreated(createdTask);
      } else {
        console.warn('onTaskCreated is not a function or not provided');
      }

      // Reset form and close
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'Open',
        assignee: ''
      });
      setShowNewTaskForm(false);
      // No internal fetch/update: rely on parent re-passing updated `tasks`

      // Optionally, after parent updates tasks, this effect ([tasks]) will run and update tasksForSelectedDate.
    } catch (error) {
      console.error('Error in createTask:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get user name
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          {onBack && (
            <button onClick={onBack} style={{
              padding: '0.5rem 1rem', backgroundColor: 'white',
              border: '1px solid #d1d5db', borderRadius: '6px',
              fontSize: '0.875rem', cursor: 'pointer',
              fontWeight: '500', color: '#374151'
            }}>
              ← Back
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '400', color: '#1f2937', margin: 0 }}>
              Calendar
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
              View your tasks and deadlines in calendar format
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          {/* Calendar Grid */}
          <div>
            {/* Month nav */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '2rem', gap: '2rem'
            }}>
              <IconButton onClick={goToPreviousMonth}><i class="ri-arrow-left-s-line"></i></IconButton>
              <div style={{ display: 'flex', gap: '4rem' }}>
                <h2 style={{
                  fontSize: '1.25rem', fontWeight: '400',
                  color: '#1f2937', margin: 0,
                  minWidth: '120px', textAlign: 'center'
                }}>
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <h2 style={{
                  fontSize: '1.25rem', fontWeight: '400',
                  color: '#1f2937', margin: 0,
                  minWidth: '120px', textAlign: 'center'
                }}>
                  {months[nextMonthDate.getMonth()]} {nextMonthDate.getFullYear()}
                </h2>
              </div>
              <IconButton onClick={goToNextMonth}><i class="ri-arrow-right-s-line"></i></IconButton>
            </div>

            {/* Two months */}
            <div style={{ display: 'flex', gap: '4rem' }}>
              {/** Render currentCalendarDays and nextCalendarDays similarly to your existing code,
                  using handleDateClick(dayObj) on click, coloring selectedDate, showing indicator dots, etc. **/}
              {/* Example for current month: */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px', marginBottom: '0.5rem'
                }}>
                  {daysOfWeek.map(day => (
                    <div key={day} style={{
                      padding: '0.5rem', textAlign: 'center',
                      fontSize: '0.875rem', fontWeight: '500', color: '#6b7280'
                    }}>{day}</div>
                  ))}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px'
                }}>
                  {currentCalendarDays.map((dayObj, idx) => {
                    const isSelected = selectedDate && selectedDate.toDateString() === dayObj.date.toDateString();
                    return (
                      <div key={idx}
                        onClick={() => handleDateClick(dayObj)}
                        style={{
                          minHeight: '40px', padding: '0.5rem',
                          cursor: dayObj.isCurrentMonth ? 'pointer' : 'default',
                          position: 'relative', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                          color: isSelected
                            ? 'white'
                            : dayObj.isCurrentMonth ? '#1f2937' : '#d1d5db',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? '600' : '400',
                          width: '40px', height: '40px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (dayObj.isCurrentMonth && !isSelected) {
                            e.target.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (dayObj.isCurrentMonth && !isSelected) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {dayObj.date.getDate()}
                        {dayObj.taskCount > 0 && (
                          <div style={{
                            position: 'absolute', top: '6px', right: '6px',
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: dayObj.hasHighPriorityTasks ? '#ef4444' : '#3b82f6'
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next month similar... */}
              <div style={{ flex: 1 }}>
                {/* Days header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px', marginBottom: '0.5rem'
                }}>
                  {daysOfWeek.map(day => (
                    <div key={day} style={{
                      padding: '0.5rem', textAlign: 'center',
                      fontSize: '0.875rem', fontWeight: '500', color: '#6b7280'
                    }}>{day}</div>
                  ))}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px'
                }}>
                  {nextCalendarDays.map((dayObj, idx) => {
                    const isSelected = selectedDate && selectedDate.toDateString() === dayObj.date.toDateString();
                    return (
                      <div key={idx}
                        onClick={() => handleDateClick(dayObj)}
                        style={{
                          minHeight: '40px', padding: '0.5rem',
                          cursor: dayObj.isCurrentMonth ? 'pointer' : 'default',
                          position: 'relative', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                          color: isSelected
                            ? 'white'
                            : dayObj.isCurrentMonth ? '#1f2937' : '#d1d5db',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? '600' : '400',
                          width: '40px', height: '40px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (dayObj.isCurrentMonth && !isSelected) {
                            e.target.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (dayObj.isCurrentMonth && !isSelected) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {dayObj.date.getDate()}
                        {dayObj.taskCount > 0 && (
                          <div style={{
                            position: 'absolute', top: '6px', right: '6px',
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: dayObj.hasHighPriorityTasks ? '#ef4444' : '#3b82f6'
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Tasks Section - Redesigned */}
          <div className="bg-white rounded-3xl p-6 h-fit border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
                <p className="text-sm text-gray-500">
                  {selectedDate 
                    ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Select a date'
                  }
                </p>
              </div>
              {selectedDate && (
                <Button 
                  onClick={handleAddNewTask}
                >
                  + Add Task
                </Button>
              )}
            </div>

            {/* New Task Form */}
            {showNewTaskForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Add New Task</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={newTask.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newTask.priority}
                      onChange={e => handleInputChange('priority', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>

                      <select
                      value={newTask.status}
                      onChange={e => handleInputChange('status', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                      value={newTask.assignee}
                      onChange={e => handleInputChange('assignee', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Assignee</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => setShowNewTaskForm(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createTask}
                      disabled={loading || !newTask.title.trim()}
                      className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {!selectedDate ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Click on a date to view tasks</p>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 text-sm mt-2">Loading...</p>
                </div>
              ) : tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">No tasks for this date</p>
                  {/* <button 
                    onClick={handleAddNewTask}
                    className="text-blue-600 text-sm hover:text-blue-700 font-medium"
                  >
                    Add your first task
                  </button> */}
                </div>
              ) : (
                tasksForSelectedDate.map((task) => (
                  <div 
                    key={task._id}
                    onClick={() => onTaskClick && onTaskClick(task)}
                    className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-gray-300"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981' }}
                      >
                        {(() => {
                          // Get assignee name and first letter
                          let assigneeName = '';
                          if (task.assignee) {
                            if (typeof task.assignee === 'object') {
                              assigneeName = task.assignee.name || '';
                            } else {
                              assigneeName = getUserName(task.assignee) || '';
                            }
                          }
                          
                          // Return first letter of assignee name, or fallback to task title
                          return assigneeName 
                            ? assigneeName.charAt(0).toUpperCase()
                            : task.title.charAt(0).toUpperCase();
                        })()}
                      </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {task.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: task.status === 'Completed' ? '#10b981' : task.status === 'In Progress' ? '#f59e0b' : '#6b7280',
                          color: 'white'
                        }}
                      >
                        {task.status === 'Open' ? 'Open' : task.status}
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        <span className="capitalize">{task.priority}</span>
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>
                            {typeof task.assignee === 'object' 
                              ? task.assignee.name 
                              : getUserName(task.assignee)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
