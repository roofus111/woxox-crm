"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    Button,
    Modal,
    TextField,
    Tabs,
    Tab,
    Box,
    Avatar,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";

const getRandomColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#95a5a6",
        "#f39c12",
        "#d35400",
        "#c0392b",
        "#7f8c8d",
    ];
    return colors[Math.abs(hash) % colors.length];
};

export default function LeaveSection() {
    const today = new Date().toISOString().split("T")[0];
    const [filter, setFilter] = useState({
        startDate: today,
        endDate: today,
        employeeId: "",
    });

    const [activeTab, setActiveTab] = useState(0);
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [leaveFormOpen, setLeaveFormOpen] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        employeeId: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const leaveTypes = [
        { value: "Sick Leave", label: "Sick Leave" },
        { value: "Casual Leave", label: "Casual Leave" },
        { value: "Annual Leave", label: "Annual Leave" },
        { value: "Uninformed Leave", label: "Uninformed Leave" },
    ];

    const getInitials = (name) =>
        name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase();

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleLeaveFormChange = (field, value) => {
        setLeaveForm({ ...leaveForm, [field]: value });
    };

    const handleLeaveSubmit = () => {
        const newApplication = {
            ...leaveForm,
            id: leaveApplications.length + 1,
            status: "Pending",
            appliedDate: new Date().toISOString(),
        };
        setLeaveApplications([...leaveApplications, newApplication]);
        setLeaveFormOpen(false);
        setLeaveForm({
            employeeId: "",
            leaveType: "",
            startDate: "",
            endDate: "",
            reason: "",
        });
    };

    const handleLeaveAction = async (applicationId, action) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/approve/${applicationId}`,
                {
                    attendanceId: applicationId,  // sending the leave/attendance ID
                    action: action                // sending the action to perform
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("API response:", response.data);

            // Update local state on success
            if (response.data.success) {
                setLeaveApplications(
                    leaveApplications.map((app) =>
                        app.id === applicationId
                            ? { ...app, leaveDetails: { ...app.leaveDetails, status: action } }
                            : app
                    )
                );
            }
        } catch (error) {
            console.error("Error updating leave application:", error);
            // Optionally add user notification or further error handling here.
        }
    };


    const fetchEmployees = async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hr/getemployees`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 1000 },
                }
            );
            console.log("Fetched employees:", response.data);
            setEmployees(response.data.employees);
            setTotalCount(response.data.total);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Fetch pending leave requests using your API.

    const fetchLeaveApplications = async () => {
        const token = localStorage.getItem("token");
        if (!filter.startDate || !filter.endDate) {
            console.error("Please provide start date and end date");
            return;
        }
        setLoading(true);
        try {
            const params = {
                startDate: filter.startDate,
                endDate: filter.endDate,
            };
            if (filter.employeeId && filter.employeeId.trim()) {
                params.employeeId = filter.employeeId;
            }
            console.log("Fetching leave applications with params:", params);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/leave-requests`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                }
            );
            console.log("Fetched leave requests:", response.data);
            let leaveData = response.data.data || [];
            if (filter.employeeId) {
                leaveData = leaveData.filter(
                    (application) => application.employeeDetails?.id === filter.employeeId
                );
            }
            setLeaveApplications(leaveData);
        } catch (error) {
            console.error("Error fetching leave requests:", error);
            setLeaveApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveApplications();
    }, [filter.startDate, filter.endDate, filter.employeeId]);

    const handleFilterChange = (field, value) => {
        setFilter({ ...filter, [field]: value });
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setDrawerOpen(true);
    };

    const drawerStyles = {
        width: "600px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    };

    return (
        <div className="p-4 space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Leave Management</h1>
            </header>

            {/* Filter Section for dates and employee */}
            <div className="p-4 border rounded-md space-y-4">
                <h2 className="text-xl font-semibold">Filter Leave Requests</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <TextField
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={filter.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={filter.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel id="filter-employee-label">Employee</InputLabel>
                        <Select
                            labelId="filter-employee-label"
                            label="Employee"
                            value={filter.employeeId}
                            onChange={(e) =>
                                handleFilterChange("employeeId", e.target.value)
                            }
                        >
                            <MenuItem value="">All Employees</MenuItem>
                            {employees.map((employee) => (
                                <MenuItem key={employee._id} value={employee._id}>
                                    {employee.firstName} {employee.lastName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* <Button variant="contained" color="primary" onClick={fetchLeaveApplications}>
                        Fetch Leave Requests
                    </Button> */}
                </div>
            </div>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }} className="flex">
                <Box className="w-3/4">
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Leave Applications" />
                    </Tabs>
                </Box>
            </Box>

            <section className="overflow-hidden rounded-t-2xl border border-gray-200">
                <Table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="py-5 px-4 text-left text-sm font-medium text-gray-500 border-b border-r">
                                Employee
                            </th>
                            <th className="py-5 px-4 text-left text-sm font-medium text-gray-500 border-b border-r">
                                Leave Type
                            </th>
                            <th className="py-5 px-4 text-left text-sm font-medium text-gray-500 border-b border-r">
                                Start Date
                            </th>
                            <th className="py-5 px-4 text-left text-sm font-medium text-gray-500 border-b border-r">
                                End Date
                            </th>
                            <th className="py-5 px-4 text-left text-sm font-medium text-gray-500 border-b border-r">
                                Reason
                            </th>
                            <th className="py-5 px-4 text-left text-sm font-medium text-gray-500 border-b border-r">
                                Status
                            </th>
                            <th className="py-5 px-4 text-left text-sm font-medium text-gray-500 border-b">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveApplications.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4">
                                    No leave applications found.
                                </td>
                            </tr>
                        ) : (
                            leaveApplications.map((application) => {
                                const status = application.leaveDetails?.status || "Pending";
                                const employee = application.employeeDetails;
                                const leave = application.leaveDetails;
                                return (
                                    <tr key={application.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-4 border-b border-r">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer"
                                                onClick={() => handleEmployeeClick(employee)}
                                            >
                                                <Avatar
                                                    src={employee?.image}
                                                    sx={{
                                                        bgcolor: getRandomColor(employee?.firstName || ""),
                                                        color: "white",
                                                        width: 32,
                                                        height: 32,
                                                    }}
                                                >
                                                    {employee?.firstName
                                                        ? getInitials(employee.firstName)
                                                        : "U"}
                                                </Avatar>
                                                <span>{employee?.name || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 border-b border-r">
                                            {leave?.type || "N/A"}
                                        </td>
                                        <td className="py-4 px-4 border-b border-r">
                                            {leave?.startDate
                                                ? new Date(leave.startDate).toLocaleDateString()
                                                : application.appliedDate
                                                    ? new Date(application.appliedDate).toLocaleDateString()
                                                    : "N/A"}
                                        </td>
                                        <td className="py-4 px-4 border-b border-r">
                                            {leave?.endDate
                                                ? new Date(leave.endDate).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="py-4 px-4 border-b border-r">
                                            {leave?.reason || "N/A"}
                                        </td>
                                        <td className="py-4 px-4 border-b border-r">
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm ${status === "Approved"
                                                    ? "bg-green-50 text-green-800"
                                                    : status === "Rejected"
                                                        ? "bg-red-50 text-red-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 border-b">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    className="text-green-500 border border-green-500 hover:bg-green-100"
                                                    onClick={() =>
                                                        handleLeaveAction(application.id, "Approved")
                                                    }
                                                    disabled={status !== "Pending"}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    className="text-red-500 border border-red-500 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleLeaveAction(application.id, "Rejected")
                                                    }
                                                    disabled={status !== "Pending"}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </section>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <div className="p-4" style={drawerStyles}>
                    {selectedEmployee && (
                        <div className="flex flex-col w-full items-center">
                            <Avatar
                                src={selectedEmployee.image}
                                sx={{
                                    bgcolor: getRandomColor(selectedEmployee.firstName),
                                    color: "white",
                                    width: 64,
                                    height: 64,
                                }}
                            >
                                {selectedEmployee.firstName
                                    ? getInitials(selectedEmployee.firstName)
                                    : "U"}
                            </Avatar>
                            <h2 className="text-lg font-semibold mt-2">
                                {selectedEmployee.name}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {selectedEmployee.department}
                            </p>
                            <p className="text-sm text-gray-500">
                                {selectedEmployee.email}
                            </p>
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
