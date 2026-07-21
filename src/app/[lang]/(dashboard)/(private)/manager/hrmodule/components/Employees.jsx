'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    Dialog,
    Drawer,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem,
    Switch,
    InputLabel,
    Typography,
    Avatar,
    Chip,
    Tooltip,
    TablePagination,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const EmployeeAvatar = ({ employee, onClick }) => {
    const firstLetter = employee.firstName.charAt(0).toUpperCase();
    const [bgColor, setBgColor] = useState('');

    useEffect(() => {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        setBgColor(employee.profilePic ? 'transparent' : randomColor);
    }, [employee.profilePic]);

    return (
        <Avatar
            src={employee.profilePic || ''}
            alt={`${employee.firstName}'s avatar`}
            style={{ backgroundColor: bgColor }}
            className='cursor-pointer'
            onClick={onClick}
        >
            {!employee.profilePic && <span style={{ color: 'white' }}>{firstLetter}</span>}
        </Avatar>
    );
};


const EmployeeApprovalDrawer = ({ open, onClose, employee }) => {
    if (!employee) return null;

    const firstLetter = employee.firstName.charAt(0).toUpperCase();
    const generateConsistentColor = (id) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    const bgColor = generateConsistentColor(employee._id);

    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    return (
        <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
            style: {
                width: "700px",
                backgroundColor: "white",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                overflowY: "auto",
                padding: "20px",
            },
        }}
    >
        <div className="p-4 h-full relative">
            {/* Header with title and close button */}
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h6" className="font-semibold">
                    Employee Details
                </Typography>
                {/* <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<i className="ri-pencil-line"></i>}
                    onClick={() => {
                        router.push(`/manager/hrmodule/edit-employee/${employee._id}`);
                    }}
                >
                    Edit
                </Button> */}
            </div>

            {/* Profile section */}
            <div className="flex items-center mb-8">
                <Avatar
                    src={employee.profilePic || ''}
                    alt={`${employee.firstName}'s avatar`}
                    style={{ 
                        backgroundColor: bgColor,
                        width: 64,
                        height: 64
                    }}
                >
                    {!employee.profilePic && <span style={{ color: 'white' }}>{firstLetter}</span>}
                </Avatar>
                <div className="ml-4">
                    <Typography variant="h6" className="font-semibold">
                        {employee.firstName} {employee.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {employee.jobTitle || employee.role}
                    </Typography>
                </div>
            </div>

            {/* Main content with form-like display */}
            <div className="space-y-6">
                {/* Name field */}
                <div>
                    <Typography variant="caption" color="textSecondary" className="block mb-1">
                        Name
                    </Typography>
                    <TextField
                        fullWidth
                        value={`${employee.firstName} ${employee.lastName}`}
                        InputProps={{
                            readOnly: true,
                            disableUnderline: true,
                        }}
                        variant="outlined"
                    />
                </div>

                {/* Position and Division fields side by side */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Typography variant="caption" color="textSecondary" className="block mb-1">
                            Role
                        </Typography>
                        <TextField
                            fullWidth
                            value={employee.role || ""}
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                            }}
                            variant="outlined"
                        />
                    </div>
                    <div className="flex-1">
                        <Typography variant="caption" color="textSecondary" className="block mb-1">
                            Department
                        </Typography>
                        <TextField
                            fullWidth
                            value={employee.department || ""}
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                            }}
                            variant="outlined"
                        />
                    </div>
                </div>

                {/* Gender and Age fields side by side */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Typography variant="caption" color="textSecondary" className="block mb-1">
                            Gender
                        </Typography>
                        <TextField
                            fullWidth
                            value={employee.gender || ""}
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                            }}
                            variant="outlined"
                        />
                    </div>
                    <div className="flex-1">
                        <Typography variant="caption" color="textSecondary" className="block mb-1">
                            Age
                        </Typography>
                        <TextField
                            fullWidth
                            value={employee.dateOfBirth ? calculateAge(employee.dateOfBirth) + " years" : ""}
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                            }}
                            variant="outlined"
                        />
                    </div>
                </div>

                {/* Email and Employee ID fields side by side */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Typography variant="caption" color="textSecondary" className="block mb-1">
                            Email
                        </Typography>
                        <TextField
                            fullWidth
                            value={employee.email || ""}
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                            }}
                            variant="outlined"
                        />
                    </div>
                    <div className="flex-1">
                        <Typography variant="caption" color="textSecondary" className="block mb-1">
                            Salary
                        </Typography>
                        <TextField
                            fullWidth
                            value={employee.salary ? `₹ ${employee.salary}` : ""}
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                            }}
                            variant="outlined"
                        />
                    </div>
                </div>

                {/* Address field */}
                <div>
                    <Typography variant="caption" color="textSecondary" className="block mb-1">
                        Address
                    </Typography>
                    <TextField
                        fullWidth
                        value={employee.address ? 
                            `${employee.address.street || ''}, ${employee.address.city || ''}, ${employee.address.state || ''} ${employee.address.zipCode || ''}` : 
                            ""}
                        InputProps={{
                            readOnly: true,
                            disableUnderline: true,
                        }}
                        variant="outlined"
                    />
                </div>

                {/* Phone number field */}
                <div>
                    <Typography variant="caption" color="textSecondary" className="block mb-1">
                        Phone number
                    </Typography>
                    <TextField
                        fullWidth
                        value={employee.phoneNumber || ""}
                        InputProps={{
                            readOnly: true,
                            disableUnderline: true,
                        }}
                        variant="outlined"
                    />
                </div>

                {/* Tags field */}
                <div>
                    <Typography variant="caption" color="textSecondary" className="block mb-1">
                        Tags
                    </Typography>
                    <div className="p-2 border border-gray-300 rounded-md min-h-[42px]">
                        {employee.tags ? (
                            <div className="flex flex-wrap gap-1">
                                {employee.tags.map((tag, index) => (
                                    <Chip key={index} label={tag} size="small" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                <Chip label={employee.role || "Employee"} size="small" />
                                <Chip label={employee.department || "General"} size="small" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Applied field */}
                <div>
                    <Typography variant="caption" color="textSecondary" className="block mb-1">
                        Date Joined
                    </Typography>
                    <TextField
                        fullWidth
                        value={employee.startDate ? new Date(employee.startDate).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }) : ""}
                        InputProps={{
                            readOnly: true,
                            disableUnderline: true,
                            startAdornment: (
                                <i className="ri-calendar-line mr-2"></i>
                            ),
                        }}
                        variant="outlined"
                    />
                </div>

                {/* Attachments section */}
                {employee.attachments && employee.attachments.length > 0 && (
                    <div className="mt-6">
                        <Typography variant="subtitle1" className="font-medium mb-2">
                            Documents
                        </Typography>
                        <div className="space-y-2">
                            {employee.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                                    <div className="flex items-center">
                                        <i className="ri-file-text-line text-blue-500 mr-2"></i>
                                        <Typography variant="body2">
                                            {attachment.fileName}
                                        </Typography>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="small" 
                                            variant="text" 
                                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                                        >
                                            View
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant="text"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = attachment.fileUrl;
                                                link.download = attachment.fileName;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activity History collapsible section */}
                {employee.history && employee.history.length > 0 && (
                    <div className="mt-6">
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<i className="ri-arrow-down-s-line"></i>}
                                aria-controls="history-content"
                                id="history-header"
                            >
                                <Typography variant="subtitle1" className="font-medium">Activity History</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {employee.history.map((activity, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <Chip
                                                    label={activity.activityType}
                                                    size="small"
                                                    color={
                                                        activity.activityType.includes("Created") ? "success" :
                                                        activity.activityType.includes("Updated") ? "primary" :
                                                        "default"
                                                    }
                                                    className="mb-2"
                                                />
                                                <Typography className="text-xs text-gray-400">
                                                    {new Date(activity.changedAt).toLocaleString()}
                                                </Typography>
                                            </div>
                                            <Typography className="text-sm text-gray-600">{activity.description}</Typography>
                                        </div>
                                    ))}
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                )}
            </div>

            {/* Bottom action buttons */}
            <div className="flex justify-between mt-8">
                <Button 
                    variant="outlined" 
                    onClick={onClose}
                >
                    Cancel
                </Button>
                {!employee.User && (
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                            // Grant access logic can be called here
                            onClose();
                        }}
                    >
                        Grant Access
                    </Button>
                )}
            </div>
        </div>
    </Drawer>
    );
};

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        dateOfBirth: '',
        department: '',
        role: '',
        status: 'Active',
    });
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter();

    // Fetch employees whenever page or rowsPerPage changes
    useEffect(() => {
        fetchEmployees();
    }, [page, rowsPerPage]);

    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        console.log("Fetching employees with token:", token);
        try {
            // Assuming your API supports pagination using page & limit query params
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hr/getemployees?page=${page + 1}&limit=${rowsPerPage}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Fetched employees:", response.data);
            // Expecting the API to return { employees: [...], totalCount: number }
            setEmployees(response.data.employees);
            setTotalCount(response.data.total);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (employee = null) => {
        setCurrentEmployee(employee);
        setFormData(
            employee
                ? {
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    email: employee.email,
                    phoneNumber: employee.phoneNumber,
                    gender: employee.gender || '',
                    dateOfBirth: employee.dateOfBirth || '',
                    department: employee.department || '',
                    role: employee.role || '',
                    status: employee.status || 'Active',
                }
                : {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    gender: '',
                    dateOfBirth: '',
                    department: '',
                    role: '',
                    status: 'Active',
                }
        );
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentEmployee(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (currentEmployee) {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/putemployees/${currentEmployee._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/create`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            // Reload employees for current page after save
            fetchEmployees();
            handleClose();
        } catch (error) {
            console.error("Error saving employee:", error);
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        try {
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hr/employees/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchEmployees();
        } catch (error) {
            console.error("Error updating employee status:", error);
        }
    };

    const handleAddEmployee = () => {
        router.push('/manager/hrmodule/add-employee');
    };

    const handleEditEmployee = (employee) => {
        router.push(`/manager/hrmodule/edit-employee/${employee._id}`);
    };

    const handleAvatarClick = (employee) => {
        setSelectedEmployee(employee);
        setOpenDrawer(true);
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setSelectedEmployee(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleGetAccess = async (employee) => {
        const token = localStorage.getItem('token');
        try {
            const registrationBody = {
                email: employee.email,
                password: `${employee.firstName}@CRMpass24`,
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hr/linkEmployeeUser/${employee._id}`,
                registrationBody,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`Access granted to employee: ${employee.firstName}`);

            fetchEmployees();
        } catch (error) {
            console.error("Error granting access:", error);
        }
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <Tooltip title="Add Employee" placement="right">
                <IconButton variant="contained" onClick={handleAddEmployee} className="mb-4">
                    <i className="ri-user-add-fill text-blue-600"></i>
                </IconButton>
            </Tooltip>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Profile</TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Access</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <TableRow key={employee._id}>
                                    <TableCell>
                                        <EmployeeAvatar
                                            employee={employee}
                                            onClick={() => handleAvatarClick(employee)}
                                        />
                                    </TableCell>
                                    <TableCell>{employee.firstName}</TableCell>
                                    <TableCell>{employee.lastName}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    <TableCell>{employee.phoneNumber}</TableCell>
                                    <TableCell>{employee.department}</TableCell>
                                    <TableCell>{employee.role}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={employee.status === 'Active'}
                                            onChange={() => handleStatusChange(employee._id, employee.status)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {employee.User ? (
                                            <Typography variant="body2" color="green">
                                                Access Granted
                                            </Typography>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleGetAccess(employee)}
                                            >
                                                Give Access
                                            </Button>
                                        )
                                        }
                                    </TableCell>

                                    <TableCell>
                                        <IconButton onClick={() => handleEditEmployee(employee)}>
                                            <i className="ri-edit-line text-blue-500"></i>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No More Employees
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="firstName"
                        label="First Name"
                        type="text"
                        fullWidth
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="lastName"
                        label="Last Name"
                        type="text"
                        fullWidth
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="phoneNumber"
                        label="Phone Number"
                        type="text"
                        fullWidth
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="gender"
                        label="Gender"
                        type="text"
                        fullWidth
                        value={formData.gender}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        fullWidth
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                        margin="dense"
                        name="department"
                        labelId="department-label"
                        fullWidth
                        value={formData.department}
                        onChange={handleChange}
                    >
                        <MenuItem value="IT">IT</MenuItem>
                        <MenuItem value="Sales">Sales</MenuItem>
                        <MenuItem value="HR">HR</MenuItem>
                        <MenuItem value="Finance">Finance</MenuItem>
                    </Select>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        margin="dense"
                        name="role"
                        labelId="role-label"
                        fullWidth
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <MenuItem value="Manager">Manager</MenuItem>
                        <MenuItem value="Team Lead">Team Lead</MenuItem>
                        <MenuItem value="Counselor">Counselor</MenuItem>
                        <MenuItem value="Developer">Developer</MenuItem>
                    </Select>
                    <Select
                        margin="dense"
                        name="status"
                        label="Status"
                        fullWidth
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{currentEmployee ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            <EmployeeApprovalDrawer open={openDrawer} onClose={handleCloseDrawer} employee={selectedEmployee} />
        </div>
    );
};

export default Employees;
