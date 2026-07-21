"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NewTaskForm from './NewTaskForm';
import TaskDetails from './TaskDetails';
import Calendar from './Calendar';
import Reports from './Reports';

const TaskManager = () => {
  const [currentView, setCurrentView] = useState('all-tasks');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    status: 'Open'
  });

  const [searchFilters, setSearchFilters] = useState({
    query: '',
    status: '',
    priority: '',
    assignee: ''
  });

  const [isSearching, setIsSearching] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    status: 'Open'
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Create axios headers with auth token
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/users/active`,
        { headers: getHeaders() }
      );

      console.log("Users API Response:", response.data);

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        console.log("Users set successfully:", response.data.data);
      } else {
        console.error("Unexpected users response format:", response.data);
        setError("Failed to load users - unexpected response format");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please check your connection.");
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/getalltasks`,
        { headers: getHeaders() }
      );

      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please check your connection and try again.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/createTask`,
        newTask,
        { headers: getHeaders() }
      );

      setTasks([...tasks, response.data]);
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        status: 'Open'
      });
      setCurrentView('all-tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/updatetask/${taskId}`,
        updatedData,
        { headers: getHeaders() }
      );

      setTasks(tasks.map((task) =>
        task._id === taskId ? response.data : task
      ));

      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(response.data);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/deletetask/${taskId}`,
        { headers: getHeaders() }
      );

      setTasks(tasks.filter((task) => task._id !== taskId));

      if (selectedTask && selectedTask._id === taskId) {
        setCurrentView('all-tasks');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simplified input change handler
  const handleInputChange = (field, value) => {
    setNewTask((prev) => ({
      ...prev,
      [field]: value
    }));
  };

const fetchTaskById = async (taskId) => {
  try {
    setLoading(true);
    setError(null);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/gettask/${taskId}`,
      { headers: getHeaders() }
    );
    setSelectedTask(response.data);
    // clear any editing flag at parent level if relevant
  } catch (err) {
    setError('Failed to fetch task details. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const searchTasks = async (filters = searchFilters) => {
    try {
      setIsSearching(true);
      setError(null);

      const params = new URLSearchParams();

      if(filters.query.trim()) {
        params.append('query', filters.query.trim());
      }
      if(filters.status) {
        params.append('status', filters.status);
      }
      if(filters.priority) {
        params.append('priority', filters.priority);
      }
      if(filters.assignee) {
        params.append('assignee', filters.assignee);
      }

      const queryString = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/search${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(url, { headers: getHeaders() });

      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Error searching tasks:', error);
      setError('Failed to search tasks. Please try again.');
      setTasks([]);
    } finally {
      setIsSearching(false);
    }
  }

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...searchFilters,
      [field]: value
    };
    setSearchFilters(newFilters);
    searchTasks(newFilters)
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: '',
      status: '',
      priority: '',
      assignee: ''
    };
    setSearchFilters(clearedFilters);
    fetchTasks();
  }

  const SearchAndFilterBar = () => (
  <div
    style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'end' }}>
      {/* Search Query */}
      {/* <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          Search Tasks
        </label>
        <input
          type="text"
          value={searchFilters.query}
          onChange={(e) => handleFilterChange('query', e.target.value)}
          placeholder="Search by title or description..."
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem'
          }}
        />
      </div> */}

      {/* Status Filter */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          Filter by Status
        </label>
        <select
          value={searchFilters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem'
          }}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Pending">Pending</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          Filter by Priority
        </label>
        <select
          value={searchFilters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem'
          }}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Assignee Filter */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          Filter by Assignee
        </label>
        <select
          value={searchFilters.assignee}
          onChange={(e) => handleFilterChange('assignee', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem'
          }}
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      <div>
        <button
          onClick={clearFilters}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'white',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>

    {/* Active Filters Display */}
    {(searchFilters.query || searchFilters.status || searchFilters.priority || searchFilters.assignee) && (
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
            Active Filters:
          </span>
          
          {searchFilters.query && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Search: "{searchFilters.query}"
              <button
                onClick={() => handleFilterChange('query', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ×
              </button>
            </span>
          )}

          {searchFilters.status && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Status: {searchFilters.status}
              <button
                onClick={() => handleFilterChange('status', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ×
              </button>
            </span>
          )}

          {searchFilters.priority && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#fefce8',
                color: '#a16207',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Priority: {searchFilters.priority.charAt(0).toUpperCase() + searchFilters.priority.slice(1)}
              <button
                onClick={() => handleFilterChange('priority', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a16207',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ×
              </button>
            </span>
          )}

          {searchFilters.assignee && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#f3e8ff',
                color: '#7c3aed',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Assignee: {searchFilters.assignee === 'unassigned' ? 'Unassigned' : getUserName(searchFilters.assignee)}
              <button
                onClick={() => handleFilterChange('assignee', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);

const uploadFile = async (taskId, file) => {
  if (!file) {
    setError('Please select a file to upload');
    return;
  }

  try {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/uploadfile/${taskId}`,
      formData,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Refresh task data to get updated file list
    await fetchTaskById(taskId);
    setSelectedFile(null);
    
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    setError('Failed to upload file. Please try again.');
  } finally {
    setIsUploading(false);
  }
};

// Delete file function
const deleteFile = async (taskId, fileId, fileName) => {
  if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
    return;
  }

  try {
    setLoading(true);
    setError(null);

    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/deletefile/${taskId}/${fileId}`,
      { headers: getHeaders() }
    );

    // Refresh task data to get updated file list
    await fetchTaskById(taskId);
    
  } catch (error) {
    console.error('Error deleting file:', error);
    setError('Failed to delete file. Please try again.');
  } finally {
    setLoading(false);
  }
};

const FileUploadSection = ({ task }) => (
  <div
    style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginTop: '2rem'
    }}
  >
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '1rem'
      }}
    >
      Attachments
    </h3>

    {/* File Upload Form */}
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'end'
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Upload File
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <button
          onClick={() => uploadFile(task._id, selectedFile)}
          disabled={!selectedFile || isUploading}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: selectedFile && !isUploading ? '#3b82f6' : '#9ca3af',
            color: 'white',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: selectedFile && !isUploading ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {selectedFile && (
        <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>

    {/* Files List */}
    <div>
      <h4
        style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '0.75rem'
        }}
      >
        Uploaded Files
      </h4>
      
      {task.files && task.files.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {task.files.map((file) => (
            <div
              key={file._id || file.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#f9fafb'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#6b7280'
                    }}
                  >
                    <i class="ri-file-line"></i>
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: 0
                      }}
                    >
                      {file.originalName || file.filename || 'Unknown File'}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0
                      }}
                    >
                      {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'} • 
                      Uploaded {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Date unknown'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Download button (if you have a download endpoint) */}
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                    title="Download file"
                  >
                    ⬇️
                  </a>
                )}
                
                {/* Delete button */}
                <button
                  onClick={() => deleteFile(task._id, file._id || file.id, file.originalName || file.filename)}
                  disabled={loading}
                  style={{
                    padding: '0.5rem',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                  title="Delete file"
                >
                  <i class="ri-delete-bin-3-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6b7280',
            border: '2px dashed #e5e7eb',
            borderRadius: '6px'
          }}
        >
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            No files uploaded yet
          </p>
        </div>
      )}
    </div>
  </div>
);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-50';
      case 'Open':
        return 'text-blue-600 bg-blue-50';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'On Hold':
        return 'text-gray-600 bg-gray-50';
      case 'Cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Error Alert Component
  const ErrorAlert = () =>
    error ? (
      <div
        style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          color: '#dc2626'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠️</span>
          <span style={{ fontSize: '0.875rem' }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      </div>
    ) : null;

// const TaskDetails = ({ task }) => {

// };

  // All Tasks List Component
const AllTasksList = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}
        >
          All Tasks
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Manage all your tasks in one place.
        </p>
      </div>

      <ErrorAlert />

      {/* Add the Search and Filter Bar */}
      <SearchAndFilterBar />

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setCurrentView('new-task')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.55rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i class="ri-add-line"></i> New Task
            </button>

             <button
              onClick={() => setCurrentView('calendar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i class="ri-calendar-line"></i> Calendar
            </button>

             <button
              onClick={() => setCurrentView('reports')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i class="ri-bar-chart-line"></i> Reports
            </button>
            
            {/* Show loading indicator when searching */}
            {isSearching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                <span style={{ fontSize: '0.875rem' }}>Searching...</span>
              </div>
            )}
          </div>
          
          {/* Results Count */}
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              {isSearching ? 'Searching...' : 'No tasks found'}
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              {(searchFilters.query || searchFilters.status || searchFilters.priority || searchFilters.assignee) 
                ? 'Try adjusting your search filters' 
                : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Task
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Due Date
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Priority
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Assignee
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        color: '#1f2937',
                        fontWeight: '500'
                      }}
                    >
                      {task.title}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'No due date'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px'
                        }}
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px'
                        }}
                        className={getStatusColor(task.status)}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {task.assignee
                        ? typeof task.assignee === 'string'
                          ? getUserName(task.assignee)
                          : task.assignee.name
                        : 'Unassigned'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            fetchTaskById(task._id);
                            setCurrentView('task-details');
                          }}
                          style={{
                            padding: '0.5rem',
                            color: '#3b82f6',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '1rem'
                          }}
                          title="View Details"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          disabled={loading}
                          style={{
                            padding: '0.5rem',
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            fontSize: '1rem'
                          }}
                          title="Delete Task"
                        >
                          <i className="ri-delete-bin-3-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
);

  // Main render logic
  if (loading && tasks.length === 0 && currentView === 'all-tasks') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}
          />
          <p style={{ color: '#6b7280' }}>Loading tasks...</p>
        </div>
      </div>
    );
  }

  switch (currentView) {
    case 'new-task':
       return (
        <NewTaskForm
          newTask={newTask}
          loading={loading}
          users={users}
          handleInputChange={handleInputChange}
          createTask={createTask}
          setCurrentView={setCurrentView}
          error={error}
          ErrorAlert={ErrorAlert}
        />
      );
    case 'task-details':
  return selectedTask ? (
    <TaskDetails
      task={selectedTask}
      users={users}
      onBack={() => {
        setCurrentView('all-tasks');
        setSelectedTask(null);
      }}
      onTaskUpdate={(updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );
        setSelectedTask(updatedTask);
      }}
      onTaskDelete={(deletedTaskId) => {
        setTasks((prev) => prev.filter((t) => t._id !== deletedTaskId));
        setCurrentView('all-tasks');
        setSelectedTask(null);
      }}
      loading={loading}
      setLoading={setLoading}
      error={error}
      setError={setError}
    />
  ) : (
    <AllTasksList />
  );

case 'calendar':
  return (
    <Calendar
      tasks={tasks}             
      users={users}
      onBack={() => setCurrentView('all-tasks')}
      onTaskClick={(task) => {
        setSelectedTask(task);
        setCurrentView('task-details');
      }}
      onTaskCreated={(createdTask) => {
        console.log('Parent received new task:', createdTask);
        setTasks(prev => [...prev, createdTask]);
      }}
    />
  );
    case 'reports':
      return (
        <Reports
          tasks={tasks}
          users={users}
          onBack={() => setCurrentView('all-tasks')}
        />
      );
  default:
    return <AllTasksList />;
}
};

export default TaskManager;
