'use client'

import { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Container,
    Box,
    IconButton,
    Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';

// Create theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const PayrollForm = ({ onClose, payrollData, onEditSuccess }) => {
    const [formData, setFormData] = useState({
        employeeId: payrollData ? payrollData.employeeId : '',
        employeeName: payrollData ? payrollData.employeeName : '',
        department: payrollData ? payrollData.department : '',
        monthlySalary: payrollData ? payrollData.monthlySalary : '',
        totalWorkingDays: payrollData ? payrollData.totalWorkingDays : 0,
        daysWorked: payrollData ? payrollData.daysWorked : 0,
        extraEarnings: payrollData ? payrollData.extraEarnings : [{ category: '', amount: 0 }],
        deductions: payrollData ? payrollData.deductions : [{ category: '', amount: 0 }],
        tax: payrollData ? payrollData.tax : 0,
        paymentDate: payrollData ? payrollData.paymentDate ? payrollData.paymentDate.split('T')[0] : '' : '',
        paymentMethod: payrollData ? payrollData.paymentMethod : 'Bank Transfer',
        notes: payrollData ? payrollData.notes || '' : '',
        bankDetails: payrollData ? payrollData.bankDetails : {
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            branchName: '',
            ifscCode: '',
            swiftCode: '',
            upiId: ''
        }
    });
    const [employees, setEmployees] = useState([]);
    const isEditMode = Boolean(payrollData);

    useEffect(() => {
        if (payrollData) {
            setFormData({
                employeeId: payrollData.employeeId,
                employeeName: payrollData.employeeName,
                department: payrollData.department,
                monthlySalary: payrollData.monthlySalary,
                totalWorkingDays: payrollData.totalWorkingDays,
                daysWorked: payrollData.daysWorked,
                extraEarnings: payrollData.extraEarnings,
                deductions: payrollData.deductions,
                tax: payrollData.tax,
                paymentDate: payrollData.paymentDate ? payrollData.paymentDate.split('T')[0] : '',
                paymentMethod: payrollData.paymentMethod,
                notes: payrollData.notes || '',
                bankDetails: payrollData.bankDetails
            });
        }
    }, [payrollData]);

    useEffect(() => {
        const fetchEmployees = async () => {
            const token = localStorage.getItem('token'); 
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/getemployees`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        limit: 1000 
                    }
                });
                console.log("employees", response.data.employees);
                setEmployees(response.data.employees); 
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('bankDetails.')) {
            const bankField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                bankDetails: {
                    ...prev.bankDetails,
                    [bankField]: value
                }
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (name === 'employeeName') {
            const selectedEmployee = employees.find(emp => `${emp.firstName} ${emp.lastName}` === value);
            if (selectedEmployee) {
                setFormData(prev => ({ ...prev, employeeId: selectedEmployee._id }));
                console.log("Selected Employee ID:", selectedEmployee._id);
            } else {
                setFormData(prev => ({ ...prev, employeeId: '' }));
            }
        }
    };

    const handleExtraEarningsChange = (index, field, value) => {
        const updatedEarnings = [...formData.extraEarnings];
        updatedEarnings[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setFormData({ ...formData, extraEarnings: updatedEarnings });
    };

    const addExtraEarning = () => {
        setFormData({
            ...formData,
            extraEarnings: [...formData.extraEarnings, { category: '', amount: 0 }]
        });
    };

    const removeExtraEarning = (index) => {
        const updatedEarnings = formData.extraEarnings.filter((_, i) => i !== index);
        setFormData({ ...formData, extraEarnings: updatedEarnings });
    };

    const handleDeductionsChange = (index, field, value) => {
        const updatedDeductions = [...formData.deductions];
        updatedDeductions[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setFormData({ ...formData, deductions: updatedDeductions });
    };

    const addDeduction = () => {
        setFormData({
            ...formData,
            deductions: [...formData.deductions, { category: '', amount: 0 }]
        });
    };

    const removeDeduction = (index) => {
        const updatedDeductions = formData.deductions.filter((_, i) => i !== index);
        setFormData({ ...formData, deductions: updatedDeductions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const url = payrollData
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll/${payrollData._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll`;

            const method = payrollData ? 'PUT' : 'POST';

            const payload = {
                employeeId: formData.employeeId,
                employeeName: formData.employeeName,
                department: formData.department,
                monthlySalary: formData.monthlySalary,
                totalWorkingDays: formData.totalWorkingDays,
                daysWorked: formData.daysWorked,
                extraEarnings: formData.extraEarnings,
                deductions: formData.deductions,
                tax: formData.tax,
                paymentDate: formData.paymentDate,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                bankDetails: formData.bankDetails,
            };

            const response = await axios({
                method,
                url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: payload,
            });

            if (response.status === 200 || response.status === 201) {
                onEditSuccess(response.data);
                onClose();
                fetchPayrollData();
            }
        } catch (error) {
            console.error('Error saving payroll:', error);
        }
    };

    const handleEditSuccess = (updatedEmployee) => {
        setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => (emp._id === updatedEmployee._id ? updatedEmployee : emp))
        );
    };

    const fetchPayrollData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/payroll/payroll`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEmployees(response.data); // Update the state with the fetched data
        } catch (error) {
            console.error("Error fetching payroll data:", error);
        }
    };

    // Calculate totals
    const totalExtraEarnings = formData.extraEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const totalDeductions = formData.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);

    return (
        <ThemeProvider theme={theme} sx={{ boxShadow: 'none' }}>
            <Container maxWidth="md" sx={{ boxShadow: 'none' }}>
                <Card elevation={3} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB', borderRadius: '20px' }}>
                    <CardHeader
                        title={
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }} align="center" gutterBottom>
                                {isEditMode ? 'Update Payroll' : 'Create Payroll'}
                            </Typography>
                        }
                    />
                    <CardContent sx={{ boxShadow: 'none' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, boxShadow: 'none' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel id="employee-name-label">Employee Name</InputLabel>
                                        <Select
                                            labelId="employee-name-label"
                                            name="employeeName"
                                            value={formData.employeeName}
                                            onChange={handleChange}
                                        >
                                            {employees.map((employee) => (
                                                <MenuItem key={employee._id} value={`${employee.firstName} ${employee.lastName}`}>
                                                    {`${employee.firstName} ${employee.lastName}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel id="department-label">Department</InputLabel>
                                        <Select
                                            labelId="department-label"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="IT">IT</MenuItem>
                                            <MenuItem value="Sales">Sales</MenuItem>
                                            <MenuItem value="Counseling">Counseling</MenuItem>
                                            <MenuItem value="Cleaning">Cleaning</MenuItem>
                                            <MenuItem value="HR">HR</MenuItem>
                                            <MenuItem value="Reception">Reception</MenuItem>
                                            <MenuItem value="TL">TL</MenuItem>
                                            <MenuItem value="Manager">Manager</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Monthly Salary"
                                        name="monthlySalary"
                                        type="number"
                                        value={formData.monthlySalary}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Total Working Days"
                                        name="totalWorkingDays"
                                        type="number"
                                        value={formData.totalWorkingDays}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Days Worked"
                                        name="daysWorked"
                                        type="number"
                                        value={formData.daysWorked}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Tax"
                                        name="tax"
                                        type="number"
                                        value={formData.tax}
                                        onChange={handleChange}
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Payment Date"
                                        name="paymentDate"
                                        type="date"
                                        value={formData.paymentDate}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {isEditMode && (
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            variant="outlined"
                                            multiline
                                            rows={4}
                                            placeholder="Add any notes or comments about this payroll record"
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Typography variant="h6">Extra Earnings</Typography>
                                    {formData.extraEarnings.map((earning, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <TextField
                                                label="Category"
                                                value={earning.category}
                                                onChange={(e) => handleExtraEarningsChange(index, 'category', e.target.value)}
                                                required
                                                variant="outlined"
                                                sx={{ mr: 1 }}
                                            />
                                            <TextField
                                                label="Amount"
                                                type="number"
                                                value={earning.amount}
                                                onChange={(e) => handleExtraEarningsChange(index, 'amount', e.target.value)}
                                                required
                                                variant="outlined"
                                                InputProps={{ inputProps: { min: 0 } }}
                                                sx={{ mr: 1 }}
                                            />
                                            <IconButton onClick={() => removeExtraEarning(index)}>
                                                <i className="fa-solid fa-minus"></i>
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button variant="outlined" onClick={addExtraEarning} startIcon={<i className="fa-solid fa-plus"></i>}>
                                        Add Extra Earning
                                    </Button>
                                    <Typography variant="h6" sx={{ mt: 2 }}>Total Extra Earnings: ₹{totalExtraEarnings.toFixed(2)}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6">Deductions</Typography>
                                    {formData.deductions.map((deduction, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <TextField
                                                label="Category"
                                                value={deduction.category}
                                                onChange={(e) => handleDeductionsChange(index, 'category', e.target.value)}
                                                required
                                                variant="outlined"
                                                sx={{ mr: 1 }}
                                            />
                                            <TextField
                                                label="Amount"
                                                type="number"
                                                value={deduction.amount}
                                                onChange={(e) => handleDeductionsChange(index, 'amount', e.target.value)}
                                                required
                                                variant="outlined"
                                                InputProps={{ inputProps: { min: 0 } }}
                                                sx={{ mr: 1 }}
                                            />
                                            <IconButton onClick={() => removeDeduction(index)}>
                                                <i className="fa-solid fa-minus"></i>
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button variant="outlined" onClick={addDeduction} startIcon={<i className="fa-solid fa-plus"></i>}>
                                        Add Deduction
                                    </Button>
                                    <Typography variant="h6" sx={{ mt: 2 }}>Total Deductions: ₹{totalDeductions.toFixed(2)}</Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Account Holder Name"
                                        name="bankDetails.accountHolderName"
                                        value={formData.bankDetails.accountHolderName}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Account Number"
                                        name="bankDetails.accountNumber"
                                        value={formData.bankDetails.accountNumber}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Bank Name"
                                        name="bankDetails.bankName"
                                        value={formData.bankDetails.bankName}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Branch Name"
                                        name="bankDetails.branchName"
                                        value={formData.bankDetails.branchName}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="IFSC Code"
                                        name="bankDetails.ifscCode"
                                        value={formData.bankDetails.ifscCode}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Payment Method</InputLabel>
                                        <Select
                                            value={formData.paymentMethod}
                                            label="Payment Method"
                                            name="paymentMethod"
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                            <MenuItem value="Cash">Cash</MenuItem>
                                            <MenuItem value="Cheque">Cheque</MenuItem>
                                            <MenuItem value="UPI">UPI</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={onClose}
                                            size="large"
                                            sx={{ mt: 2 }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            sx={{ mt: 2 }}
                                        >
                                            {isEditMode ? 'Update Payroll' : 'Create Payroll'}
                                        </Button>
                                    </div>
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </ThemeProvider>
    );
};

export default PayrollForm;