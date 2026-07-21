'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Grid,
    Typography,
    Chip,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Alert,
    CircularProgress,
} from '@mui/material';

const AddCustomerForm = ({ companyId, userId, onSuccess }) => {
    const [formData, setFormData] = useState({
        company: companyId || '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        qualification: '',
        occupation: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
        },
        dateOfBirth: '',
        gender: '',
        status: 'Active',
        notes: '',
        tags: [],
        createdBy: userId || '',
        updatedBy: userId || '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [tagsError, setTagsError] = useState('');
    const [tagsMenuOpen, setTagsMenuOpen] = useState(false);

    // Fetch tags from API
    const fetchTags = async () => {
        setTagsLoading(true);
        setTagsError('');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/alltags`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAvailableTags(response.data.tags || response.data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
            setTagsError('Failed to load tags');
            setAvailableTags([]);
        } finally {
            setTagsLoading(false);
        }
    };

    // Fetch tags on component mount
    useEffect(() => {
        fetchTags();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('address.')) {
            const addressField = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleTagsChange = (event) => {
        const value = event.target.value;
        setFormData((prev) => ({
            ...prev,
            tags: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleRemoveTag = async (event, tagIdToRemove) => {
        event.stopPropagation(); 
        const token = localStorage.getItem('token');
        try {
            setFormData((prev) => ({
                ...prev,
                tags: prev.tags.filter(tagId => tagId !== tagIdToRemove)
            }));

            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/delete/${tagIdToRemove}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await fetchTags();
            
        } catch (error) {
            console.error('Error deleting tag:', error);
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, tagIdToRemove]
            }));
            setError('Failed to delete tag');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');

        try {
            if (!formData.lastName || !formData.phone) {
                throw new Error('Last name and phone are required fields');
            }

            const {
                firstName,
                lastName,
                email,
                phone,
                qualification,
                occupation,
                address,
                dateOfBirth,
                gender,
                status,
                notes,
                tags
            } = formData;
            
            const customerData = {
                firstName: firstName || undefined,
                lastName,
                email: email || undefined,
                phone,
                qualification: qualification || undefined,
                occupation: occupation || undefined,
                dateOfBirth: dateOfBirth || undefined,
                gender: gender || undefined,
                status,
                notes: notes || undefined,
                tags,
                // filter out any empty address fields:
                address: Object.fromEntries(
                    Object.entries(address).filter(([_, v]) => v !== '')
                )
            };

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/createcustomer`, customerData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Customer created:', response.data);
            
            // Call success callback if provided (this will close the dialog and update the list)
            if (onSuccess) {
                onSuccess(response.data);
            }

            // Show temporary success message
            setSuccess('Customer created successfully!');

            // Reset form
            setFormData({
                company: companyId || '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                qualification: '',
                occupation: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                },
                dateOfBirth: '',
                gender: '',
                status: 'Active',
                notes: '',
                tags: [],
                createdBy: userId || '',
                updatedBy: userId || '',
            });

        } catch (error) {
            console.error('Error creating customer:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 600,
                margin: 'auto',
                padding: 3
            }}
        >
            <Typography variant="h5" gutterBottom>
                Add Customer
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {tagsError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {tagsError}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            inputProps={{ maxLength: 50 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            inputProps={{ maxLength: 50 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Qualification"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Occupation"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Street"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="City"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="State"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Postal Code"
                            name="address.postalCode"
                            value={formData.address.postalCode}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Date of Birth"
                            name="dateOfBirth"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Tags</InputLabel>
                            <Select
                                multiple
                                open={tagsMenuOpen}
                                onOpen={() => setTagsMenuOpen(true)}
                                onClose={() => setTagsMenuOpen(false)}
                                value={formData.tags}
                                onChange={(e) => {
                                    handleTagsChange(e);
                                    setTagsMenuOpen(false);
                                }}
                                input={<OutlinedInput label="Tags" />}
                                disabled={tagsLoading}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                    disableAutoFocus: true,
                                    disableEnforceFocus: true,
                                    disableRestoreFocus: true,
                                    autoFocus: false,
                                }}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const tag = availableTags.find(t => t._id === value);
                                            return (
                                                <Chip 
                                                    key={value} 
                                                    label={tag?.name || value} 
                                                    size="small"
                                                    onDelete={(event) => handleRemoveTag(event, value)}
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    deleteIcon={
                                                        <i 
                                                            className="ri-close-line" 
                                                            style={{ 
                                                                color: '#ffffff', 
                                                                fontSize: '14px',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    }
                                                    sx={{
                                                        backgroundColor: tag?.color || '#1976d2',
                                                        color: '#ffffff',
                                                        '& .MuiChip-icon': {
                                                            color: '#ffffff'
                                                        },
                                                        '& .MuiChip-deleteIcon': {
                                                            color: '#ffffff',
                                                            '&:hover': {
                                                                color: '#f0f0f0'
                                                            }
                                                        }
                                                    }}
                                                    icon={
                                                        <i 
                                                            className="ri-price-tag-3-line" 
                                                            style={{ color: '#ffffff', fontSize: '14px' }}
                                                        />
                                                    }
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {tagsLoading ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={16} sx={{ mr: 1 }} />
                                        Loading tags...
                                    </MenuItem>
                                ) : availableTags.length === 0 ? (
                                    <MenuItem disabled>
                                        No tags available
                                    </MenuItem>
                                ) : (
                                    availableTags.map((tag) => (
                                        <MenuItem key={tag._id} value={tag._id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <i 
                                                    className="ri-price-tag-3-line" 
                                                    style={{ 
                                                        color: tag.color || '#1976d2', 
                                                        fontSize: '16px' 
                                                    }}
                                                />
                                                {tag.name}
                                            </Box>
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            name="notes"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {loading ? 'Creating...' : 'Create Customer'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default AddCustomerForm;