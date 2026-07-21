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
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
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

const SortableStageItem = ({ id, name, count }) => {
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
        boxShadow: "none",
        border: '1px solid #e0e0e0'
    };

    return (
        <Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">{name}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ backgroundColor: "#7ea1d9", borderRadius: "50%", width: "20px", height: "20px", alignItems: "center", justifyContent: "center", textAlign: "center", display: 'flex', color: "#fff" }}>
                        {count || 0}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};


const PipelineManager = () => {
    const { pipelines, setPipelines, loading, fetchPipelines } = usePipelines();
    const [open, setOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [pipelineData, setPipelineData] = useState({
        name: '',
        count: 1,
        description: '',
        stages: [],
    });
    const [pipelineDetails, setPipelineDetails] = useState({ name: '', description: '' });
    const [editPipeline, setPipeline] = useState(false);

    const fetchPipelineCardDetails = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Token not found');
            return;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/campaign/campaigns/pipeline/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPipelineDetails(response.data.campaigns);
            console.log('Pipeline details:', response.data);
        } catch (error) {
            console.error('Error fetching pipeline details:', error);
        }
    };

    const handleSaveChanges = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Token not found');
            return;
        }

        try {
            // Prepare stages with proper format
            const stagesWithOrder = pipelineData.stages.map((stage, index) => ({
                ...stage,
                order: index,
                id: stage.isNew ? undefined : stage.id, // Remove ID for new stages
            }));

            // Use stagesWithOrder in the API payload
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/updatepipeline/${id}`,
                { ...pipelineData, stages: stagesWithOrder }, // Replace pipelineData.stages
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success('Pipeline updated successfully!');
                fetchPipelines(); // Refresh pipeline list
                setIsEditDialogOpen(false); // Close edit dialog
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating the pipeline.');
        }
    };


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
          stages: [
            ...prev.stages,
            { id: `new-${Date.now()}`, name: '', property: 'Pending', isNew: true },
          ],
        }));
      };           

      const removeStage = (id) => {
        setPipelineData((prev) => ({
          ...prev,
          stages: prev.stages.filter((stage) => stage.id !== id),
        }));      
    };

    const handleStageChange = (id, field, value) => {
        console.log('Updating stage:', id, field, value);
        setPipelineData((prev) => ({
          ...prev,
          stages: prev.stages.map((stage) =>
            stage.id === id ? { ...stage, [field]: value } : stage
          ),
        }));
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
        console.log("pipeline", pipeline);
        setDrawerOpen(true);
        fetchPipelineCardDetails(pipeline._id);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setPipelineDetails(null);
    }

    const handleEditClose = () => {
        setIsEditDialogOpen(false);
        setPipelineData(
            {
                name: " ",
                description: " ",
                stages: [],
            }
        );
    }

    const handleEdit = (pipeline) => {
        const normalizedPipeline = {
          ...pipeline,
          stages: pipeline.stages.map((stage) => ({
            ...stage,
            id: stage._id, // normalize _id to id
          })),
        };
        setPipelineData(normalizedPipeline);
        setIsEditDialogOpen(true);
      };

    // Function to handle changes in the form inputs
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setPipeline((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
      

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
                                <Button onClick={() => handleEdit(pipeline)}>
                                    <i className="ri-edit-line"></i>
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            )}

            {isEditDialogOpen && (
                <Dialog open={isEditDialogOpen} onClose={() => handleEditClose()}>
                    <DialogTitle>Edit Pipeline</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                name="name"
                                label="Pipeline Name"
                                fullWidth
                                value={pipelineData?.name || ''}
                                required
                                margin="normal"
                                onChange={handleInputChange}
                            />
                            <TextField
                                name="description"
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                margin="normal"
                                value={pipelineData?.description || ''}
                                onChange={handleInputChange}
                            />
                            <Typography variant="h6">Stages</Typography>
                            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={pipelineData?.stages.map((stage) => stage.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                {pipelineData.stages.map((stage) => (
                                <SortableItem
                                    key={stage.id}
                                    id={stage.id}
                                    stage={stage}
                                    onChange={handleStageChange}
                                    removeStage={(id) => removeStage(id)}
                                />
                                ))}
                                </SortableContext>
                            </DndContext>
                            <div className='flex gap-2 '>
                                <Button variant="outlined" onClick={addStage} sx={{ mt: 2 }}>
                                    Add Stage
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                    <DialogActions>
                    </DialogActions>
                    <DialogActions>
                        <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleSaveChanges(pipelineData._id)}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                <Box sx={{ width: "700px" }} role="presentation" padding={5}>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <CardContent >
                                    <Box >
                                        <Box>
                                            <h3 className='font-semibold text-xl'>{selectedPipeline?.name}</h3>
                                            <h6 className='font-medium text-xs'>{selectedPipeline?.description}</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <CardContent sx={{ boxShadow: 'none' }}>
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2 className='font-semibold'>N/A</h2>
                                            <h6 className='font-semibold text-xs'>Total Leads</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2 className='font-semibold'>N/A</h2>
                                            <h6 className='font-semibold text-xs'>Campaigns</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2 className='font-semibold'>N/A</h2>
                                            <h6 className='font-semibold text-xs'>Progressing</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box>
                                            <h2 className='font-semibold'>N/A</h2>
                                            <h6 className='font-semibold text-xs'>Won</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={2.4}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <CardContent >
                                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                        <Box >
                                            <h2 className='font-semibold'>N/A</h2>
                                            <h6 className='font-semibold text-xs'>Loss</h6>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Divider />
                        <Grid item xs={12}>

                            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                <h4 className='text-lg font-semibold'>Stages</h4>
                                {/* <Button className='bg-[#666cff] text-white p-3 mb-4'>Create New</Button> */}
                            </Box>

                            <DndContext
                                sensors={stageSensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleStageDragEnd}
                            >
                                <SortableContext items={selectedPipeline?.stages.map((item) => item._id)}>
                                    {selectedPipeline?.stages.map((item, index) => (
                                        <SortableStageItem key={item._id} id={item._id} name={item.name} count={index + 1} />
                                    ))}
                                </SortableContext>
                            </DndContext>

                        </Grid>
                        <Grid item xs={12}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    {/* Parent Title */}
                                    <Typography variant="h5" className="font-semibold" sx={{ marginBottom: "16px" }}>
                                        Campaigns
                                    </Typography>

                                    <Box display={'flex'} flexDirection={'column'}>
                                        {/* Check if pipelineDetails is an array before calling .map */}
                                        {Array.isArray(pipelineDetails) ? (
                                            pipelineDetails.map((details, index) => (
                                                <Card key={index} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', marginBottom: '16px' }}>
                                                    <CardContent>
                                                        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                                            {/* Left side: Name and Description */}
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="h6" className="font-semibold">
                                                                    {details.name}
                                                                </Typography>
                                                                <Typography sx={{ paddingY: "12px" }} variant="body2" color="textSecondary">
                                                                    {details.description}
                                                                </Typography>
                                                            </Box>

                                                            {/* Right side: Button */}
                                                            <button className='rounded-full w-8 h-8 bg-[#666cff] cursor-pointer'>
                                                                <i style={{ width: "16px", color: "#fff" }} className="ri-arrow-right-line"></i>
                                                            </button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                No pipeline details available.
                                            </Typography>
                                        )}
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
                                onChange={handleStageChange}
                                removeStage={() => removeStage(index)}
                            />
                            ))}
                        </SortableContext>
                        </DndContext>
                        <div className='flex gap-2 '>
                            <Button variant="outlined" onClick={addStage} sx={{ mt: 2 }}>
                                Add Stage
                            </Button>
                            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                                Create
                            </Button>
                        </div>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

        </Grid >
    );
};

export default PipelineManager;
