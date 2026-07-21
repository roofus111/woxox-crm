import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotesComponent = ({ 
  taskId, 
  users = [], 
  error, 
  setError 
}) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

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

    const getUserName = (creator) => {
    if (!creator) return 'Unknown User';
    if (typeof creator === 'object') {
        return creator.name || 'Unknown User';
    }
    const user = users.find((u) => u._id === creator);
    return user ? user.name : 'Unknown User';
    };

    const fetchNotes = async (taskId) => {
    try {
        setIsLoadingNotes(true);
        const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/notes/${taskId}`,
        { headers: getHeaders() }
        );
        const data = response.data || [];
        // Normalize as needed:
        const normalized = data.map(raw => ({
        _id: raw._id || raw.id,
        content: typeof raw.content === 'string' ? raw.content : '',
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy,
        updatedBy: raw.updatedBy,
        }));
        console.log('Fetched notes:', normalized);
        setNotes(normalized);
    } catch (error) {
        console.error('Error fetching notes:', error);
        setError('Failed to load notes. Please try again.');
    } finally {
        setIsLoadingNotes(false);
    }
    };

    const addNote = async (taskId, content) => {
    if (!content.trim()) {
        setError('Please enter a note');
        return;
    }
    try {
        setIsAddingNote(true);
        setError(null);
        const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/notes/${taskId}`,
        { content: content.trim() },
        { headers: getHeaders() }
        );
        const newNote = response.data.note || response.data;
        console.log('Added note:', newNote);
        setNotes(prev => [...prev, newNote]);
        setNewNote('');
    } catch (error) {
        console.error('Error adding note:', error);
        setError('Failed to add note. Please try again.');
    } finally {
        setIsAddingNote(false);
    }
    };

    const updateNote = async (taskId, noteId, content) => {
    if (!(typeof content === 'string' && content.trim())) {
        setError('Note content cannot be empty');
        return;
    }
    try {
        setError(null);
        const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/notes/${taskId}/${noteId}`,
        { content: content.trim() },
        { headers: getHeaders() }
        );
        console.log('PUT response data:', response.data);
        const raw = response.data.note || response.data;
        const updatedNote = {
        _id: raw._id || raw.id,
        content: typeof raw.content === 'string' ? raw.content : '',
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy,
        updatedBy: raw.updatedBy,
        // include any other fields your UI displays
        };
        if (updatedNote._id) {
        setNotes(prev => prev.map(n => (n._id === noteId ? updatedNote : n)));
        // exit edit mode:
        setEditingNoteId(null);
        setEditingNoteContent('');
        } else {
        // If no _id in response, fallback to refetch:
        console.warn('updateNote: updatedNote._id missing, refetching all notes');
        await fetchNotes(taskId);
        }
    } catch (error) {
        console.error('Error updating note:', error);
        setError('Failed to update note. Please try again.');
    }
    };

  const deleteNote = async (taskId, noteId) => {
    try {
      setError(null);
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/notes/${taskId}/${noteId}`,
        { headers: getHeaders() }
      );

      setNotes(prev => prev.filter(note => note._id !== noteId));
      
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note. Please try again.');
    }
  };

    const startEditingNote = (note) => {
    setEditingNoteId(note._id);
    setEditingNoteContent(typeof note.content === 'string' ? note.content : '');
    };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  useEffect(() => {
    if (taskId) {
      fetchNotes(taskId);
    }
  }, [taskId]);

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
        Notes
      </h3>

      {/* Add Note Form */}
      <div
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
            Add Note
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note..."
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
            onClick={() => addNote(taskId, newNote)}
            disabled={isAddingNote || !newNote.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: newNote.trim() && !isAddingNote ? '#3b82f6' : '#9ca3af',
              color: 'white',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              cursor: newNote.trim() && !isAddingNote ? 'pointer' : 'not-allowed'
            }}
          >
            {isAddingNote ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div>
        <h4
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.75rem'
          }}
        >
          All Notes
        </h4>
        
        {isLoadingNotes ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}
          >
            Loading notes...
          </div>
        ) : notes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notes.map((note) => (
              <div
                key={note._id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        {getUserName(note.createdBy).charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}
                      >
                        {getUserName(note.createdBy)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}
                      >
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                      </span>
                      {note.updatedAt && note.updatedAt !== note.createdAt && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontStyle: 'italic'
                          }}
                        >
                          (edited)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => startEditingNote(note)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        color: '#3b82f6',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                      title="Edit note"
                    >
                      <i class="ri-pencil-line"></i>
                    </button>
                    <button
                      onClick={() => deleteNote(taskId, note._id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                      title="Delete note"
                    >
                      <i class="ri-delete-bin-3-line"></i>
                    </button>
                  </div>
                </div>
                
                {editingNoteId === note._id ? (
                  <div>
                    <textarea
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => updateNote(taskId, note._id, editingNoteContent)}
                        disabled={!editingNoteContent.trim()}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: editingNoteContent.trim() ? '#10b981' : '#9ca3af',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: 'none',
                          cursor: editingNoteContent.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingNote}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {note.content}
                  </div>
                )}
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
              No notes added yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesComponent;