"use client"

import React, { useState, useEffect } from "react";
import { Table, Button, TableContainer, TableHead, TableRow, TableCell, TableBody, Checkbox, Modal, TextField, Select, MenuItem, Tabs, Tab, Box, Avatar, InputLabel, FormControl, IconButton, Tooltip } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const getRandomColor = (name) => {
    // Check if name is a valid string
    if (typeof name !== 'string' || name.length === 0) {
        return '#000000'; // Return a default color if name is invalid
    }

    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
        '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
        '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
        '#d35400', '#c0392b', '#7f8c8d'
    ];
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (firstName, lastName) => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
};

export default function AttendanceModule() {
    const [employees, setEmployees] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceFormOpen, setAttendanceFormOpen] = useState(false);
    const [attendanceForm, setAttendanceForm] = useState({
        id: "",
        employeeId: "",
        date: new Date().toISOString().split('T')[0],
        checkIn: "",
        checkOut: "",
        workType: "",
    });

    const [activeTab, setActiveTab] = useState(0);
    const [overtimeRecords, setOvertimeRecords] = useState([
        {
            id: 1,
            employeeId: 1,
            date: new Date().toISOString().split('T')[0],
            startTime: "",
            endTime: "",
            status: "Pending",
            hours: 0,
            reason: ""
        }
    ]);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchEmployees();
        fetchAttendanceForDate(selectedDate);
    }, [selectedDate]);

    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No authentication token found");
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/getemployees`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    limit: 1000 // assuming 1000 is higher than your total employees
                }
            });
            setEmployees(response.data.employees || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };


    const fetchAttendanceForDate = async (date) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No authentication token found");
            return;
        }

        // Set start and end date to the same day for a single day's attendance
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/getattendance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            console.log("Fetched Attendance Records:", response.data.attendance);
            setAttendanceRecords(response.data.attendance || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            setAttendanceRecords([]);
        }
    };

    const handleAttendanceFormChange = (field, value) => {
        setAttendanceForm({ ...attendanceForm, [field]: value });
        if (field === "date") {
            fetchAttendanceForDate(value);
        }
    };

    const handleAttendanceSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No authentication token found");
            return;
        }

        const payload = {
            employeeId: attendanceForm.employeeId,
            date: attendanceForm.date,
            checkInTime: attendanceForm.checkIn ? new Date(`${attendanceForm.date}T${attendanceForm.checkIn}`) : null,
            checkOutTime: attendanceForm.checkOut ? new Date(`${attendanceForm.date}T${attendanceForm.checkOut}`) : null,
            status: attendanceForm.workType,
        };

        try {
            // Check if attendance already exists
            const existingAttendance = attendanceRecords.find(record =>
                record.employeeId === attendanceForm.employeeId && record.date === attendanceForm.date
            );

            if (existingAttendance) {
                toast.error("Attendance for this employee on this date already exists!");
                return;
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/createattendence`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Attendance created:", response.data);
            setAttendanceFormOpen(false);
            fetchAttendanceForDate(attendanceForm.date);
            toast.success("Attendance added successfully!");
        } catch (error) {
            console.error("Error creating attendance:", error.response.data);
            toast.error("Failed to add attendance. Please try again.");
        }
    };

    const handleEditAttendance = (record) => {
        const employee = employees.find(emp => emp._id === record.employeeId);
        setAttendanceForm({
            id: record._id,
            employeeId: record.employeeId,
            date: record.date.split('T')[0],
            checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour12: false }) : "",
            checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour12: false }) : "",
            workType: record.status,
        });
        setSelectedEmployee(employee);
        setAttendanceFormOpen(true);
    };

    const handleUpdateAttendance = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No authentication token found");
            return;
        }

        const payload = {
            employeeId: attendanceForm.employeeId,
            date: attendanceForm.date,
            checkInTime: attendanceForm.checkIn ? new Date(`${attendanceForm.date}T${attendanceForm.checkIn}`) : null,
            checkOutTime: attendanceForm.checkOut ? new Date(`${attendanceForm.date}T${attendanceForm.checkOut}`) : null,
            status: attendanceForm.workType,
        };

        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/${attendanceForm.id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAttendanceFormOpen(false);
            fetchAttendanceForDate(attendanceForm.date);
            toast.success("Attendance updated successfully!");
        } catch (error) {
            console.error("Error updating attendance:", error.response.data);
            toast.error("Failed to update attendance. Please try again.");
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleWorkTypeChange = (employeeId, value) => {
        setEmployees(employees.map(emp =>
            emp.id === employeeId ? {
                ...emp,
                workType: value,
                // Reset check-in/out if marked as absent
                checkIn: value === "Absent" ? false : emp.checkIn,
                checkOut: value === "Absent" ? false : emp.checkOut,
                checkInTime: value === "Absent" ? "" : emp.checkInTime,
                checkOutTime: value === "Absent" ? "" : emp.checkOutTime,
                status: "Pending"
            } : emp
        ));
    };

    const handleCheckInOut = (employeeId, field) => {
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        setEmployees(employees.map(emp =>
            emp.id === employeeId ? {
                ...emp,
                [field]: true,
                [`${field}Time`]: currentTime
            } : emp
        ));
    };

    const handleTimeChange = (employeeId, field, value) => {
        setEmployees(employees.map(emp =>
            emp.id === employeeId ? { ...emp, [field]: value } : emp
        ));
    };

    const validateAttendance = (employeeId) => {
        setEmployees(employees.map(emp => {
            if (emp.id === employeeId) {
                let status = "Invalid";

                if (emp.workType === "Absent") {
                    status = "Valid"; // Absent is always valid
                } else if (emp.checkIn && emp.checkOut && emp.workType) {
                    const checkIn = new Date(`2000/01/01 ${emp.checkInTime}`);
                    const checkOut = new Date(`2000/01/01 ${emp.checkOutTime}`);
                    status = checkOut > checkIn ? "Valid" : "Invalid Time";
                }
                return { ...emp, status };
            }
            return emp;
        }));
    };

    const handleOvertimeChange = (id, field, value) => {
        setOvertimeRecords(overtimeRecords.map(record =>
            record.id === id ? { ...record, [field]: value } : record
        ));
    };

    const validateOvertime = (id) => {
        setOvertimeRecords(overtimeRecords.map(record => {
            if (record.id === id) {
                let status = "Approved";
                if (record.reason.trim() === "") {
                    status = "Rejected";
                }
                return { ...record, status };
            }
            return record;
        }));
    };

    const handleAttendanceFormOpen = () => {
        setAttendanceForm({
            id: "",
            employeeId: "",
            date: new Date().toISOString().split('T')[0],
            checkIn: "",
            checkOut: "",
            workType: "",
        });
        setSelectedEmployee(null);
        setAttendanceFormOpen(true);
    };

    const openAddAttendanceModal = () => {
        setAttendanceForm({
            id: "",
            employeeId: "",
            date: new Date().toISOString().split('T')[0],
            checkIn: "",
            checkOut: "",
            workType: "",
        });
        setAttendanceFormOpen(true);
    };

    const columns = [
        { id: 'employee', label: 'Employee' },
        { id: 'date', label: 'Date', render: (record) => new Date(record.date).toLocaleDateString() },
        { id: 'checkInTime', label: 'Check-In', render: (record) => record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "N/A" },
        { id: 'checkOutTime', label: 'Check-Out', render: (record) => record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : "N/A" },
        { id: 'status', label: 'Status' },
        // { id: 'workType', label: 'Work Type' },
        {
            id: 'actions',
            label: 'Actions',
            render: (record) => (
                <Tooltip title="Edit Attendance" arrow>
                    <IconButton
                        color="primary"
                        onClick={() => handleEditAttendance(record)}
                    >
                        <i className="ri-edit-line"></i>
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <div className="p-4 space-y-8" style={{ borderRadius: '8px', padding: '16px' }}>
            <ToastContainer />
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center">
                    Attendance
                    <Tooltip title="Add Attendance" arrow>
                        <IconButton color="primary" onClick={openAddAttendanceModal} style={{ marginLeft: '8px' }}>
                            <i className="ri-add-line"></i>
                        </IconButton>
                    </Tooltip>
                </h1>
                <Tooltip title="Select Date to filter attendance" arrow>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                </Tooltip>
            </header>

            <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="View Attendance" />
            </Tabs>

            {activeTab === 0 && (
                <TableContainer style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedRows.length === attendanceRecords.length}
                                        onChange={() => {
                                            if (selectedRows.length === attendanceRecords.length) {
                                                setSelectedRows([]);
                                            } else {
                                                setSelectedRows(attendanceRecords.map(record => record._id));
                                            }
                                        }}
                                    />
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell key={column.id} style={{ borderBottom: '2px dotted yellow' }}>{column.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceRecords.map((record) => {
                                const isSelected = selectedRows.includes(record._id);
                                return (
                                    <TableRow
                                        key={record._id}
                                        hover
                                        selected={isSelected}
                                        onClick={() => setSelectedRows(isSelected ? selectedRows.filter(id => id !== record._id) : [...selectedRows, record._id])}
                                        style={{ backgroundColor: isSelected ? '#FFEB3B' : 'transparent' }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isSelected} />
                                        </TableCell>
                                        {columns.map((column) => (
                                            <TableCell key={column.id}>
                                                {column.id === 'employee' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar style={{ backgroundColor: getRandomColor(record.employeeId.firstName + ' ' + record.employeeId.lastName), color: 'white' }}>
                                                            {getInitials(record.employeeId.firstName, record.employeeId.lastName)}
                                                        </Avatar>
                                                        <span className='text-sm ml-4'>{record.employeeId.firstName} {record.employeeId.lastName}</span>
                                                    </div>
                                                ) : column.render ? column.render(record) : record[column.id]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Attendance Modal */}
            <Modal open={attendanceFormOpen} onClose={() => setAttendanceFormOpen(false)}>
                <div className="p-6 bg-white rounded-lg shadow-lg space-y-4 max-w-sm mx-auto mt-20">
                    <h2 className="text-lg font-semibold">{attendanceForm.id ? "Edit Attendance" : "Add Attendance"}</h2>
                    <form className="space-y-4">
                        {selectedEmployee && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                                <p className="mt-1 text-sm text-gray-600">{`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</p>
                            </div>
                        )}
                        {!attendanceForm.id && (
                            <FormControl fullWidth>
                                <InputLabel id="employee-select-label">Select Employee</InputLabel>
                                <Select
                                    labelId="employee-select-label"
                                    value={attendanceForm.employeeId}
                                    onChange={(e) => handleAttendanceFormChange("employeeId", e.target.value)}
                                >
                                    <MenuItem value="">Select Employee</MenuItem>
                                    {Array.isArray(employees) && employees.length > 0 ? (
                                        employees.map((employee) => (
                                            <MenuItem key={employee._id} value={employee._id}>
                                                {employee.firstName} {employee.lastName}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">No Employees Available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        )}
                        <TextField
                            label="Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={attendanceForm.date}
                            onChange={(e) => handleAttendanceFormChange("date", e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Check-In"
                            type="time"
                            InputLabelProps={{ shrink: true }}
                            value={attendanceForm.checkIn}
                            onChange={(e) => handleAttendanceFormChange("checkIn", e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Check-Out"
                            type="time"
                            InputLabelProps={{ shrink: true }}
                            value={attendanceForm.checkOut}
                            onChange={(e) => handleAttendanceFormChange("checkOut", e.target.value)}
                            fullWidth
                        />
                        <Select
                            value={attendanceForm.workType}
                            onChange={(e) => handleAttendanceFormChange("workType", e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">Select Work Type</MenuItem>
                            <MenuItem value="Present">Present</MenuItem>
                            <MenuItem value="Absent">Absent</MenuItem>
                            <MenuItem value="Late">Late</MenuItem>
                            <MenuItem value="Leave">Leave</MenuItem>
                            <MenuItem value="Remote">Remote</MenuItem>
                            <MenuItem value="OD">OD</MenuItem>
                            <MenuItem value="Half Day">Half Day</MenuItem>
                            <MenuItem value="LOP">LOP</MenuItem>
                        </Select>
                        <div className="flex justify-end space-x-4">
                            <Button onClick={() => setAttendanceFormOpen(false)}>Cancel</Button>
                            <Button variant="contained" onClick={attendanceForm.id ? handleUpdateAttendance : handleAttendanceSubmit}>
                                {attendanceForm.id ? "Update" : "Submit"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
