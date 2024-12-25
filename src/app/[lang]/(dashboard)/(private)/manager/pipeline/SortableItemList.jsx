import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TextField, IconButton, Grid, Typography } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const SortableItem = ({ id, stage, onChange, removeStage }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: '16px',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Grid container alignItems="center" spacing={2}>
                <Grid item>
                    <IconButton {...listeners}>
                        drag
                    </IconButton>
                </Grid>
                <Grid item xs>
                    <TextField
                        fullWidth
                        value={stage.name}
                        onChange={onChange}
                        label="Stage Name"
                        variant="outlined"
                    />
                </Grid>
                <Grid item>
                    <IconButton onClick={removeStage} color="secondary">
                        delete
                    </IconButton>
                </Grid>
            </Grid>
        </div>
    );
};

export default SortableItem;
