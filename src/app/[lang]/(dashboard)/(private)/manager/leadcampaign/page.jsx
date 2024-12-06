'use client';
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Button,
    Card,
    CardContent,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Box,
    CardHeader,
    Typography,
    Drawer,
    Paper,
    Avatar,
    List,
    ListItem,
    Chip,
    ListItemText
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import Leads from '../addleads/page';

const Campaign = () => {
    const [open, setOpen] = useState(false);
    const [draw, setDraw] = useState(false);
    const [campaign, setCampaign] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open2, setOpen2] = useState(false);
    // Open/Close Handlers
    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleClickOpen2 = () => setOpen2(true);
    const handleClose2 = () => setOpen2(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
        setDraw(open);
    };

    // Fetch Campaign Data
    const fetchCampaign = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Authorization token is missing.');
            setLoading(false);
            return;
        }

        if (!process.env.NEXT_PUBLIC_API_URL) {
            toast.error('API URL is not configured.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/campaign/getcampaign`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setCampaign(response.data);
                console.log(response.data);
            } else {
                toast.error('Unexpected response from the server.');
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                toast.error(`Error ${status}: ${data?.message || 'Failed to fetch campaign.'}`);
            } else if (error.request) {
                toast.error('No response received from the server.');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaign();
    }, []);


    const CampaignDetails = ({ campaign }) => {
        const {
            name,
            description,
            insights,
            pipelineInfo,
            pipelineStages,
        } = campaign;

        return (
            <Box sx={{ padding: 4, maxWidth: 900, margin: "auto" }}>
                {/* Campaign Card */}
                <Card sx={{ mb: 4 }}>
                    <CardHeader
                        title={name}
                        titleTypographyProps={{ variant: "h5", fontWeight: "bold" }}
                        subheader={description}
                        subheaderTypographyProps={{ variant: "body1", color: "text.secondary" }}
                    />
                    <CardContent>
                        {/* Insights */}
                        <Typography variant="h6" gutterBottom>
                            Insights
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { label: "Total Leads", value: insights.totalLeads, icon: <p>icon</p> },
                                { label: "Pending", value: insights.pending, icon: <p>icon</p> },
                                { label: "In Progress", value: insights.inProgress, icon: <p>icon</p> },
                                { label: "Lost", value: insights.lost, icon: <p>icon</p> },
                                { label: "Won", value: insights.won, icon: <p>icon</p> },
                            ].map((item, idx) => (
                                <Grid item xs={6} sm={4} md={2.4} key={idx}>
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            padding: 2,
                                            textAlign: "center",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: "primary.main", margin: "auto", mb: 1 }}>
                                            {item.icon}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold">
                                            {item.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.label}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Pipeline Information */}
                <Card>
                    <CardHeader
                        title="Pipeline Information"
                        titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
                        subheader={pipelineInfo}
                        subheaderTypographyProps={{ variant: "body1", color: "text.secondary" }}
                    />
                    <CardContent>
                        {/* Pipeline Stages */}
                        <Typography variant="h6" gutterBottom>
                            Pipeline Stages
                        </Typography>
                        <List>
                            {pipelineStages.map((stage, idx) => (
                                <React.Fragment key={idx}>
                                    <ListItem>
                                        <ListItemText
                                            primary={stage.name}
                                            primaryTypographyProps={{ variant: "subtitle1", fontWeight: "bold" }}
                                            secondary={`Leads: ${stage.count}`}
                                        />
                                        <Chip
                                            label={`${stage.count} Leads`}
                                            color="primary"
                                            size="small"
                                        />
                                    </ListItem>
                                    {idx < pipelineStages.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const campaignData = {
        name: "Summer Campaign 2024",
        description: "Promoting summer courses for international students.",
        insights: {
            totalLeads: 150,
            pending: 40,
            inProgress: 50,
            lost: 30,
            won: 30,
        },
        pipelineInfo: "Pipeline for tracking campaign progress.",
        pipelineStages: [
            { name: "Initial Contact", count: 40 },
            { name: "Follow-Up", count: 30 },
            { name: "Negotiation", count: 20 },
            { name: "Closure", count: 10 },
            { name: "Onboarding", count: 50 },
        ],
    };
    // Drawer Content
    const DrawerList = (
        <Box sx={{ width: 700 }} role="presentation" onClick={toggleDrawer(false)}>
            <CampaignDetails campaign={campaignData} />
        </Box>
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="space-between">
                    <h1>Campaign</h1>
                    <Button variant="outlined" onClick={handleClickOpen}>
                        Create Campaign
                    </Button>
                </Grid>
                <Grid item xs={12} md={8} mt={4}>
                    {loading ? (
                        <p>Loading campaigns...</p>
                    ) : campaign.length ? (
                        campaign.map((item, index) => (
                            <Card key={index} sx={{ mb: 2 }}>
                                <CardContent>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div><h3>{item.name || `Campaign ${index + 1}`}</h3>
                                            <p> <small>{item.description} </small></p></div>
                                    </div>
                                    <Divider />
                                    <Grid container spacing={1} mt={2} mb={2}>
                                        <Grid item xs={2}>Total Leads: <b>{item.activeCount || 'N/A'}</b></Grid>
                                        <Grid item xs={2}>Converted: <b>{item.stageCount || 'N/A'}</b></Grid>
                                        <Grid item xs={2}>Pending : {item.insights || 'N/A'}</Grid>
                                        <Grid item xs={2}>In Progress : "{item.insights || 'N/A'}</Grid>
                                        <Grid item xs={2}>Lost : {item.insights || 'N/A'}</Grid>
                                        <Grid item xs={2}> UnAssigned : "{item.insights || 'N/A'}</Grid>
                                    </Grid>

                                    <Divider />
                                    <Grid container spacing={1} mt={2} justifyContent={'flex-end'}>
                                        <Button onClick={handleClickOpen2}>Add Leads</Button>
                                        <Button onClick={toggleDrawer(true)}>View</Button>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p>No campaigns available.</p>
                    )}
                </Grid>
            </Grid>

            {/* Drawer */}
            <Drawer anchor="right" open={draw} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>

            {/* Create Campaign Dialog */}
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create Campaign</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the details for your new campaign below.
                    </DialogContentText>
                    <TextField id="name" autoFocus fullWidth label="Campaign Name" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog maxWidth open={open2} onClose={handleClose2} aria-labelledby="form-dialog-title">
                <DialogContent>
                    <DialogContentText>
                        <Leads />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Campaign;
