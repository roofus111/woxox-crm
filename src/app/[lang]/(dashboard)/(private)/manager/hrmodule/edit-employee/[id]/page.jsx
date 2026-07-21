'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    Grid,
    Typography,
    Box,
    DialogActions,
} from '@mui/material';
import axios from 'axios';

const EditEmployee = () => {
    const router = useRouter();
    const { id } = useParams();
    const fileInputRef = useRef(null);

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
        role: '',
        status: 'Active',
        salary: '', // Added salary field
    });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    useEffect(() => {
        const fetchEmployee = async () => {
            if (id) {
                const token = localStorage.getItem('token');
                try {
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/hr/getemployees/${id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    console.log('Fetched employee data:', response.data.employee);
                    setFormData(response.data.employee);
                    if (
                        response.data.employee.attachments &&
                        response.data.employee.attachments.length > 0
                    ) {
                        const fileUrl = response.data.employee.attachments[0].fileUrl;
                        setPreviewUrl(`${fileUrl}?cb=${new Date().getTime()}`);
                    }
                } catch (error) {
                    console.error('Error fetching employee:', error);
                }
            }
        };

        fetchEmployee();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('address')) {
            const [_, field] = name.split('.');
            setFormData({
                ...formData,
                address: { ...formData.address, [field]: value },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            console.log('New file selected:', selectedFile);
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                setPreviewUrl(null);
            }
            setRemoveImage(false);
        }
    };

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeleteImage = async () => {
        const token = localStorage.getItem('token');
        if (formData.attachments && formData.attachments.length > 0) {
            const attachmentId = formData.attachments[0]._id;
            try {
                await axios.delete(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/hr/employee/${id}/attachment/${attachmentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log('Attachment deleted successfully');
            } catch (error) {
                console.error('Error deleting attachment:', error);
            }
        }
        setFile(null);
        setPreviewUrl(null);
        setRemoveImage(true);
        setFormData((prev) => ({ ...prev, attachments: [] }));
        clearFileInput();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Prepare employee details (excluding image data)
        const allowedKeys = [
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'gender',
            'dateOfBirth',
            'address',
            'startDate',
            'department',
            'role',
            'status',
            'salary', // Include salary in the allowed keys
        ];
        const filteredData = {};
        allowedKeys.forEach((key) => {
            if (formData[key] !== undefined) {
                filteredData[key] = formData[key];
            }
        });

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hr/putemployees/${id}`,
                filteredData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (file || removeImage) {
                const imageFormData = new FormData();
                if (file) {
                    imageFormData.append('attachments', file);
                }
                if (removeImage && !file) {
                    imageFormData.append('removeAttachments', 'true');
                }
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/hr/${id}/attachments`,
                    imageFormData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            }

            router.push('/manager/hrmodule/employees');
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '16px', width: '100%' }}>
            <Typography variant="h5" gutterBottom>
                Edit Employee
            </Typography>
            <Grid container spacing={3}>
                {/* Personal Details */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="firstName"
                        label="First Name"
                        fullWidth
                        value={formData.firstName}
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="lastName"
                        label="Last Name"
                        fullWidth
                        value={formData.lastName}
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
                        value={formData.email}
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="phoneNumber"
                        label="Phone Number"
                        fullWidth
                        value={formData.phoneNumber}
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                {/* Salary Field */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="salary"
                        label="Salary"
                        type="number"
                        fullWidth
                        value={formData.salary}
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
                        value={formData.gender}
                        onChange={handleChange}
                        variant="standard"
                    >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        fullWidth
                        value={
                            formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''
                        }
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange}
                    />
                </Grid>
                {/* Country and Start Date */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="address.country"
                        label="Country"
                        fullWidth
                        value={formData.address?.country || ''}
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="startDate"
                        label="Start Date"
                        type="date"
                        fullWidth
                        value={
                            formData.startDate ? formData.startDate.split('T')[0] : ''
                        }
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange}
                    />
                </Grid>
                {/* File Upload / Image Preview */}
                <Grid item xs={12}>
                    {previewUrl ? (
                        <Box textAlign="center">
                            <Typography variant="subtitle1">Image Preview:</Typography>
                            <img
                                src={previewUrl}
                                alt="Image Preview"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    marginTop: '8px',
                                    borderRadius: '8px',
                                }}
                            />
                            <Box mt={1}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleDeleteImage}
                                >
                                    Delete Image
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                border: '2px dashed #ccc',
                                borderRadius: '8px',
                                textAlign: 'center',
                                padding: '16px',
                                cursor: 'pointer',
                                backgroundColor: '#f9f9f9',
                                '&:hover': { backgroundColor: '#f0f0f0' },
                            }}
                            onClick={() =>
                                fileInputRef.current && fileInputRef.current.click()
                            }
                        >
                            <i className="ri-upload-2-line"></i>
                            <Typography variant="body1">
                                Drag and drop your file here or click to upload
                            </Typography>
                        </Box>
                    )}
                    <input
                        type="file"
                        id="fileUpload"
                        name="attachments"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </Grid>
            </Grid>
            <div style={{ marginTop: '24px' }}>
                <DialogActions>
                    <Button type="submit" variant="contained" color="primary">
                        Update Employee
                    </Button>
                </DialogActions>
            </div>
        </form>
    );
};

export default EditEmployee;
