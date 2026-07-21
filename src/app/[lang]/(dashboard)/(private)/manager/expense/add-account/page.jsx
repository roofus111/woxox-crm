"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Grid,
  Alert,
  InputAdornment
} from '@mui/material';
import axios from 'axios';
import { useRouter } from "next/navigation";

const BankAccountForm = () => {
  const router = useRouter();

  // Initial form state
  const initialFormState = {
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
    accountType: '',
    initialBalance: 0,
    currency: 'USD',
    isActive: true
  };

  // Form state
  const [formData, setFormData] = useState(initialFormState);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Currency symbols mapping
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥'
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  // Handle form reset
  const handleReset = () => {
    setFormData(initialFormState);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const submitData = {
        ...formData,
        initialBalance: Number(formData.initialBalance)
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/account/addbankaccount`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess(true);
      console.log('Success:', response.data);
      setFormData(initialFormState);

      router.push('/manager/expense/accounts');

    } catch (err) {
      console.error('Error adding bank account:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Add Bank Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {/* Account Name */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Account Name"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Account Number */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Bank Name */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Branch Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Branch Name"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* IFSC Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Account Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required margin="normal">
                <InputLabel id="account-type-label">Account Type</InputLabel>
                <Select
                  labelId="account-type-label"
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  label="Account Type"
                >
                  <MenuItem value="savings">Savings</MenuItem>
                  <MenuItem value="current">Current</MenuItem>
                  <MenuItem value="overdraft">Overdraft</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Balance with Currency Symbol */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Initial Balance"
                name="initialBalance"
                type="number"
                value={formData.initialBalance}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {currencySymbols[formData.currency] || '$'}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Currency */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  label="Currency"
                >
                  <MenuItem value="USD">USD ({currencySymbols.USD})</MenuItem>
                  <MenuItem value="EUR">EUR ({currencySymbols.EUR})</MenuItem>
                  <MenuItem value="GBP">GBP ({currencySymbols.GBP})</MenuItem>
                  <MenuItem value="INR">INR ({currencySymbols.INR})</MenuItem>
                  <MenuItem value="CAD">CAD ({currencySymbols.CAD})</MenuItem>
                  <MenuItem value="AUD">AUD ({currencySymbols.AUD})</MenuItem>
                  <MenuItem value="JPY">JPY ({currencySymbols.JPY})</MenuItem>
                  <MenuItem value="CNY">CNY ({currencySymbols.CNY})</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Account Active"
              />
            </Grid>

            {/* Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                  size="small"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  size="small"
                >
                  {loading ? <CircularProgress size={20} /> : 'Submit'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Success and Error Messages */}
        <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Bank account added successfully!
          </Alert>
        </Snackbar>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default BankAccountForm;
