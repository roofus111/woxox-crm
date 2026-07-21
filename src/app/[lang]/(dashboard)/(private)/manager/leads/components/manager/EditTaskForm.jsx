import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewTaskForm from './NewTaskForm';

const EditTaskForm = ({ 
  editFields, 
  loading, 
  users, 
  handleEditChange, 
  handleSave, 
  handleCancel, 
  error, 
  ErrorAlert 
}) => {

    const isTitleEmpty = !(editFields.title || '').trim().length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 
            style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}
          >
            Edit Task
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Update task details and information.
          </p>
        </div>

        <ErrorAlert />

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Task Title */}
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
                Task Title *
              </label>
              <input
                type="text"
                value={editFields.title}
                onChange={(e) => handleEditChange('title', e.target.value)}
                placeholder="Enter task title"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
                autoComplete="off"
              />
              {(editFields.title || '').trim().length === 0 && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}
                >
                  Title is required
                </p>
              )}
            </div>

            {/* Task Description */}
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
                Description
              </label>
              <textarea
                value={editFields.description}
                onChange={(e) => handleEditChange('description', e.target.value)}
                placeholder="Enter task description"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Grid for smaller fields */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {/* Assignee */}
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
                  Assign To
                </label>
                <select
                  value={editFields.assignee}
                  onChange={(e) => handleEditChange('assignee', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Select assignee</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
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
                  Due Date
                </label>
                <input
                  type="date"
                  value={editFields.dueDate}
                  onChange={(e) => handleEditChange('dueDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Priority */}
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
                  Priority
                </label>
                <select
                  value={editFields.priority}
                  onChange={(e) => handleEditChange('priority', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Status */}
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
                  Status
                </label>
                <select
                  value={editFields.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            <button
            onClick={handleSave}
            disabled={loading || !(editFields.title || '').trim().length}
            style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: 
                loading || !(editFields.title || '').trim().length
                    ? '#9ca3af'
                    : '#10b981',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor:
                loading || !(editFields.title || '').trim().length
                    ? 'not-allowed'
                    : 'pointer'
            }}
            >
            {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskForm;