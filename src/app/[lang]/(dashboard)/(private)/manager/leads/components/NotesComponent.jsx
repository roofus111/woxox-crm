'use client'

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { useSession } from 'next-auth/react';

const NotesComponent = ({ leadId, onNoteAdded }) => {
    const [activeTab, setActiveTab] = useState('notes');
    const [noteText, setNoteText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [editText, setEditText] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
    const { data: session } = useSession();

    useEffect(() => {
        if (leadId && /^[0-9a-fA-F]{24}$/.test(leadId)) {
            fetchNotes();
        } else {
            console.warn('Invalid or missing leadId:', leadId);
            setNotes([]);
        }
    }, [leadId]);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Extract notes from the lead response
            if (response.data && response.data.lead && Array.isArray(response.data.lead.notes)) {
                const leadNotes = response.data.lead.notes;

                // Validate notes have proper _id
                const filtered = leadNotes.filter(
                    (n) => typeof n._id === 'string' && /^[0-9a-fA-F]{24}$/.test(n._id)
                );

                // Sort notes by timestamp (newest first)
                const sortedNotes = filtered.sort((a, b) => {
                    const timestampA = new Date(a.timestamp || a.createdAt || 0);
                    const timestampB = new Date(b.timestamp || b.createdAt || 0);
                    return timestampB - timestampA;
                });

                setNotes(sortedNotes);
            } else {
                console.warn('No notes found in lead response:', response.data);
                setNotes([]);
            }
        } catch (error) {
            console.error('Error fetching lead details/notes:', error);
            showSnackbar('Error fetching notes', 'error');
            setNotes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Direct input handlers for smooth typing
    const handleInputChange = (e) => {
        setNoteText(e.target.value);
    };

    const handleEditInputChange = (e) => {
        setEditText(e.target.value);
    };

    const handleSubmit = async () => {
        if (!noteText.trim()) {
            showSnackbar('Note content cannot be empty', 'warning');
            return;
        }

        if (!leadId || !/^[0-9a-fA-F]{24}$/.test(leadId)) {
            showSnackbar('Invalid lead ID', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // Get author name from multiple possible sources
            let authorName = 'Unknown';

            if (session?.user?.name) {
                authorName = session.user.name;
            } else if (session?.user?.firstName && session?.user?.lastName) {
                authorName = `${session.user.firstName} ${session.user.lastName}`;
            } else if (session?.user?.firstName) {
                authorName = session.user.firstName;
            } else if (session?.user?.email) {
                // Use email as fallback, extract name part before @
                authorName = session.user.email.split('@')[0];
            }

            // Debug logging
            console.log('Session data:', session);
            console.log('Author name resolved to:', authorName);

            // Prepare the new note payload
            const payload = {
                content: noteText.trim(),
                author: authorName,
                timestamp: new Date().toISOString(),
            };

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/notes/${leadId}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Refresh notes after adding
            await fetchNotes();
            setNoteText('');
            showSnackbar('Note added successfully', 'success');

            if (onNoteAdded) {
                onNoteAdded({ content: noteText.trim(), author: payload.author });
            }

        } catch (error) {
            console.error('Error adding note:', error);
            showSnackbar('Error adding note', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (noteId) => {
        if (!editText.trim()) {
            showSnackbar('Note content cannot be empty', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // For updating notes, you might need a different endpoint
            // This is a placeholder - adjust based on your actual API
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/notes/${leadId}/${noteId}`,
                { content: editText.trim() },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Refresh notes after updating
            await fetchNotes();
            setEditingNote(null);
            setEditText('');
            showSnackbar('Note updated successfully', 'success');

        } catch (error) {
            console.error('Error updating note:', error);
            showSnackbar('Error updating note', 'error');
        }
    };

    const handleDelete = async (noteId) => {
        try {
            const token = localStorage.getItem('token');

            // For deleting notes, you might need a different endpoint
            // This is a placeholder - adjust based on your actual API
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/notes/${leadId}/${noteId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Refresh notes after deleting
            await fetchNotes();
            showSnackbar('Note deleted successfully', 'success');

        } catch (error) {
            console.error('Error deleting note:', error);
            showSnackbar('Error deleting note', 'error');
        }
    };

    const startEdit = (note) => {
        setEditingNote(note._id);
        setEditText(note.content);
    };

    const cancelEdit = () => {
        setEditingNote(null);
        setEditText('');
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
        setTimeout(() => {
            setSnackbar(prev => ({ ...prev, open: false }));
        }, 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-slate-100 min-h-full">
            {/* Snackbar Notification */}
            {snackbar.open && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${snackbar.severity === 'success' ? 'bg-green-500 text-white' :
                    snackbar.severity === 'error' ? 'bg-red-500 text-white' :
                        snackbar.severity === 'warning' ? 'bg-yellow-500 text-black' :
                            'bg-blue-500 text-white'
                    }`}>
                    {snackbar.message}
                </div>
            )}

            {/* Notes Section */}
            {activeTab === 'notes' && (
                <>
                    {/* Add New Note */}
                    <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-0 max-w-4xl mx-auto">
                        <textarea
                            value={noteText}
                            onChange={handleInputChange}
                            placeholder="Enter the Notes.."
                            rows={8}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-700 text-base leading-relaxed placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-colors duration-200 resize-none"
                            disabled={isSubmitting}
                        />

                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleSubmit}
                                disabled={!noteText.trim() || isSubmitting}
                                className="bg-indigo-500 text-white px-8 py-2 text-base font-semibold rounded-xl shadow-lg hover:bg-indigo-600 hover:shadow-xl disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none transition-all duration-200 flex items-center gap-2 cursor-pointer"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                )}
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    {/* Existing Notes */}
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : notes.length > 0 ? (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-0 max-w-4xl mx-auto">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                Previous Notes ({notes.length})
                            </h3>

                            {notes.map((note, index) => (
                                <div key={note._id}>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 relative">
                                        {editingNote === note._id ? (
                                            // Edit Mode
                                            <div className="space-y-4">
                                                <textarea
                                                    value={editText}
                                                    onChange={handleEditInputChange}
                                                    rows={4}
                                                    className="w-full p-3 border-2 border-indigo-300 rounded-lg text-gray-700 focus:border-indigo-500 focus:outline-none resize-none"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate(note._id)}
                                                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <>
                                                <p className="text-gray-700 mb-3 leading-relaxed whitespace-pre-line">
                                                    {note.content}
                                                </p>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600 font-medium">
                                                            {note.author || note.createdBy || 'Unknown User'}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(note.timestamp || note.createdAt || note.updatedAt)}
                                                        </span>
                                                    </div>

                                                    {/* <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEdit(note)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Edit note"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(note._id)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Delete note"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div> */}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {index < notes.length - 1 && (
                                        <hr className="border-gray-200 opacity-50 my-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-0 max-w-4xl mx-auto">
                            <div className="text-center py-8">
                                <p className="text-gray-400 text-lg">
                                    No notes added yet. Add your first note above!
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NotesComponent;