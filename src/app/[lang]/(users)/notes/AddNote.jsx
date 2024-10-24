'use client'

import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import axios from 'axios';

function AddNote() {
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState([{ content: '' }]);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:8000/api/notes/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };


    const [formData, setFormData] = useState('')
    const handleInputChange = (event) => {
        setFormData(event.target.value);
    };
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token')
            // Example API call to submit the form
            const response = await fetch('http://localhost:8000/api/notes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: formData })
            })
            const data = await response.json()
            console.log(data);

            setNotes([...notes, data]);
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`http://localhost:8000/api/notes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotes(notes.filter(note => note._id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleUpdate = async (id, newContent) => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.put(`http://localhost:8000/api/notes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }, { content: newContent });
            const updatedNotes = notes.map(note => note._id === id ? response.data : note);
            setNotes(updatedNotes);
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <TextField
                label="Add Note"
                variant="outlined"
                value={formData}
                onChange={handleInputChange}
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                Add Note
            </Button>
            <List>
                {notes?.map((item) => (
                    <ListItem
                        key={item._id}
                        secondaryAction={
                            <>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item._id)}>
                                    delete
                                </IconButton>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleUpdate(item._id, note)}>
                                    edit
                                </IconButton>
                            </>
                        }
                    >
                        <ListItemText primary={item.content} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default AddNote;
