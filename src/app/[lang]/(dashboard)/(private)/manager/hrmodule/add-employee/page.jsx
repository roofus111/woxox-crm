'use client';

import React, { useState } from 'react';
import {
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    Grid,
    Typography,
    Box,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AddEmployee = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        dateOfBirth: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
        },
        startDate: '',
        department: '',
        role: '', // Role field now matches allowed enum values
        status: 'Active',
        salary: '', // Added salary field
    });

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('address')) {
            const [_, field] = name.split('.');
            setFormData({
                ...formData,
                address: {
                    ...formData.address,
                    [field]: value,
                },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        // Generate a preview URL for the selected file if it's an image
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setPreviewUrl(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First Name is required.';
        if (!formData.email) newErrors.email = 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Enter a valid email.';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
        
        const formDataToSubmit = new FormData();
      
        // Append all basic fields (except address and salary)
        for (const [key, value] of Object.entries(formData)) {
          if (key !== 'address' && key !== 'salary') {
            formDataToSubmit.append(key, value);
          }
        }
      
        // Append salary as a number
        formDataToSubmit.append('salary', Number(formData.salary));
      
        // Append the entire address as a JSON string
        formDataToSubmit.append('address', JSON.stringify(formData.address));
      
        // Append file if available
        if (file) {
          formDataToSubmit.append('attachments', file);
        }
      
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/hr/create`,
            formDataToSubmit,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          router.push('/en/manager/hrmodule/employees');
        } catch (error) {
          console.error('Error saving employee:', error);
        }
      };      
      
    return (
        <form onSubmit={handleSubmit} style={{ padding: '16px', width: '100%' }}>
            <Typography variant="h5" gutterBottom>
                Add New Employee
            </Typography>
            <Grid container spacing={3}>
                {/* Personal Details */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="firstName"
                        label="First Name"
                        fullWidth
                        variant="standard"
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="lastName"
                        label="Last Name"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="standard"
                        error={!!errors.email}
                        helperText={errors.email}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="phoneNumber"
                        label="Phone Number"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>

                {/* Gender and Date of Birth */}
                <Grid item xs={12} sm={6}>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                        name="gender"
                        labelId="gender-label"
                        fullWidth
                        onChange={handleChange}
                        variant="standard"
                        value={formData.gender}
                    >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6} className='mt-2'>
                    <TextField
                        name="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        fullWidth
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange}
                        value={formData.dateOfBirth}
                    />
                </Grid>

                {/* Department and Role */}
                <Grid item xs={12} sm={6}>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        name="role"
                        labelId="role-label"
                        fullWidth
                        onChange={handleChange}
                        variant="standard"
                        value={formData.role}
                    >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                        name="department"
                        labelId="department-label"
                        fullWidth
                        onChange={handleChange}
                        variant="standard"
                        value={formData.department}
                    >
                        <MenuItem value="IT">IT</MenuItem>
                        <MenuItem value="Sales">Sales</MenuItem>
                        <MenuItem value="HR">HR</MenuItem>
                        <MenuItem value="Finance">Finance</MenuItem>
                    </Select>
                </Grid>

                {/* Address Details */}
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Address</Typography>
                </Grid>
                {['street', 'city', 'state', 'zipCode'].map((field) => (
                    <Grid item xs={12} sm={6} key={field}>
                        <TextField
                            name={`address.${field}`}
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            fullWidth
                            variant="standard"
                            onChange={handleChange}
                        />
                    </Grid>
                ))}

                {/* Country, Start Date and Salary */}
                <Grid item xs={12} sm={4}>
                    <TextField
                        name="address.country"
                        label="Country"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        name="startDate"
                        label="Start Date"
                        type="date"
                        fullWidth
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange}
                        value={formData.startDate}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        name="salary"
                        label="Salary"
                        type="number"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={formData.salary}
                    />
                </Grid>

                {/* File Upload */}
                <Grid item xs={12}>
                    <Box
                        sx={{
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            textAlign: 'center',
                            mt: '16px',
                            padding: '16px',
                            cursor: 'pointer',
                            backgroundColor: '#f9f9f9',
                            '&:hover': {
                                backgroundColor: '#f0f0f0',
                            },
                        }}
                        onClick={() => document.getElementById('fileUpload').click()}
                    >
                        <i className="ri-upload-2-line"></i>
                        <Typography variant="body1">
                            Drag and drop your file here or click to upload
                        </Typography>
                    </Box>
                    <input
                        type="file"
                        id="fileUpload"
                        name="attachments"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    {previewUrl && (
                        <Box mt={2} textAlign="center">
                            <Typography variant="subtitle1">Image Preview:</Typography>
                            <img
                                src={previewUrl}
                                alt="Image Preview"
                                style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '8px' }}
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
            <div style={{ marginTop: '24px' }}>
                <Button variant="contained" color="primary" type="submit">
                    Create Employee
                </Button>
            </div>
        </form>
    );
};

export default AddEmployee;
