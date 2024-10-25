import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

function TaskForm({ addTask }) {
    const [task, setTask] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("clicked");

        if (task !== "") {
            addTask(task);
            setTask("");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <TextField
                size='small'
                label="New Task"
                variant="outlined"
                value={task}
                onChange={(e) => setTask(e.target.value)}
            />
            <Button size='small' type="submit" variant="contained" color="primary">
                Add
            </Button>
        </form>
    );
}

export default TaskForm;
