'use client'
import React, { useState } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Grid,
    Typography,
} from '@mui/material';

const AddCustomerForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
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
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted Data:', formData);
        // Add your API call or logic to handle the form submission here
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
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
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
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={formData.phone}
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
                        <Button type="submit" variant="contained" fullWidth>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default AddCustomerForm;
