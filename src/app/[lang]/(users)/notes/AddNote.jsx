'use client'

import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import axios from 'axios';
import Fab from '@mui/material/Fab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'


function AddNote() {
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState([{ content: '' }]);
    const [open, setOpen] = useState(false)

    const handleClickOpen = () => setOpen(true)

    const handleClose = () => setOpen(false)

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
            handleClose()
            setFormData('')
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
        <><Box sx={{ width: '100%', maxWidth: 360 }}>
            {/* <Box display={'flex'}>
        <TextField
            margin='20px'
            label="Add Note"
            variant="outlined"
            value={formData}
            onChange={handleInputChange}
            fullWidth
        />
        <Button margin='2' size='small' variant="contained" color="primary" onClick={handleSubmit}>
            Add
        </Button>
        </Box> */}
            <List>
                {notes?.map((item) => (
                    <ListItem
                        style={{ marginBottom: '12px', backgroundColor: '#f8f8ba', borderRadius: '5px' }}
                        key={item._id}
                        secondaryAction={<>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item._id)}>
                                <i class="ri-close-line"></i>
                            </IconButton>
                        </>}
                    >
                        <ListItemText primary={item.content} />
                    </ListItem>
                ))}
            </List>
        </Box><Fab onClick={handleClickOpen} style={{ position: 'fixed', bottom: '10%', right: '10%' }} aria-label='edit'>
                <i className='ri-add-line' />
            </Fab>
            <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title' fullWidth>
                <DialogContent>
                    <TextField value={formData}
                        fullWidth
                        rows={4}
                        multiline
                        id='textarea-outlined-static'
                        onChange={handleInputChange} autoFocus type='email' label='Add Notes' />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined' color='secondary' >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant='contained'>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>


        </>
    );
}

export default AddNote;
