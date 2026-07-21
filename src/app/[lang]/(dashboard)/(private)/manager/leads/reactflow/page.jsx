"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Button,
    TextField,
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Snackbar
} from '@mui/material';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`lead-tabpanel-${index}`}
            aria-labelledby={`lead-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function LeadManagementSystem() {
    // Example lead schema fields (right side)
    const leadSchemaFields = [
        "name",
        "district",
        "email",
        "phone",
        "campaign",
        "campaignid",
        "status",
        "source",
        "Customer",
        "company",
        "tags",
        "assignedTo",
        "untouched",
        "notes",
        "createdAt",
        "profile",
        "stages",
        "additionalFields"
    ];

    // State for tabs
    const [tabValue, setTabValue] = useState(0);

    // State for the first form
    const [formData, setFormData] = useState({
        campaign: '',
        source: '',
        file: null
    });
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // State for matching tables – left side headers
    const [fileHeaders, setFileHeaders] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // State for lead data
    const [leadData, setLeadData] = useState(null);

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
            } else {
                console.error('Unexpected campaigns data format:', response.data);
                setErrorMessage('Invalid campaign data format received');
                setCampaigns([]);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setErrorMessage('Failed to fetch campaigns');
            setIsLoading(false);
            setCampaigns([]);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.campaign || !formData.source || !formData.file) {
            setErrorMessage('Please fill all required fields');
            return;
        }

        const fileData = new FormData();
        fileData.append('campaign', formData.campaign);
        fileData.append('source', formData.source);
        fileData.append('file', formData.file);

        const token = localStorage.getItem('token');

        try {
            setIsLoading(true);
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

            let fileHeadersData = [];
            if (Array.isArray(response.data.fileHeaders)) {
                fileHeadersData = response.data.fileHeaders;
            } else if (response.data.headers) {
                fileHeadersData = Array.isArray(response.data.headers)
                    ? response.data.headers
                    : [];
            }

            // Set file headers (left side fields)
            setFileHeaders(
                fileHeadersData.map((header, index) => ({
                    id: `file-${index}`,
                    label: header,
                }))
            );

            // Generate nodes for ReactFlow (left-to-right mapping)
            generateNodes(fileHeadersData, leadSchemaFields);

            setSuccessMessage('File uploaded successfully!');
            setIsLoading(false);

            // Move to mapping tab
            setTabValue(1);
        } catch (error) {
            console.error('Error uploading file or fetching headers:', error);
            setErrorMessage('Failed to upload file and retrieve headers');
            setIsLoading(false);
        }
    };

    // Generate ReactFlow nodes with smaller spacing and left-to-right mapping:
    // Left (file headers) will be source and Right (lead schema) will be target.
    const generateNodes = (fileHeadersArr, leadSchemaArr) => {
        const newNodes = [];

        // Left side (file headers) – these will be sources
        fileHeadersArr.forEach((header, index) => {
            newNodes.push({
                id: `file-${index}`,
                data: { label: header },
                position: { x: 100, y: 60 + index * 70 },
                sourcePosition: 'right', // handle on right side of file header node
                style: {
                    width: 180,
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '10px',
                    backgroundColor: '#f0f7ff',
                },
            });
        });

        // Right side (lead schema) – these will be targets (allow only one connection)
        leadSchemaArr.forEach((field, index) => {
            newNodes.push({
                id: `lead-${index}`,
                data: { label: field },
                position: { x: 450, y: 60 + index * 70 },
                targetPosition: 'left', // handle on left side of lead schema node
                style: {
                    width: 180,
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '10px',
                    backgroundColor: '#fff0f7',
                },
            });
        });

        setNodes(newNodes);
    };

    const onConnect = useCallback(
        (params) => {
            // Only allow connections from file- (left) nodes to lead- (right) nodes.
            if (params.source.startsWith('file-') && params.target.startsWith('lead-')) {
                setEdges((eds) => {
                    // Ensure the target (right side node) has only one incoming edge.
                    const targetIndex = eds.findIndex((edge) => edge.target === params.target);
                    let updatedEdges = [...eds];
                    if (targetIndex !== -1) {
                        // Remove existing edge if target already connected
                        updatedEdges.splice(targetIndex, 1);
                    }
                    const uniqueId = `e${params.source}-${params.target}`;
                    return addEdge(
                        {
                            ...params,
                            id: uniqueId,
                            type: 'bezier',
                            animated: true,
                            style: { stroke: '#3182ce', strokeWidth: 2 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#3182ce' },
                        },
                        updatedEdges
                    );
                });
            }
        },
        [setEdges]
    );

    const clearConnections = () => {
        setEdges([]);
    };

    const colorConnections = useCallback(() => {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffd166', '#6a0572', '#5e60ce', '#bb8588'];
        // Group edges by source
        const sourceGroups = {};
        edges.forEach((edge) => {
            if (!sourceGroups[edge.source]) {
                sourceGroups[edge.source] = [];
            }
            sourceGroups[edge.source].push(edge);
        });
        let newEdges = [...edges];
        Object.keys(sourceGroups).forEach((source, idx) => {
            const color = colors[idx % colors.length];
            sourceGroups[source].forEach((edge) => {
                const edgeIndex = newEdges.findIndex((e) => e.id === edge.id);
                if (edgeIndex !== -1) {
                    newEdges[edgeIndex] = {
                        ...newEdges[edgeIndex],
                        style: { ...newEdges[edgeIndex].style, stroke: color },
                        markerEnd: { ...newEdges[edgeIndex].markerEnd, color },
                    };
                }
            });
        });
        setEdges(newEdges);
    }, [edges, setEdges]);

    const handleMappingSubmit = async () => {
        if (edges.length === 0) {
            setErrorMessage('Please map at least one field');
            return;
        }
        try {
            setIsLoading(true);
            // Build mapping array using the left node (file header) and target (lead schema)
            const mappingData = edges.map((edge) => {
                const fileHeaderNode = fileHeaders.find((hdr) => hdr.id === edge.source);
                const leadSchemaIndex = edge.target.replace('lead-', '');
                const leadSchemaField = leadSchemaFields[parseInt(leadSchemaIndex, 10)];
                return {
                    fileHeader: fileHeaderNode?.label,
                    leadSchemaField,
                };
            });
            // Example POST to your API
            const response = await axios.post('http://localhost:8000/api/leads/mapfields', {
                campaign: formData.campaign,
                source: formData.source,
                mappings: mappingData,
            });

            setLeadData(response.data.leads || []);
            setSuccessMessage('Fields mapped successfully!');
            setIsLoading(false);
            // Go to the "View Leads" tab
            setTabValue(2);
        } catch (error) {
            console.error('Error mapping fields:', error);
            setErrorMessage('Failed to map fields');
            setIsLoading(false);
        }
    };

    const handleCloseAlert = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    return (
        <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Alerts */}
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

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Upload File" />
                    <Tab label="Map Fields" disabled={fileHeaders.length === 0} />
                    <Tab label="View Leads" disabled={!leadData} />
                </Tabs>
            </Box>

            {/* Tab 1: File Upload */}
            <TabPanel value={tabValue} index={0}>
                <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                    <Typography variant="h5" gutterBottom>
                        Upload Lead File
                    </Typography>
                    <form onSubmit={handleFormSubmit}>
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
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                                {isLoading ? <CircularProgress size={24} /> : 'Upload & Continue'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </TabPanel>

            {/* Tab 2: Map Fields */}
            <TabPanel value={tabValue} index={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, position: 'relative', height: 'calc(100vh - 200px)', minHeight: '400px' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        defaultZoom={1.4}
                        attributionPosition="bottom-right"
                        connectionLineType="bezier"
                        connectionLineStyle={{ stroke: '#3182ce', strokeWidth: 2 }}
                    >
                        <Controls />
                        <Background variant="dots" gap={12} size={1} />
                    </ReactFlow>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <Button variant="outlined" color="error" onClick={clearConnections} sx={{ mr: 2 }}>
                                Clear Connections
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={colorConnections}>
                                Color Connections
                            </Button>
                        </Box>
                        <Button variant="contained" color="primary" onClick={handleMappingSubmit} disabled={isLoading || edges.length === 0}>
                            {isLoading ? <CircularProgress size={24} /> : 'Submit Mapping'}
                        </Button>
                    </Box>
                </Box>
            </TabPanel>

            {/* Tab 3: View Leads */}
            <TabPanel value={tabValue} index={2}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Generated Leads
                    </Typography>
                    {leadData ? (
                        <Box sx={{ mt: 2, overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {Object.keys(leadData[0] || {}).map((key) => (
                                            <th key={key} style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {leadData.map((lead, index) => (
                                        <tr key={index}>
                                            {Object.values(lead).map((value, i) => (
                                                <td key={i} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    ) : (
                        <Typography>No lead data available</Typography>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="outlined" onClick={() => setTabValue(1)}>
                            Back to Mapping
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => {
                                // Reset form for a new upload
                                setFormData({ campaign: '', source: '', file: null });
                                setFileHeaders([]);
                                setNodes([]);
                                setEdges([]);
                                setLeadData(null);
                                setTabValue(0);
                            }}
                        >
                            Upload New File
                        </Button>
                    </Box>
                </Paper>
            </TabPanel>
        </Box>
    );
}
