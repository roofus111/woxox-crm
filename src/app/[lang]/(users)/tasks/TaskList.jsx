'use client'
import React from 'react';
import { List, ListItem, ListItemText, IconButton, Checkbox } from '@mui/material';


function TaskList({ tasks, removeTask, toggleTask }) {
    return (
        <List>
            {tasks.map((task) => (
                <ListItem key={task._id} style={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                    <Checkbox
                        edge="start"
                        checked={task.isCompleted}
                        onChange={() => toggleTask(task._id, task.isCompleted)}
                    />
                    <ListItemText primary={task.text} />
                    <IconButton edge="end" aria-label="delete" onClick={() => removeTask(task._id)}>
                        <i class="ri-delete-bin-fill"></i>
                    </IconButton>
                </ListItem>
            ))}
        </List>
    );
}

export default TaskList;
