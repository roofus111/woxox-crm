// components/CategoryManagement.jsx
"use client";

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

export default function CategoryManagement({ categories, setCategories }) {
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = () => {
        const trimmed = newCategory.trim();
        if (trimmed && !categories.includes(trimmed)) {
            setCategories([...categories, trimmed]);
            setNewCategory('');
        }
    };

    return (
        <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>
                Category Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                    label="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    size="small"
                />
                <Button variant="contained" sx={{ ml: 2 }} onClick={handleAddCategory}>
                    Add
                </Button>
            </Box>
            <List dense>
                {categories.map((cat) => (
                    <ListItem key={cat}>
                        <ListItemText primary={cat} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}