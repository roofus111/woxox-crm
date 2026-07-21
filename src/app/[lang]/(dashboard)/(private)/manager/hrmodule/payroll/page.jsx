'use client'

import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Avatar, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider, Chip } from '@mui/material';
import axios from 'axios';
import PayrollForm from './payrollform/page';

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const PayrollSection = () => {
    const [employees, setEmployees] = useState([]);
    const [totals, setTotals] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [payrollData, setPayrollData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [viewDetails, setViewDetails] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPayrollData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const calculatedEmployees = response.data.map(emp => ({
                ...emp,
                avatarColor: getRandomColor()
            }));
            setEmployees(calculatedEmployees);
            const calculatedTotals = {
                basicPay: response.data.reduce((sum, emp) => sum + emp.baseSalary, 0),
                additions: response.data.reduce((sum, emp) => sum + emp.totalExtraEarnings, 0),
                grossPay: response.data.reduce((sum, emp) => sum + emp.monthlySalary, 0),
                deductions: response.data.reduce((sum, emp) => sum + emp.totalDeductions, 0),
                netPay: response.data.reduce((sum, emp) => sum + emp.netSalary, 0),
            };
            setTotals(calculatedTotals);
        } catch (error) {
            console.error("Error fetching payroll data:", error);
        }
    };

    useEffect(() => {
        fetchPayrollData();
    }, []);

    const handleEdit = (employeeId) => {
        const employeeToEdit = employees.find(emp => emp._id === employeeId);
        setPayrollData(employeeToEdit);
        setShowForm(true);
        setEditingEmployeeId(employeeId);
    };

    const handleView = async (employeeId) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSelectedEmployee(response.data);
            setViewDetails(true);
        } catch (error) {
            console.error("Error fetching employee details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (employeeId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setEmployees((prevEmployees) => prevEmployees.filter(emp => emp._id !== employeeId));
                console.log("Employee payroll deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting employee payroll:", error);
        }
    };

    const toggleCreateForm = () => {
        setShowForm(prev => !prev);
        if (showForm) {
            setIsCreating(false);
            setPayrollData(null);
        } else {
            setIsCreating(true);
        }
    };

    const toggleEditForm = () => {
        setShowForm(prev => !prev);
        if (showForm) {
            setIsEditing(false);
            setEditingEmployeeId(null);
            setPayrollData(null);
        }
    };

    const handleEditSuccess = (updatedEmployee) => {
        setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => (emp._id === updatedEmployee._id ? updatedEmployee : emp))
        );
        fetchPayrollData();
    };

    const closeDetailsDialog = () => {
        setViewDetails(false);
        setSelectedEmployee(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <Paper style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Payroll Section
                <IconButton color="primary" onClick={toggleCreateForm} style={{ transition: 'transform 0.3s ease' }}>
                    {isCreating ? <i className="ri-close-large-fill text-red-500"></i> : <i className="ri-add-line"></i>}
                </IconButton>
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
                <Table sx={{ border: 'none' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Avatar</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Monthly Salary</TableCell>
                            <TableCell>Base Salary</TableCell>
                            <TableCell>Extra Earnings</TableCell>
                            <TableCell>Total Deductions</TableCell>
                            <TableCell>Net Salary</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(employees) && employees.map((employee, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Avatar style={{ backgroundColor: employee.avatarColor, color: 'white' }}>
                                        {employee.employeeName.charAt(0).toUpperCase()}
                                    </Avatar>
                                </TableCell>
                                <TableCell>{employee.employeeName}</TableCell>
                                <TableCell>{employee.department}</TableCell>
                                <TableCell>₹{employee.monthlySalary.toFixed(2)}</TableCell>
                                <TableCell>₹{employee.baseSalary.toFixed(2)}</TableCell>
                                <TableCell>₹{employee.totalExtraEarnings.toFixed(2)}</TableCell>
                                <TableCell>₹{employee.totalDeductions.toFixed(2)}</TableCell>
                                <TableCell>₹{employee.netSalary.toFixed(2)}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleView(employee._id)} style={{ transition: 'transform 0.3s ease' }}>
                                        <i className="ri-eye-line text-green-500"></i>
                                    </IconButton>
                                    <IconButton color="primary" onClick={() => handleEdit(employee._id)} style={{ transition: 'transform 0.3s ease' }}>
                                        {isEditing ? <i className="ri-close-large-fill text-red-500"></i> : <i className="ri-edit-line text-blue-500"></i>}
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(employee._id)} color="secondary">
                                        <i className="ri-delete-bin-4-line text-red-500"></i>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableHead>
                        {/* <TableRow>
                            <TableCell><strong>GRAND TOTAL</strong></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>₹{totals.basicPay?.toFixed(2)}</TableCell>
                            <TableCell>₹{totals.additions?.toFixed(2)}</TableCell>
                            <TableCell>₹{totals.deductions?.toFixed(2)}</TableCell>
                            <TableCell>₹{totals.netPay?.toFixed(2)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow> */}
                    </TableHead>
                </Table>
            </TableContainer>
            <Box display="flex" justifyContent="flex-end" mt={4}>
                <Button className="px-4 py-2 cursor-pointer bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                    Continue
                </Button>
            </Box>

            {showForm && (
                <div style={{ borderRadius: '8px', padding: '20px', transition: 'opacity 0.3s ease', marginTop: '20px' }}>
                    <PayrollForm
                        onClose={toggleCreateForm}
                        payrollData={payrollData}
                        onEditSuccess={handleEditSuccess}
                    />
                </div>
            )}

            {/* Details Dialog */}
            <Dialog
                open={viewDetails}
                onClose={closeDetailsDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: '10px',
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5">Payslip Details</Typography>
                        <Box>
                            <Button variant="contained" color="primary" className="bg-blue-500" startIcon={<i className="ri-printer-line"></i>}>
                                Print
                            </Button>
                        </Box>
                    </Box>
                </DialogTitle>
                
                <DialogContent dividers>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                            <Typography>Loading details...</Typography>
                        </Box>
                    ) : selectedEmployee ? (
                        <Box>
                            {/* Header section with logo and date */}
                            <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
                                <Grid item xs={4} textAlign="center">
                                    <Typography variant="h5" fontWeight="bold" className='text-left'>Payslip</Typography>
                                    <Typography variant="subtitle1" className='text-left'>For the Month of {formatDate(selectedEmployee.paymentDate).split(' ')[0]} {new Date(selectedEmployee.paymentDate).getFullYear()}</Typography>
                                </Grid>
                                <Grid item xs={4} textAlign="right">
                                    <Chip
                                        label={selectedEmployee.paymentStatus}
                                        color={selectedEmployee.paymentStatus === "Paid" ? "success" : 
                                               selectedEmployee.paymentStatus === "Unpaid" ? "error" : "warning"}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                            
                            <Divider sx={{ mb: 3 }} />
                            
                            {/* Employee Information */}
                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" fontWeight="bold">Employee Information</Typography>
                                    <Box mt={1}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">Name:</Typography>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Typography variant="body2">{selectedEmployee.employeeName}</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">Department:</Typography>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Typography variant="body2">{selectedEmployee.department}</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">Pay Period:</Typography>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Typography variant="body2">{formatDate(selectedEmployee.paymentDate).split(' ')[0]} {new Date(selectedEmployee.paymentDate).getFullYear()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" fontWeight="bold">Work Summary</Typography>
                                    <Box mt={1}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">Total Working Days:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">{selectedEmployee.totalWorkingDays} days</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">Days Worked:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">{selectedEmployee.daysWorked} days</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">Loss of Pay Days:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">{selectedEmployee.totalWorkingDays - selectedEmployee.daysWorked} days</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            <Divider sx={{ mb: 3 }} />
                            
                            {/* Salary Details */}
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Earnings</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Description</TableCell>
                                                    <TableCell align="right">Amount (₹)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Base Salary</TableCell>
                                                    <TableCell align="right">{selectedEmployee.baseSalary.toFixed(2)}</TableCell>
                                                </TableRow>
                                                {selectedEmployee.extraEarnings && selectedEmployee.extraEarnings.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.category}</TableCell>
                                                        <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>Total Earnings</strong></TableCell>
                                                    <TableCell align="right"><strong>{(selectedEmployee.baseSalary + selectedEmployee.totalExtraEarnings).toFixed(2)}</strong></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Deductions</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Description</TableCell>
                                                    <TableCell align="right">Amount (₹)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedEmployee.deductions && selectedEmployee.deductions.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.category}</TableCell>
                                                        <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell>Tax</TableCell>
                                                    <TableCell align="right">{selectedEmployee.tax.toFixed(2)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>Total Deductions</strong></TableCell>
                                                    <TableCell align="right"><strong>{(selectedEmployee.totalDeductions + selectedEmployee.tax).toFixed(2)}</strong></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                            
                            <Box mt={4} p={2} bgcolor="#f8f9fa" borderRadius={1}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>Net Salary:</strong> ₹{selectedEmployee.netSalary.toFixed(2)}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Amount in words: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedEmployee.netSalary)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>Paid Amount:</strong> ₹{selectedEmployee.paidAmount.toFixed(2)}</Typography>
                                        <Typography variant="body1"><strong>Remaining Amount:</strong> ₹{selectedEmployee.remainingSalary.toFixed(2)}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                            
                            {selectedEmployee.paymentHistory && selectedEmployee.paymentHistory.length > 0 && (
                                <Box mt={4}>
                                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Payment History</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Amount</TableCell>
                                                    <TableCell>Payment Method</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedEmployee.paymentHistory.map((payment, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                                        <TableCell>₹{payment.amountPaid.toFixed(2)}</TableCell>
                                                        <TableCell>{payment.paymentMethod}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                            
                            {selectedEmployee.bankDetails && (
                                <Box mt={4}>
                                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Bank Details</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2"><strong>Account Holder:</strong> {selectedEmployee.bankDetails.accountHolderName}</Typography>
                                            <Typography variant="body2"><strong>Account Number:</strong> {selectedEmployee.bankDetails.accountNumber}</Typography>
                                            <Typography variant="body2"><strong>Bank Name:</strong> {selectedEmployee.bankDetails.bankName}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2"><strong>Branch:</strong> {selectedEmployee.bankDetails.branchName}</Typography>
                                            <Typography variant="body2"><strong>IFSC Code:</strong> {selectedEmployee.bankDetails.ifscCode}</Typography>
                                            <Typography variant="body2"><strong>UPI ID:</strong> {selectedEmployee.bankDetails.upiId}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                            <Typography>No employee data available</Typography>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={closeDetailsDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default PayrollSection;