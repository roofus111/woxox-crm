'use client'

import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function AddNote() {
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState([]);

    const handleInputChange = (event) => {
        setNote(event.target.value);
    };

    const handleSubmit = () => {
        if (note) { // Check if the note is not empty
            setNotes([...notes, note]); // Add the new note to the existing notes array
            setNote(''); // Clear the input after submission
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                '& > :not(style)': { m: 1 },
            }}
        >
            <TextField
                multiline
                label="Add Note"
                variant="outlined"
                value={note}
                onChange={handleInputChange}
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                Add Note
            </Button>
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {notes.map((item, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={item} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default AddNote;
