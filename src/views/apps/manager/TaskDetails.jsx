import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NotesComponent from './NotesComponent';

const TaskDetails = ({ 
  task, 
  users = [], 
  onBack, 
  onTaskUpdate, 
  onTaskDelete,
  loading,
  setLoading,
  error,
  setError
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    status: 'Open'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const titleRef = useRef(null);
  const hasAutoFocused = useRef(false);

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

    const refreshTask = async () => {
    try {
      setLoading(true);
      const fullRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/gettask/${task._id}`,
        { headers: getHeaders() }
      );
      onTaskUpdate(fullRes.data);
    } catch (err) {
      console.error('Error refreshing task:', err);
      setError('Failed to refresh task after note change.');
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

      if (onTaskUpdate) {
        onTaskUpdate(response.data);
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

      if (onTaskDelete) {
        onTaskDelete(taskId);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

    // POST to upload; response may only include file info
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/uploadfile/${taskId}`,
      formData,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Now fetch the full updated task
    const fullRes = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/gettask/${taskId}`,
      { headers: getHeaders() }
    );
    if (onTaskUpdate) {
      onTaskUpdate(fullRes.data);
    }

    setSelectedFile(null);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  } catch (error) {
    console.error('Error uploading file:', error);
    setError('Failed to upload file. Please try again.');
  } finally {
    setIsUploading(false);
  }
};

  const deleteFile = async (taskId, fileId, fileName) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/deletefile/${taskId}/${fileId}`,
        { headers: getHeaders() }
      );

      // Refresh task data
      if (onTaskUpdate) {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/gettask/${taskId}`,
          { headers: getHeaders() }
        );
        onTaskUpdate(response.data);
      }
      
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditFields({
      title: task.title || '',
      description: task.description || '',
      assignee:
        typeof task.assignee === 'string'
          ? task.assignee
          : task.assignee?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'medium',
      status: task.status || 'Open'
    });
    setIsEditing(true);
  };

  const handleEditChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateTask(task._id, editFields);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    hasAutoFocused.current = false;
  };

  useEffect(() => {
    if (isEditing && !hasAutoFocused.current && titleRef.current) {
      titleRef.current.focus();
      hasAutoFocused.current = true;
    }
  }, [isEditing]);

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

const FileUploadSection = ({ task }) => {
    // Helper function to check if file is an image
    const isImageFile = (file) => {
      return file && file.type && file.type.startsWith('image/');
    };

    // Helper function to create preview URL
    const createPreviewUrl = (file) => {
      return URL.createObjectURL(file);
    };

    return (
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
          
          {/* File Info and Image Preview */}
          {selectedFile && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              
              {/* Image Preview */}
              {isImageFile(selectedFile) && (
                <div
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.75rem'
                    }}
                  >
                    Preview:
                  </p>
                  <img
                    src={createPreviewUrl(selectedFile)}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                </div>
              )}
            </div>
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
                        <i class="ri-image-line"></i>
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
                    {/* Download button */}
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
                      <i className="ri-delete-bin-3-line text-red-500"></i>
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
  };

return (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
      }}
    >
      {/* Main Content */}
      <div>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.5rem'
              }}
            >
              <button
                onClick={() => {
                  onBack();
                  setIsEditing(false);
                }}
                style={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ← Back to Tasks
              </button>
            </div>

            {isEditing ? (
              <div style={{ marginBottom: '1rem' }}>
                <label>Task Name *</label>
                <input
                  ref={titleRef}
                  type="text"
                  value={editFields.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  placeholder="Enter task name"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}
                >
                  {editFields.title.trim().length === 0 && 'Title is required'}
                </p>
              </div>
            ) : (
              <>
                <h1
                  style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}
                >
                  {task.title}
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Due:{' '}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : 'No due date'}
                </p>
              </>
            )}
          </div>

          <ErrorAlert />

          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem'
              }}
            >
              Description
            </h2>
            {isEditing ? (
              <textarea
                value={editFields.description}
                onChange={(e) => handleEditChange('description', e.target.value)}
                placeholder="Enter task description"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            ) : (
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem'
              }}
            >
              Details
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Status</span>
                {isEditing ? (
                  <select
                    value={editFields.status}
                    onChange={(e) => handleEditChange('status', e.target.value)}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}
                    className={getStatusColor(task.status)}
                  >
                    {task.status}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Priority</span>
                {isEditing ? (
                  <select
                    value={editFields.priority}
                    onChange={(e) => handleEditChange('priority', e.target.value)}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span
                    className={getPriorityColor(task.priority || 'medium')}
                  >
                    {task.priority
                      ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                      : 'Medium'}
                  </span>
                )}
              </div>

              {/* Due Date */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Due Date</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={editFields.dueDate}
                    onChange={(e) => handleEditChange('dueDate', e.target.value)}
                    style={{
                      fontSize: '0.875rem',
                      color: '#1f2937',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : 'No due date'}
                  </span>
                )}
              </div>

              {/* Assignee */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Assigned To</span>
                {isEditing ? (
                  <select
                    value={editFields.assignee}
                    onChange={(e) => handleEditChange('assignee', e.target.value)}
                    style={{
                      fontSize: '0.875rem',
                      color: '#1f2937',
                      padding: '0.25rem',
                      borderRadius: '4px',      
                      border: '1px solid #d1d5db'
                    }}
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                    {task.assignee
                      ? typeof task.assignee === 'string'
                        ? getUserName(task.assignee)
                        : task.assignee.name
                      : 'Unassigned'}
                  </span>
                )}
              </div>

              {/* Created At */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Created</span>
                <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}
          >
            Activity
          </h2>
          
          {/* Activity Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {task.activityLog && task.activityLog.length > 0 ? (
              task.activityLog.map((activity, index) => {
                const user = users.find(u => u._id === activity.performedBy);
                const userName = user ? user.name : 'Unknown User';
                const activityDate = new Date(activity.performedAt);
                
                let activityText = '';
                let activityIcon = '';
                
                switch (activity.action) {
                  case 'created':
                    activityText = 'created this task';
                    break;
                  case 'updated':
                    activityText = 'updated this task';
                    break;
                  case 'status_changed':
                    activityText = `changed status to ${activity.referenceData?.newStatus || 'unknown'}`;
                    break;
                  case 'assigned':
                    const assigneeName = activity.referenceData?.assigneeName || 
                      (activity.referenceData?.initialAssignee ? getUserName(activity.referenceData.initialAssignee) : 'someone');
                    activityText = `assigned this task to ${assigneeName}`;
                    break;
                  case 'completed':
                    activityText = 'marked this task as completed';
                    break;
                  case 'commented':
                    activityText = 'added a comment';
                    break;
                  default:
                    activityText = activity.action;
                }

                return (
                  <div
                    key={activity._id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1rem',
                      backgroundColor: activity.action === 'commented' ? '#f0f9ff' : '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {/* User Avatar */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: activity.action === 'commented' ? '#0ea5e9' : '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        flexShrink: 0
                      }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Activity Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}
                        >
                          {userName}
                        </span>
                        <span style={{ fontSize: '1rem' }}>{activityIcon}</span>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: '#4b5563'
                          }}
                        >
                          {activityText}
                        </span>
                      </div>
                      
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: activity.action === 'commented' && activity.referenceData?.comment ? '0.75rem' : 0
                        }}
                      >
                        <span>
                          {activityDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {/* Show comment content */}
                      {activity.action === 'commented' && activity.referenceData?.comment && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#374151',
                            backgroundColor: 'white',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            marginTop: '0.5rem',
                            lineHeight: '1.5'
                          }}
                        >
                          {activity.referenceData.comment}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
              
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '2px dashed #e2e8f0'
                }}
              >
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
                No activity recorded yet
              </div>
            )}
          </div>
        </div>
                  {/* Add Comment Section */}
          {/* <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}
              >
                Add Comment
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => addComment(task._id, newComment)}
                disabled={isAddingComment || !newComment.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: newComment.trim() && !isAddingComment ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: newComment.trim() && !isAddingComment ? 'pointer' : 'not-allowed'
                }}
              >
                {isAddingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div> */}
        </div>
        
        {/* File Upload Section - Now at bottom */}
        {!isEditing && (
          <NotesComponent
            taskId={task._id}
            users={users}
            error={error}
            setError={setNotesError}
            onNoteAction={refreshTask}
          />
        )}

        {!isEditing && <FileUploadSection task={task} />}
      </div>

      {/* Right Sidebar - Task Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}
          >
            Task Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading || editFields.title.trim().length === 0}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    opacity:
                      loading || editFields.title.trim().length === 0 ? 0.5 : 1,
                    cursor:
                      loading || editFields.title.trim().length === 0
                        ? 'not-allowed'
                        : 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => updateTask(task._id, { ...task, status: 'Completed' })}
                  disabled={loading || task.status === 'Completed'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor:
                      task.status === 'Completed' ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor:
                      loading || task.status === 'Completed'
                        ? 'not-allowed'
                        : 'pointer'
                  }}
                >
                  {task.status === 'Completed'
                    ? 'Already Completed'
                    : 'Mark as Complete'}
                </button>

                <button
                  onClick={startEditing}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Edit Task
                </button>

                <button
                  onClick={() => deleteTask(task._id)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#ef4444',
                    backgroundColor: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete Task'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default TaskDetails;