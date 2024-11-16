'use client';
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    Drawer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem'; // Assume a SortableItem component exists
import { toast } from 'react-toastify';
import axios from 'axios';


const PipelineManager = () => {
    const [loading, setLoading] = useState(false);
    const [pipelines, setPipelines] = useState([]);
    const [open, setOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [pipelineData, setPipelineData] = useState({
        name: '',
        description: '',
        stages: [],
    });

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const toggleDrawer = (open) => () => setDrawerOpen(open);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPipelineData((prev) => ({ ...prev, [name]: value }));
    };

    const addStage = () => {
        setPipelineData((prev) => ({
            ...prev,
            stages: [...prev.stages, { id: `stage-${Date.now()}`, name: '' }],
        }));
    };

    const removeStage = (index) => {
        setPipelineData((prev) => ({
            ...prev,
            stages: prev.stages.filter((_, i) => i !== index),
        }));
    };

    const handleStageChange = (index, event) => {
        const { value } = event.target;
        setPipelineData((prev) => {
            const stages = [...prev.stages];
            stages[index].name = value;
            return { ...prev, stages };
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = pipelineData.stages.findIndex((stage) => stage.id === active.id);
            const newIndex = pipelineData.stages.findIndex((stage) => stage.id === over.id);
            const reorderedStages = Array.from(pipelineData.stages);
            const [movedStage] = reorderedStages.splice(oldIndex, 1);
            reorderedStages.splice(newIndex, 0, movedStage);

            setPipelineData((prev) => ({ ...prev, stages: reorderedStages }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authorization token found.');
            return;
        }

        if (!pipelineData.name.trim()) {
            toast.error('Pipeline name is required.');
            return;
        }

        try {
            // Use array index as the order
            const stagesWithOrder = pipelineData.stages.map((stage, index) => ({
                ...stage,
                order: index, // Index used as the order
            }));

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/createpipeline`,
                {
                    name: pipelineData.name,
                    description: pipelineData.description,
                    stages: stagesWithOrder,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201 || response.status === 200) {
                toast.success('Pipeline created successfully!');
                setPipelines((prev) => [...prev, { ...pipelineData, id: response.data.id || Date.now() }]);
                setPipelineData({ name: '', description: '', stages: [] });
                handleClose();
            } else {
                toast.error('Unexpected response from the server.');
            }
        } catch (error) {
            if (error.response) {
                toast.error(`Error: ${error.response.data.message || 'Server error occurred.'}`);
            } else if (error.request) {
                toast.error('No response from the server. Please try again later.');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        }
    };




    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                toast('No authorization token found.')
                return
            }
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setPipelines(response.data)
            } catch (error) {
                toast('Failed to fetch data.')
            }
        }
        fetchData()
    }, [])
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} display="flex" justifyContent="space-between">
                <Typography variant="h4">Pipelines</Typography>
                <Button variant="outlined" onClick={handleClickOpen}>
                    Create Pipeline
                </Button>
            </Grid>

            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                pipelines.map((pipeline) => (
                    <Grid item xs={12} sm={6} key={pipeline.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{pipeline.name}</Typography>
                                <Button onClick={() => {
                                    setSelectedPipeline(pipeline);
                                    setDrawerOpen(true);
                                }}>
                                    View
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            )}

            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                {selectedPipeline && (
                    <div style={{ padding: 16, width: 300 }}>
                        <Typography variant="h6">{selectedPipeline.name}</Typography>
                        <Typography>{selectedPipeline.description}</Typography>
                    </div>
                )}
            </Drawer>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Create a New Pipeline</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="name"
                                    label="Pipeline Name"
                                    fullWidth
                                    required
                                    value={pipelineData.name}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="description"
                                    label="Pipeline Description"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={pipelineData.description}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6">Stages</Typography>
                                <DndContext
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={pipelineData.stages.map((stage) => stage.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {pipelineData.stages.map((stage, index) => (
                                            <SortableItem
                                                key={stage.id}
                                                id={stage.id}
                                                index={index}
                                                stage={stage}
                                                onChange={(e) => handleStageChange(index, e)}
                                                removeStage={() => removeStage(index)}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </Grid>
                            <Grid item xs={12}>
                                <Button onClick={addStage} variant="outlined">
                                    Add Stage
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary">
                                    Create Pipeline
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default PipelineManager;
