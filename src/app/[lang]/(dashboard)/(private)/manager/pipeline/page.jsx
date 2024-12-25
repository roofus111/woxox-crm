'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
    Box,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    DndContext, closestCenter, useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates,
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem'; // Assume a SortableItem component exists
import { toast } from 'react-toastify';
import axios from 'axios';

// Custom hook for managing pipeline data
const usePipelines = () => {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPipelines = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authorization token found.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPipelines(response.data);
            console.log(response.data);

        } catch (error) {
            toast.error('Failed to fetch pipelines. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipelines();
    }, []);

    return { pipelines, setPipelines, loading, fetchPipelines };
};

const SortableStageItem = ({ id, name }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        // transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: "10px",
    };

    return (
        <Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    {name}
                </Box>
            </CardContent>
        </Card>
    );
};


const PipelineManager = () => {
    const { pipelines, setPipelines, loading, fetchPipelines } = usePipelines();
    const [open, setOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [pipelineData, setPipelineData] = useState({
        name: '',
        description: '',
        stages: [],
    });

    // Debounced input change handler
    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setPipelineData((prev) => ({ ...prev, [name]: value }));
        },
        [setPipelineData]
    );

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

        if (!pipelineData.name.trim()) {
            toast.error('Pipeline name is required.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No authorization token found.');
                return;
            }

            const stagesWithOrder = pipelineData.stages.map((stage, index) => ({
                ...stage,
                order: index,
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
                setOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error occurred while creating pipeline.');
        }
    };

    const handleDrawerOpen = (pipeline) => {
        setSelectedPipeline(pipeline);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => setDrawerOpen(false);


    const [stages, setStages] = useState(selectedPipeline?.stages || []);

    const stageSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleStageDragEnd = ({ active, over }) => {
        if (!over) return;

        if (active.id !== over.id) {
            setStages((prevStages) => {
                const oldIndex = prevStages.findIndex((item) => item._id === active.id);
                const newIndex = prevStages.findIndex((item) => item._id === over.id);

                return arrayMove(prevStages, oldIndex, newIndex);
            });
        }
    };
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">Pipelines</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                    Create Pipeline
                </Button>
            </Grid>

            {loading ? (
                <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Grid>
            ) : (
                pipelines.map((pipeline) => (
                    <Grid item xs={12} sm={6} key={pipeline.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{pipeline.name}</Typography>
                                <Typography variant="body2">{pipeline.description}</Typography>
                                <Button onClick={() => handleDrawerOpen(pipeline)}>View</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            )}

            <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                <Box sx={{ width: "700px" }} role="presentation" padding={5}>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent >
                                    <Box >
                                        <Box>
                                            <h3>{selectedPipeline?.name}</h3>
                                            <h6>{selectedPipeline?.description}</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={3}>
                            <Card>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2>6</h2>
                                            <h6>Insigth</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={3}>
                            <Card>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2>6</h2>
                                            <h6>Insigth</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={3}>
                            <Card>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2>6</h2>
                                            <h6>Insigth</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={3}>
                            <Card>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2>6</h2>
                                            <h6>Insigth</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Divider />
                        <Grid item xs={12}>

                            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                <h4>Stages</h4>
                                <Button>Create New</Button>
                            </Box>

                            <DndContext
                                sensors={stageSensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleStageDragEnd}
                            >
                                <SortableContext items={selectedPipeline?.stages.map((item) => item._id)}>
                                    {selectedPipeline?.stages.map((item) => (
                                        <SortableStageItem key={item._id} id={item._id} name={item.name} />
                                    ))}
                                </SortableContext>
                            </DndContext>

                        </Grid>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                        <h4>Campaigns List</h4>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Drawer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>Create Pipeline</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            name="name"
                            label="Pipeline Name"
                            fullWidth
                            required
                            margin="normal"
                            value={pipelineData.name}
                            onChange={handleInputChange}
                        />
                        <TextField
                            name="description"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            margin="normal"
                            value={pipelineData.description}
                            onChange={handleInputChange}
                        />
                        <Typography variant="h6">Stages</Typography>
                        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext
                                items={pipelineData.stages.map((stage) => stage.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {pipelineData.stages.map((stage, index) => (
                                    <SortableItem
                                        key={stage.id}
                                        id={stage.id}
                                        stage={stage}
                                        index={index}
                                        onChange={(e) => handleStageChange(index, e)}
                                        removeStage={() => removeStage(index)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        <Button variant="outlined" onClick={addStage}>
                            Add Stage
                        </Button>
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                            Create
                        </Button>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

        </Grid>
    );
};

export default PipelineManager;
