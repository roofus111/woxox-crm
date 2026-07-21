'use client'

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Stepper, Step, StepLabel, CircularProgress, Select, MenuItem, FormControl, InputLabel, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

const SmartUpload = () => {
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Upload File', 'Map Fields', 'Review & Confirm'];

    // State for form data and API responses
    const [formData, setFormData] = useState({
        campaign: '',
        source: '',
        file: null
    });
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Add new state for mapping data
    const [fileHeaders, setFileHeaders] = useState([]);
    const [leadSchemaFields, setLeadSchemaFields] = useState([]);
    const [dynamicFields, setDynamicFields] = useState([]);
    const [mappings, setMappings] = useState({});

    // Fetch campaigns on component mount
    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        const token = localStorage.getItem('token');
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/getcampaign`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data && response.data.campaign && Array.isArray(response.data.campaign)) {
                setCampaigns(response.data.campaign);
            } else if (Array.isArray(response.data)) {
                setCampaigns(response.data);
            } else if (typeof response.data === 'object') {
                const campaignsArray = Object.keys(response.data).map((key) => ({
                    id: key,
                    name: response.data[key],
                }));
                setCampaigns(campaignsArray);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setErrorMessage('Failed to fetch campaigns');
            setIsLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            // Validate first step
            if (!formData.campaign || !formData.source || !formData.file) {
                setErrorMessage('Please fill all required fields');
                return;
            }

            // Process file upload
            const fileData = new FormData();
            fileData.append('campaign', formData.campaign);
            fileData.append('source', formData.source);
            fileData.append('file', formData.file);

            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/leads/headers`,
                    fileData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Store the mapping data
                setFileHeaders(response.data.headers || []);
                setLeadSchemaFields(response.data.leadSchemaFields || []);
                setDynamicFields(response.data.dynamicFieldsFromHeaders || []);

                // Initialize mappings with dynamic fields
                const initialMappings = {};
                response.data.dynamicFieldsFromHeaders.forEach(field => {
                    const matchingHeader = response.data.headers.find(
                        header => header.toLowerCase() === field.toLowerCase()
                    );
                    if (matchingHeader) {
                        initialMappings[matchingHeader] = field;
                    }
                });
                setMappings(initialMappings);

                setSuccessMessage('File uploaded successfully!');
                setActiveStep((prevStep) => prevStep + 1);
            } catch (error) {
                console.error('Error uploading file:', error);
                setErrorMessage('Failed to upload file');
            } finally {
                setIsLoading(false);
            }
        } else if (activeStep === 1) {
            // Validate mappings
            if (Object.keys(mappings).length === 0) {
                setErrorMessage('Please map at least one field');
                return;
            }
            // TODO: Submit mappings to backend
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleCloseAlert = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleMapping = (fileHeader, schemaField) => {
        setMappings(prev => ({
            ...prev,
            [fileHeader]: schemaField
        }));
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h5" gutterBottom>Smart Upload</Typography>

            <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <Stepper activeStep={activeStep} sx={{ my: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ mt: 2 }}>
                {activeStep === 0 && (
                    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" gutterBottom>Upload Lead File</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="campaign-label">Campaign</InputLabel>
                            <Select
                                labelId="campaign-label"
                                name="campaign"
                                value={formData.campaign}
                                onChange={handleFormChange}
                                label="Campaign"
                                required
                            >
                                {campaigns.map((campaign) => (
                                    <MenuItem key={campaign.id} value={campaign.id}>
                                        {campaign.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Source"
                            name="source"
                            value={formData.source}
                            onChange={handleFormChange}
                            required
                        />
                        <Box sx={{ mt: 2 }}>
                            <input
                                accept=".csv,.xlsx,.xls"
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload">
                                <Button variant="contained" component="span" sx={{ mr: 2 }}>
                                    Select File
                                </Button>
                                {formData.file ? formData.file.name : 'No file selected'}
                            </label>
                        </Box>
                    </Paper>
                )}

                {activeStep === 1 && (
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Map Fields</Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Match your file headers with the corresponding lead fields
                        </Typography>

                        <Grid container spacing={3}>
                            {fileHeaders.map((header) => (
                                <Grid item xs={12} key={header}>
                                    <FormControl fullWidth>
                                        <InputLabel>{header}</InputLabel>
                                        <Select
                                            value={mappings[header] || ''}
                                            onChange={(e) => handleMapping(header, e.target.value)}
                                            label={header}
                                        >
                                            <MenuItem value="">
                                                <em>Do not map</em>
                                            </MenuItem>
                                            {leadSchemaFields.map((field) => (
                                                <MenuItem
                                                    key={field}
                                                    value={field}
                                                    disabled={Object.values(mappings).includes(field) && mappings[header] !== field}
                                                >
                                                    {field}
                                                    {dynamicFields.includes(field) && " (Auto-mapped)"}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

                {activeStep === 2 && (
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Review Mappings</Typography>
                        <Box sx={{ mt: 2 }}>
                            {Object.entries(mappings).map(([header, field]) => (
                                <Typography key={header}>
                                    {header} → {field}
                                </Typography>
                            ))}
                        </Box>
                    </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={isLoading || activeStep === steps.length - 1}
                    >
                        {isLoading ? <CircularProgress size={24} /> :
                            activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default SmartUpload;
