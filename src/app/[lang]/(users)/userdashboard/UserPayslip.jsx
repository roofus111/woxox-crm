'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
    Typography, Box, Paper, Grid, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Divider, Chip, Button,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

const UserPayslip = () => {
    const { data: session, status } = useSession();
    const [payslips, setPayslips] = useState([]);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [viewDetails, setViewDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPayslips = async () => {
        if (status === "loading" || !session || !session.user) return;
        
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            // Fetch payroll information for the logged-in user
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/employee-payroll/${session.user.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPayslips(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching payslips:", error);
            setError("Unable to load payslips. Please try again later.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayslips();
    }, [session, status]);

    const handleView = async (payslipId) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll/${payslipId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedPayslip(response.data);
            setViewDetails(true);
        } catch (error) {
            console.error("Error fetching payslip details:", error);
            setError("Unable to load payslip details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const closeDetailsDialog = () => {
        setViewDetails(false);
        setSelectedPayslip(null);
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

    const handlePrint = () => {
        window.print();
    };

    if (loading && payslips.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <Typography>Loading payslips...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8">
            <Typography variant="h4" className="mb-4">
                My Payslips
            </Typography>
            <Typography variant="body1" className="mb-6">
                View and download your monthly salary statements
            </Typography>

            <Paper style={{ padding: '20px' }}>
                {payslips.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <Typography>No payslip records found</Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Month</TableCell>
                                    <TableCell>Payment Date</TableCell>
                                    <TableCell>Base Salary</TableCell>
                                    <TableCell>Gross Pay</TableCell>
                                    <TableCell>Deductions</TableCell>
                                    <TableCell>Net Salary</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payslips.map((payslip) => (
                                    <TableRow key={payslip._id}>
                                        <TableCell>
                                            {formatDate(payslip.paymentDate).split(' ')[0]} {new Date(payslip.paymentDate).getFullYear()}
                                        </TableCell>
                                        <TableCell>{formatDate(payslip.paymentDate)}</TableCell>
                                        <TableCell>₹{payslip.baseSalary.toFixed(2)}</TableCell>
                                        <TableCell>₹{(payslip.baseSalary + payslip.totalExtraEarnings).toFixed(2)}</TableCell>
                                        <TableCell>₹{payslip.totalDeductions.toFixed(2)}</TableCell>
                                        <TableCell>₹{payslip.netSalary.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={payslip.paymentStatus}
                                                color={payslip.paymentStatus === "Paid" ? "success" : 
                                                    payslip.paymentStatus === "Unpaid" ? "error" : "warning"}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleView(payslip._id)}>
                                                <i className="ri-eye-line text-green-500"></i>
                                            </IconButton>
                                            <IconButton color="primary">
                                                <i className="ri-download-line text-blue-500"></i>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Payslip Details Dialog */}
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
                        <Button 
                            variant="contained" 
                            color="primary" 
                            className="bg-blue-500" 
                            startIcon={<i className="ri-printer-line"></i>}
                            onClick={handlePrint}
                        >
                            Print
                        </Button>
                    </Box>
                </DialogTitle>
                
                <DialogContent dividers>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                            <Typography>Loading details...</Typography>
                        </Box>
                    ) : selectedPayslip ? (
                        <Box id="payslip-content" className="print-section">
                            {/* Header section with logo and date */}
                            <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
                                <Grid item xs={6} textAlign="left">
                                    <Typography variant="h5" fontWeight="bold">Payslip</Typography>
                                    <Typography variant="subtitle1">
                                        For the Month of {formatDate(selectedPayslip.paymentDate).split(' ')[0]} {new Date(selectedPayslip.paymentDate).getFullYear()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} textAlign="right">
                                    <Chip
                                        label={selectedPayslip.paymentStatus}
                                        color={selectedPayslip.paymentStatus === "Paid" ? "success" : 
                                               selectedPayslip.paymentStatus === "Unpaid" ? "error" : "warning"}
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
                                                <Typography variant="body2">{selectedPayslip.employeeName}</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">Department:</Typography>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Typography variant="body2">{selectedPayslip.department}</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">Pay Period:</Typography>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <Typography variant="body2">
                                                    {formatDate(selectedPayslip.paymentDate).split(' ')[0]} {new Date(selectedPayslip.paymentDate).getFullYear()}
                                                </Typography>
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
                                                <Typography variant="body2">{selectedPayslip.totalWorkingDays} days</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">Days Worked:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">{selectedPayslip.daysWorked} days</Typography>
                                            </Grid>
                                            
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">Loss of Pay Days:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    {selectedPayslip.totalWorkingDays - selectedPayslip.daysWorked} days
                                                </Typography>
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
                                                    <TableCell align="right">{selectedPayslip.baseSalary.toFixed(2)}</TableCell>
                                                </TableRow>
                                                {selectedPayslip.extraEarnings && selectedPayslip.extraEarnings.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.category}</TableCell>
                                                        <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>Total Earnings</strong></TableCell>
                                                    <TableCell align="right">
                                                        <strong>{(selectedPayslip.baseSalary + selectedPayslip.totalExtraEarnings).toFixed(2)}</strong>
                                                    </TableCell>
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
                                                {selectedPayslip.deductions && selectedPayslip.deductions.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.category}</TableCell>
                                                        <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell>Tax</TableCell>
                                                    <TableCell align="right">{selectedPayslip.tax.toFixed(2)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>Total Deductions</strong></TableCell>
                                                    <TableCell align="right">
                                                        <strong>{(selectedPayslip.totalDeductions + selectedPayslip.tax).toFixed(2)}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                            
                            <Box mt={4} p={2} bgcolor="#f8f9fa" borderRadius={1}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>Net Salary:</strong> ₹{selectedPayslip.netSalary.toFixed(2)}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Amount in words: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedPayslip.netSalary)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>Paid Amount:</strong> ₹{selectedPayslip.paidAmount.toFixed(2)}</Typography>
                                        <Typography variant="body1">
                                            <strong>Remaining Amount:</strong> ₹{selectedPayslip.remainingSalary.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                            
                            {selectedPayslip.paymentHistory && selectedPayslip.paymentHistory.length > 0 && (
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
                                                {selectedPayslip.paymentHistory.map((payment, index) => (
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
                            
                            {selectedPayslip.bankDetails && (
                                <Box mt={4}>
                                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Bank Details</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                <strong>Account Holder:</strong> {selectedPayslip.bankDetails.accountHolderName}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Account Number:</strong> {selectedPayslip.bankDetails.accountNumber}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Bank Name:</strong> {selectedPayslip.bankDetails.bankName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                <strong>Branch:</strong> {selectedPayslip.bankDetails.branchName}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>IFSC Code:</strong> {selectedPayslip.bankDetails.ifscCode}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>UPI ID:</strong> {selectedPayslip.bankDetails.upiId}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                            <Typography>No payslip data available</Typography>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={closeDetailsDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-section, .print-section * {
                        visibility: visible;
                    }
                    .print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 40px;
                    }
                    .MuiDialog-root,
                    .MuiDialog-container,
                    .MuiDialog-paper {
                        visibility: visible !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        max-width: 100% !important;
                    }
                    .MuiDialogActions-root,
                    button {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserPayslip;