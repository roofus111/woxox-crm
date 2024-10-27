'use client'
import React, { useEffect, useState } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import { Container } from '@mui/material';

function TaskManager() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://13.127.160.185:8000/api/tasks/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    const addTask = async (taskText) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://13.127.160.185:8000/api/tasks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: taskText })
            });
            const newTask = await response.json();
            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

    const removeTask = async (id) => {
        const token = localStorage.getItem('token')
        try {
            await fetch(`http://13.127.160.185:8000/api/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            setTasks(tasks.filter(task => task._id !== id));
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    const toggleTask = async (id, isCompleted) => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`http://13.127.160.185:8000/api/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isCompleted: !isCompleted })
            });
            const updatedTask = await response.json();
            setTasks(tasks.map(task => task._id === id ? updatedTask : task));
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    return (
        <Container maxWidth="sm">
            <h2>Task Manager</h2>
            <br />
            <TaskForm addTask={addTask} />
            <TaskList tasks={tasks} removeTask={removeTask} toggleTask={toggleTask} />
        </Container>
    );
}

export default TaskManager;
