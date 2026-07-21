"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";

export default function ExpenseForm({ expense = null, onClose, onSave, isIncome = false }) {
  const isEditing = !!expense;

  // Initialize form data.
  // For the category, if editing and expense.category is populated,
  // we assume expense.category is either an object with _id or a string.
  const [formData, setFormData] = useState({
    date: expense?.date ? expense.date.split("T")[0] : new Date().toISOString().split("T")[0],
    amount: expense?.amount || "",
    category: expense?.category
      ? (typeof expense.category === "object" ? expense.category._id : expense.category)
      : "",
    description: expense?.description || "",
    paymentMethod: expense?.paymentMethod || "",
    recurring: expense?.recurring || false,
    recurrenceInterval: expense?.recurrenceInterval || "Monthly",
    vat: expense?.vat || 0,
    currency: expense?.currency || "USD",
    receipt: expense?.receipt || null,
    isRefunded: expense?.isRefunded || false,
    refundAmount: expense?.refundAmount || 0,
    refundReason: expense?.refundReason || ""
  });

  // State for accounts dropdown
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  // State for categories dropdown
  const [categories, setCategories] = useState([]);

  const paymentMethods = [
    "Credit Card",
    "Debit Card",
    "Cash",
    "Bank Transfer",
    "Mobile Payment"
  ];
  const recurrenceIntervals = ["Daily", "Weekly", "Monthly", "Yearly"];
  const currencies = ["USD", "INR", "EUR", "GBP", "JPY", "AUD"];

  // Fetch accounts from API when component mounts
  useEffect(() => {
    const fetchAccounts = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/getbankaccounts`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const accountsData = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        setAccounts(accountsData);
        if (isEditing && expense.bankAccountId) {
          setSelectedAccount(expense.bankAccountId);
        } else {
          const activeAccount = accountsData.find((acc) => acc.isActive);
          if (activeAccount) {
            setSelectedAccount(activeAccount._id);
          }
        }
      } catch (error) {
        console.error("Error fetching accounts", error);
      }
    };

    fetchAccounts();
  }, [isEditing, expense]);

  // Fetch categories from API and filter by type based on isIncome
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/category/getcategories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          // Filter categories by type: income if isIncome true, expense otherwise.
          const filtered = response.data.data.filter(
            (cat) => cat.type === (isIncome ? "income" : "expense")
          );
          setCategories(filtered);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [isIncome]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // File change for receipt image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        receipt: previewUrl,
        receiptFile: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!selectedAccount) {
      alert("Please select a bank account.");
      return;
    }
    if (!formData.category.trim()) {
      alert("Category is required.");
      return;
    }

    const token = localStorage.getItem("token");

    // Prepare payload. Note: send category as a single value (ObjectId) rather than an array.
    const expensePayload = {
      bankAccountId: selectedAccount,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      receipt: formData.receipt,
      category: formData.category, // send the category ObjectId
      recurring: formData.recurring,
      recurrenceInterval: formData.recurring ? formData.recurrenceInterval : null,
      vat: parseFloat(formData.vat),
      currency: formData.currency,
      isRefunded: formData.isRefunded,
      refundAmount: formData.isRefunded ? parseFloat(formData.refundAmount) : 0,
      refundDate: formData.isRefunded ? new Date().toISOString() : null,
      refundReason: formData.isRefunded ? formData.refundReason : "",
      type: isIncome ? "income" : "expense"
    };

    try {
      if (isEditing) {
        const endpoint = isIncome
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/income/updateincome/${expense.id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/expense/updateexpense/${expense.id}`;
        const response = await axios.put(
          endpoint,
          expensePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onSave(response.data);
      } else {
        const endpoint = isIncome
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/income/createincome`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/expense/createexpense`;
        const response = await axios.post(
          endpoint,
          expensePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error(
        isEditing ? "Error updating data:" : "Error creating data:",
        error
      );
    }
  };

  // Calculate total including VAT
  const totalWithVAT = formData.amount
    ? (parseFloat(formData.amount) * (1 + parseFloat(formData.vat) / 100)).toFixed(2)
    : 0;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ m: 0, p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5" component="div">
              {isEditing ? (isIncome ? "Edit Income" : "Edit Expense") : (isIncome ? "Add New Income" : "Add New Expense")}
            </Typography>
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 200, mr: 5 }}>
              <InputLabel id="account-select-label">Account</InputLabel>
              <Select
                labelId="account-select-label"
                value={selectedAccount}
                label="Account"
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accounts.map((account) => (
                  <MenuItem key={account._id} value={account._id}>
                    {account.accountName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <i className="ri-close-line"></i>
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ p: 2 }}>
            {/* Basic Information Section */}
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Amount Section */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: 'primary.main' }}>
              Amount Details
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ step: "0.01", min: 0 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="VAT Percentage"
                    name="vat"
                    type="number"
                    value={formData.vat}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ step: "0.01", min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Total with VAT"
                    value={`${formData.currency} ${totalWithVAT}`}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ bgcolor: 'background.paper' }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Payment Details */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: 'primary.main' }}>
              Payment Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value=""><em>Select a payment method</em></MenuItem>
                  {paymentMethods.map((method) => (
                    <MenuItem key={method} value={method}>{method}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {currencies.map((curr) => (
                    <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Additional Details */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: 'primary.main' }}>
              Additional Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Receipt Upload Section */}
              <Grid item xs={12}>
                <Box sx={{
                  p: 2,
                  border: '1px dashed grey.300',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Button variant="outlined" component="label">
                    <i className="ri-upload-2-line" style={{ marginRight: 8 }}></i>
                    Upload Receipt
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                  {formData.receipt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="success.main">
                        Receipt attached
                      </Typography>
                      <Box
                        component="img"
                        src={formData.receipt}
                        alt="Receipt Preview"
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Refund Management */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isRefunded}
                      onChange={handleChange}
                      name="isRefunded"
                    />
                  }
                  label="Mark as refunded"
                />
              </Grid>
              {formData.isRefunded && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Refund Amount"
                      name="refundAmount"
                      type="number"
                      value={formData.refundAmount}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ step: "0.01", min: 0 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Refund Reason"
                      name="refundReason"
                      value={formData.refundReason}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                </>
              )}

              {/* Recurring Expense */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.recurring}
                      onChange={handleChange}
                      name="recurring"
                    />
                  }
                  label="This is a recurring expense"
                />
              </Grid>
              {formData.recurring && (
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Recurrence Interval"
                    name="recurrenceInterval"
                    value={formData.recurrenceInterval}
                    onChange={handleChange}
                    fullWidth
                  >
                    {recurrenceIntervals.map((interval) => (
                      <MenuItem key={interval} value={interval}>
                        {interval}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ px: 4 }}
          >
            {isEditing ? (isIncome ? "Update Income" : "Update Expense") : (isIncome ? "Add Income" : "Add Expense")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
