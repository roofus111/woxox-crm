'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Avatar,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import AttendanceCalendar from '../../(dashboard)/(private)/manager/hrmodule/components/AttendanceCalendar';

const UserDashboard = () => {
  const { data: session, status } = useSession();

  // Basic user profile info
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  const [avatarColor, setAvatarColor] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState(null);

  // Leave data state
  const [leaveData, setLeaveData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    numberOfDays: '',
    reason: '',
    submittedTo: 'HR',
  });

  // Dialog states for profile, leave and payslip
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [openPayslipDialog, setOpenPayslipDialog] = useState(false);

  // Payslip data and loading state
  const [payslipData, setPayslipData] = useState(null);
  const [loadingPayslip, setLoadingPayslip] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // Generate a random color for avatar if none provided
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
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
      if (!employee) return;

      setUserProfile({
        name:
          employee.firstName && employee.lastName
            ? `${employee.firstName} ${employee.lastName}`
            : employee.name || '',
        email: employee.email,
        avatar: employee.avatar || '',
        department: employee.department,
        role: employee.role,
        company: employee.company ? employee.company.name : '',
      });
      setEmployeeDetails(employee);

      if (!employee.avatar && !avatarColor) {
        setAvatarColor(getRandomColor());
      } else if (employee.avatar) {
        setAvatarColor('');
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (session && session.user) {
      fetchEmployeeByUserId(session.user.id);
    }
  }, [session, status]);

  const handleProfileEdit = () => {
    setOpenProfileDialog(false);
  };

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
      console.error("Error applying leave:", error);
    }
  };

const handlePayslipClick = async () => {
    if (!employeeDetails || !employeeDetails._id) {
      console.error('Employee details not loaded or _id is missing.');
      return;
    }
    setLoadingPayslip(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll/${employeeDetails._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Payslip API response:', response.data);
      setPayslipData(response.data);
      setOpenPayslipDialog(true);
    } catch (error) {
      console.error("Error fetching payslip:", error);
    } finally {
      setLoadingPayslip(false);
    }
  };  

  // Simple tasks array
  const tasks = [
    { id: 1, title: 'Complete project report', status: 'In Progress' },
    { id: 2, title: 'Attend team meeting', status: 'Pending' },
    { id: 3, title: 'Submit leave application', status: 'Completed' },
    { id: 4, title: 'Prepare presentation', status: 'In Progress' },
  ];

  // Helper to format date similar to payroll reference
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
          <div
            className="flex lg:ml-5 items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={handlePayslipClick}
          >
            <span>Payslip</span>
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

      {/* Payslip Details Dialog */}
      <Dialog
        open={openPayslipDialog}
        onClose={() => { setOpenPayslipDialog(false); setPayslipData(null); }}
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
              <Button variant="contained" color="primary" startIcon={<i className="ri-printer-line"></i>}>
                Print
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingPayslip ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Typography>Loading details...</Typography>
            </Box>
          ) : payslipData ? (
            <Box>
              {/* Header Section */}
              <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
                <Grid item xs={4} textAlign="left">
                  <Typography variant="h5" fontWeight="bold">Payslip</Typography>
                  <Typography variant="subtitle1">
                    For the Month of {formatDate(payslipData.paymentDate).split(' ')[0]} {new Date(payslipData.paymentDate).getFullYear()}
                  </Typography>
                </Grid>
                <Grid item xs={4} textAlign="right">
                  <Chip
                    label={payslipData.paymentStatus}
                    color={
                      payslipData.paymentStatus === "Paid"
                        ? "success"
                        : payslipData.paymentStatus === "Unpaid"
                          ? "error"
                          : "warning"
                    }
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <Divider sx={{ mb: 3 }} />
              
              {/* Employee & Work Summary */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Employee Information</Typography>
                  <Box mt={1}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Name:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{payslipData.employeeName}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Department:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{payslipData.department}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Pay Period:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          {formatDate(payslipData.paymentDate).split(' ')[0]} {new Date(payslipData.paymentDate).getFullYear()}
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
                        <Typography variant="body2">{payslipData.totalWorkingDays} days</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Days Worked:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{payslipData.daysWorked} days</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Loss of Pay Days:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {payslipData.totalWorkingDays - payslipData.daysWorked} days
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
                  <Box>
                    <Typography variant="body2">Base Salary: ₹{payslipData.baseSalary.toFixed(2)}</Typography>
                    {payslipData.extraEarnings && payslipData.extraEarnings.map((item, index) => (
                      <Typography key={index} variant="body2">
                        {item.category}: ₹{item.amount.toFixed(2)}
                      </Typography>
                    ))}
                    <Typography variant="body2" fontWeight="bold">
                      Total Earnings: ₹{(payslipData.baseSalary + payslipData.totalExtraEarnings).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>Deductions</Typography>
                  <Box>
                    {payslipData.deductions && payslipData.deductions.map((item, index) => (
                      <Typography key={index} variant="body2">
                        {item.category}: ₹{item.amount.toFixed(2)}
                      </Typography>
                    ))}
                    <Typography variant="body2">Tax: ₹{payslipData.tax.toFixed(2)}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Total Deductions: ₹{(payslipData.totalDeductions + payslipData.tax).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box mt={4} p={2} bgcolor="#f8f9fa" borderRadius={1}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      <strong>Net Salary:</strong> ₹{payslipData.netSalary.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Amount in words: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payslipData.netSalary)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      <strong>Paid Amount:</strong> ₹{payslipData.paidAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Remaining Amount:</strong> ₹{payslipData.remainingSalary.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {payslipData.paymentHistory && payslipData.paymentHistory.length > 0 && (
                <Box mt={4}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>Payment History</Typography>
                  {payslipData.paymentHistory.map((payment, index) => (
                    <Box key={index} mb={1}>
                      <Typography variant="body2">
                        {formatDate(payment.paymentDate)} - ₹{payment.amountPaid.toFixed(2)} via {payment.paymentMethod}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {payslipData.bankDetails && (
                <Box mt={4}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>Bank Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Account Holder:</strong> {payslipData.bankDetails.accountHolderName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Account Number:</strong> {payslipData.bankDetails.accountNumber}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Bank Name:</strong> {payslipData.bankDetails.bankName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Branch:</strong> {payslipData.bankDetails.branchName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>IFSC Code:</strong> {payslipData.bankDetails.ifscCode}
                      </Typography>
                      <Typography variant="body2">
                        <strong>UPI ID:</strong> {payslipData.bankDetails.upiId}
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
          <Button onClick={() => { setOpenPayslipDialog(false); setPayslipData(null); }} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
