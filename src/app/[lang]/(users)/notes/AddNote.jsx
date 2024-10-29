'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, Box, List, ListItem, ListItemText, IconButton, Fab, Dialog, DialogContent, DialogActions, Snackbar, CircularProgress } from '@mui/material';
import axios from 'axios';
import debounce from 'lodash.debounce';

function AddNote() {
    const [formData, setFormData] = useState('');
    const [notes, setNotes] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData('');
        setEditId(null);
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
<<<<<<< HEAD
            const response = await axios.get('https://app.canbridge.in/api/notes/', {
=======
            const response = await axios.get('http://13.127.160.185:8000/api/notes/', {
>>>>>>> production
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(response.data);
        } catch (error) {
            showSnackbar('Error fetching notes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        debouncedSetFormData(value);
    };

    const debouncedSetFormData = useCallback(debounce((value) => setFormData(value), 10), []);

    const handleSubmit = async () => {
        if (!formData.trim()) {
            showSnackbar('Note content cannot be empty', 'warning');
            return;
        }
        try {
            const token = localStorage.getItem('token');
<<<<<<< HEAD
            const url = editId ? `https://app.canbridge.in/api/notes/${editId}` : 'https://app.canbridge.in/api/notes/';
=======
            const url = editId ? `http://13.127.160.185:8000/api/notes/${editId}` : 'http://13.127.160.185:8000/api/notes/';
>>>>>>> production
            const method = editId ? 'put' : 'post';

            const response = await axios[method](url, { content: formData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(editId ? notes.map(note => (note._id === editId ? response.data : note)) : [...notes, response.data]);
            showSnackbar(editId ? 'Note updated' : 'Note added', 'success');
            handleClose();
        } catch (error) {
            showSnackbar('Error saving note', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
<<<<<<< HEAD
            await axios.delete(`https://app.canbridge.in/api/notes/${id}`, {
=======
            await axios.delete(`http://13.127.160.185:8000/api/notes/${id}`, {
>>>>>>> production
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.filter(note => note._id !== id));
            showSnackbar('Note deleted', 'success');
        } catch (error) {
            showSnackbar('Error deleting note', 'error');
        }
    };

    const handleDoubleClick = (note) => {
        setEditId(note._id);
        setFormData(note.content);
        setOpen(true);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <>
            <Box sx={{ width: '100%', maxWidth: 360, position: 'relative' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {notes.map((item) => (
                            <ListItem
                                key={item._id}
                                style={{ marginBottom: '12px', backgroundColor: '#f8f8ba', borderRadius: '5px', cursor: 'pointer' }}
                                onDoubleClick={() => handleDoubleClick(item)}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item._id)}>
                                        <i className="ri-close-line"></i>
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={<span style={{ whiteSpace: 'pre-line' }}>{item.content}</span>}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            <Fab
                onClick={handleClickOpen}
                style={{ position: 'fixed', bottom: '10%', right: '10%' }}
                aria-label="add"
            >
                <i className="ri-add-line" />
            </Fab>

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth>
                <DialogContent>
                    <TextField
                        value={formData}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={4}
                        label={editId ? "Edit Note" : "Add Note"}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editId ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    );
}

export default AddNote;
