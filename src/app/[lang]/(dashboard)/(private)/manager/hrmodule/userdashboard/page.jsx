'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
    Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Typography, Box, Avatar, Paper, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import AttendanceCalendar from '../components/AttendanceCalendar';

const UserDashboard = () => {
    const { data: session, status } = useSession();

    // Basic user profile info
    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        avatar: '',
    });

    // If no real avatar is present, we generate a random color for the avatar.
    const [avatarColor, setAvatarColor] = useState('');

    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [leaveData, setLeaveData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        numberOfDays: '',
        reason: '',
        submittedTo: 'HR',
    });

    const [openProfileDialog, setOpenProfileDialog] = useState(false);
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Generate a random color
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Extract initials from name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase();
    };

    const fetchEmployeeByUserId = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hr/employee/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const employee = response.data;
            if (!employee) {
                return;
            }

            // Update the user profile data
            setUserProfile({
                name: employee.firstName && employee.lastName
                    ? `${employee.firstName} ${employee.lastName}`
                    : employee.name || '',
                email: employee.email,
                avatar: employee.avatar || '',
                department: employee.department,
                role: employee.role,
                company: employee.company ? employee.company.name : '',
            });
            setEmployeeDetails(employee);

            // Generate a random color if no real avatar exists
            if (!employee.avatar && !avatarColor) {
                setAvatarColor(getRandomColor());
            } else if (employee.avatar) {
                setAvatarColor('');
            }
        } catch (error) {
        }
    };

    // Fetch employee details once the session is ready
    useEffect(() => {
        if (status === "loading") return;
        if (session && session.user) {
            fetchEmployeeByUserId(session.user.id);
        }
    }, [session, status]);

    const handleProfileEdit = () => {
        setOpenProfileDialog(false);
    };

    // Updated handleLeaveApply: posts leave data with submittedTo set to "HR"
    const handleLeaveApply = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = {
                employeeId: employeeDetails ? employeeDetails._id : null,
                leaveType: leaveData.leaveType,
                leaveReason: leaveData.reason,
                leaveStartDate: leaveData.startDate,
                leaveEndDate: leaveData.endDate,
                noOfleaveDays: leaveData.numberOfDays,
                submittedTo: "HR",
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/apply-leave`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOpenLeaveDialog(false);
        } catch (error) {
            console.log(error);
        }
    };

    // Example tasks
    const tasks = [
        { id: 1, title: 'Complete project report', status: 'In Progress' },
        { id: 2, title: 'Attend team meeting', status: 'Pending' },
        { id: 3, title: 'Submit leave application', status: 'Completed' },
        { id: 4, title: 'Prepare presentation', status: 'In Progress' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Sidebar */}
            <div className="md:w-44 w-full border-b md:border-b-0 md:border-r border-gray-200 p-4">
                <div className="flex items-center justify-center mb-6">
                    {userProfile.avatar ? (
                        <Avatar
                            src={userProfile.avatar}
                            alt={userProfile.name || 'User Avatar'}
                            onClick={() => setOpenProfileDialog(true)}
                            style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <Avatar
                            onClick={() => setOpenProfileDialog(true)}
                            style={{
                                backgroundColor: avatarColor || '#555',
                                color: 'white',
                                cursor: 'pointer',
                                width: '60px',
                                height: '60px',
                                fontSize: '20px',
                            }}
                        >
                            {getInitials(userProfile.name || 'User Name')}
                        </Avatar>
                    )}
                </div>

                <nav className="space-y-1 items-center justify-center">
                    <div
                        className="flex lg:ml-5 items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => setOpenLeaveDialog(true)}
                    >
                        <span>Apply Leave</span>
                    </div>
                    <div className="flex lg:ml-5 items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                        <span>Dashboard</span>
                    </div>
                    <div className="flex lg:ml-5 items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                        <span>My Tasks</span>
                    </div>
                    <div className="flex lg:ml-5 items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                        <span>Settings</span>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 ">
                <ToastContainer />
                <Typography variant="h4" className="mb-4">
                    Hello, {userProfile.name}
                </Typography>
                <Typography variant="h6" className="mb-6">
                    How can I help you today?
                </Typography>

                {/* Attendance Calendar */}
                <Box mt={4} className="w-full p-4">
                    <Typography variant="h5" className="mb-4">
                        Yearly Attendance
                    </Typography>
                    {employeeDetails && employeeDetails._id ? (
                        <AttendanceCalendar employeeId={employeeDetails._id} />
                    ) : (
                        <div>Loading Attendance...</div>
                    )}
                </Box>

                {/* Tasks Section */}
                <Box mt={6}>
                    <Typography variant="h5" className="mb-4">
                        My Tasks
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tasks.map(task => (
                            <Paper
                                key={task.id}
                                elevation={0}
                                className="p-4 rounded-lg border border-gray-200"
                            >
                                <Typography variant="h6">{task.title}</Typography>
                                <Typography
                                    variant="body2"
                                    className={`text-sm ${task.status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}
                                >
                                    {task.status}
                                </Typography>
                            </Paper>
                        ))}
                    </div>
                </Box>
            </div>

            {/* Leave Application Dialog */}
            <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)}>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel id="leave-type-label">Leave Type</InputLabel>
                        <Select
                            labelId="leave-type-label"
                            value={leaveData.leaveType}
                            onChange={(e) =>
                                setLeaveData({ ...leaveData, leaveType: e.target.value })
                            }
                            label="Leave Type"
                        >
                            <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                            <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                            <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                            <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
                            <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                            <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
                            <MenuItem value="Emergency Leave">Emergency Leave</MenuItem>
                            <MenuItem value="Study Leave">Study Leave</MenuItem>
                            <MenuItem value="Unauthorized Leave">Unauthorized Leave</MenuItem>
                            <MenuItem value="Uninformed Leave">Uninformed Leave</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Start Date"
                        type="date"
                        value={leaveData.startDate}
                        onChange={(e) =>
                            setLeaveData({ ...leaveData, startDate: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={leaveData.endDate}
                        onChange={(e) =>
                            setLeaveData({ ...leaveData, endDate: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="No. Of Days"
                        type="number"
                        value={leaveData.numberOfDays}
                        onChange={(e) =>
                            setLeaveData({ ...leaveData, numberOfDays: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Reason"
                        value={leaveData.reason}
                        onChange={(e) =>
                            setLeaveData({ ...leaveData, reason: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLeaveDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleLeaveApply} color="primary">
                        Submit Leave Request
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UserDashboard;
