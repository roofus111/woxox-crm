import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TextField, IconButton, Grid, MenuItem } from '@mui/material';

const stageProperties = ['Pending', 'Processing', 'Won', 'Lost'];

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
          <IconButton {...listeners} tabIndex={0}>
            <i className="ri-draggable"></i>
          </IconButton>
        </Grid>
        <Grid item xs>
        <TextField
            fullWidth
            value={stage.name}
            onChange={(e) => onChange(id, 'name', e.target.value)}
            label="Stage Name"
            variant="outlined"
        />
        </Grid>
        <Grid item xs>
        <TextField
            fullWidth
            select
            label="Property"
            value={stage.property || 'Pending'}
            onChange={(e) => onChange(id, 'property', e.target.value)}
            variant="outlined"
        >
            {stageProperties.map((option) => (
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>
            ))}
        </TextField>
        </Grid>
        <Grid item>
          <IconButton onClick={() => removeStage(id)} color="secondary">
            <i className="ri-delete-bin-line text-red-500"></i>
          </IconButton>
        </Grid>
      </Grid>
    </div>
  );
};

export default SortableItem;
