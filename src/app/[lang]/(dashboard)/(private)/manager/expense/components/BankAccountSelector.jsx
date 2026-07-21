"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  InputLabel,
  FormControlLabel,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
  Tooltip
} from "@mui/material";

import { Fab } from "@mui/material";

const HIGHLIGHT_COLOR = "#FFF7D1";

const getAvatarColor = (id) => {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722"
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const BankAccountSelector = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Edit Modal State ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // Store all edit form fields in a single state object
  const [editFormData, setEditFormData] = useState({
    _id: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    accountType: "",
    initialBalance: 0,
    currency: "USD",
    isActive: true,
    createdAt: ""
  });

  // Snackbar states for success/error
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getAccounts = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/getbankaccounts`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        let accountsData = response.data.data;
        if (!Array.isArray(accountsData)) {
          accountsData = [accountsData];
        }
        setAccounts(accountsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load accounts");
        setLoading(false);
        console.error(err);
      }
    };

    getAccounts();
  }, []);

  const handleToggleAccount = async (account) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/account/toggle/${account._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedAccount = response.data.data;
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) =>
          acc._id === updatedAccount._id ? updatedAccount : acc
        )
      );
    } catch (err) {
      console.error("Failed to toggle account status", err);
    }
  };


  const handleAccountClick = (account) => {
    if (!account.isActive) return;
    router.push(`/manager/expense/transactions/${account._id}`);
  };

  const openEditDialog = (account) => {
    // Only allow editing active accounts
    if (!account.isActive) return;

    setEditFormData({
      _id: account._id,
      accountName: account.accountName || "",
      accountNumber: account.accountNumber || "",
      bankName: account.bankName || "",
      branchName: account.branchName || "",
      ifscCode: account.ifscCode || "",
      accountType: account.accountType || "",
      initialBalance: account.initialBalance ?? 0,
      currency: account.currency || "USD",
      isActive: account.isActive ?? true,
      createdAt: account.createdAt || ""
    });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormSwitchChange = (e) => {
    const { name, checked } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");
    if (!editFormData._id) return;

    try {
      const submitData = {
        ...editFormData,
        initialBalance: Number(editFormData.initialBalance)
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/account/updatebankaccount/${editFormData._id}`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedAccount = response.data.data;

      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) =>
          acc._id === updatedAccount._id ? updatedAccount : acc
        )
      );

      setSuccess(true);
    } catch (err) {
      console.error("Failed to update account", err);
      setError("Failed to update account");
    }

    closeEditDialog();
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  const navigateToAddAccount = () => {
    router.push("/en/manager/expense/add-account");
  };


  if (loading)
    return (
      <Typography align="center" sx={{ p: 2 }}>
        Loading accounts...
      </Typography>
    );
  if (error)
    return (
      <Typography align="center" sx={{ p: 2, color: "error.main" }}>
        {error}
      </Typography>
    );

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", mx: "auto", mt: 4 }}>
      <Button
        color="primary"
        aria-label="add"
        variant="outlined"
        onClick={navigateToAddAccount}
        sx={{
          display: "flex",
          gap: 1,
          mb: 4,
          fontSize: "0.875rem"
        }}
      >
        <i class="ri-add-line"></i> Add Account
      </Button>
      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 1, overflow: "hidden", boxShadow: "none" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#fff" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Account Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Branch Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bank Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => {
              const isHighlighted = account.accountName === "Main Business Account";

              return (
                <TableRow
                  key={account._id}
                  onClick={() => handleAccountClick(account)}
                  sx={{
                    cursor: account.isActive ? "pointer" : "default",
                    opacity: account.isActive ? 1 : 0.6,
                    backgroundColor: isHighlighted ? HIGHLIGHT_COLOR : "inherit",
                    "&:hover": account.isActive ? { backgroundColor: "#f9f9f9" } : {}
                  }}
                >
                  {/* Account Name & Avatar with conditional tooltip */}
                  <TableCell>
                    {account.isActive ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(account._id),
                            color: "white"
                          }}
                        >
                          {account.accountName ? account.accountName[0] : "A"}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} className="text-gray-700">
                            {account.accountName || "No Name"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {account.accountType || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Tooltip title="This account is disabled" arrow>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(account._id),
                              color: "white"
                            }}
                          >
                            {account.accountName ? account.accountName[0] : "A"}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} className="text-gray-700">
                              {account.accountName || "No Name"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {account.accountType || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>

                  {/* Branch Name */}
                  <TableCell>
                    <Typography variant="body2">
                      {account.branchName || "N/A"}
                    </Typography>
                  </TableCell>

                  {/* Bank Name */}
                  <TableCell>
                    <Typography variant="body2">
                      {account.bankName}
                    </Typography>
                  </TableCell>

                  {/* Balance */}
                  <TableCell>
                    <Typography variant="body2">
                      {account.balance != null ? `₹${account.balance}` : "₹0"}
                    </Typography>
                  </TableCell>

                  {/* Start Date */}
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  {/* Status with Switch */}
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    sx={{ minWidth: 120 }}
                  >
                    <Switch
                      checked={account.isActive}
                      onChange={() => handleToggleAccount(account)}
                      color="primary"
                    />
                    <Typography
                      variant="caption"
                      color={account.isActive ? "green" : "red"}
                    >
                      {account.isActive ? "Active" : "Disabled"}
                    </Typography>
                  </TableCell>

                  {/* Action: Edit Icon - Disabled for inactive accounts */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {account.isActive ? (
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(account)}
                      >
                        <i className="ri-edit-line text-blue-500"></i>
                      </IconButton>
                    ) : (
                      <Tooltip title="Cannot edit disabled accounts" arrow>
                        <span>
                          <IconButton
                            size="small"
                            disabled
                            sx={{ color: "rgba(0, 0, 0, 0.26)" }}
                          >
                            <i className="ri-edit-line"></i>
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth>
        <DialogTitle>Edit Bank Account</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Account Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Account Name"
                name="accountName"
                fullWidth
                margin="normal"
                value={editFormData.accountName}
                onChange={handleEditFormChange}
              />
            </Grid>
            {/* Account Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Account Number"
                name="accountNumber"
                fullWidth
                margin="normal"
                value={editFormData.accountNumber}
                onChange={handleEditFormChange}
              />
            </Grid>
            {/* Bank Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Bank Name"
                name="bankName"
                fullWidth
                margin="normal"
                value={editFormData.bankName}
                onChange={handleEditFormChange}
              />
            </Grid>
            {/* Branch Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Branch Name"
                name="branchName"
                fullWidth
                margin="normal"
                value={editFormData.branchName}
                onChange={handleEditFormChange}
              />
            </Grid>
            {/* IFSC Code */}
            <Grid item xs={12} md={6}>
              <TextField
                label="IFSC Code"
                name="ifscCode"
                fullWidth
                margin="normal"
                value={editFormData.ifscCode}
                onChange={handleEditFormChange}
              />
            </Grid>
            {/* Account Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountType"
                  value={editFormData.accountType}
                  onChange={handleEditFormChange}
                  label="Account Type"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="savings">Savings</MenuItem>
                  <MenuItem value="current">Current</MenuItem>
                  <MenuItem value="overdraft">Overdraft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Balance */}
            <Grid item xs={12} md={6}>
              <TextField
                label="initialBalance"
                name="initialBalance"
                type="number"
                fullWidth
                margin="normal"
                value={editFormData.initialBalance}
                onChange={handleEditFormChange}
              />
            </Grid>
            {/* Currency */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={editFormData.currency}
                  onChange={handleEditFormChange}
                  label="Currency"
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="INR">INR</MenuItem>
                  <MenuItem value="CAD">CAD</MenuItem>
                  <MenuItem value="AUD">AUD</MenuItem>
                  <MenuItem value="JPY">JPY</MenuItem>
                  <MenuItem value="CNY">CNY</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* isActive Switch */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <Switch
                    name="isActive"
                    color="primary"
                    checked={editFormData.isActive}
                    onChange={handleEditFormSwitchChange}
                  />
                }
                label="Account Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Bank account updated successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error && !loading}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BankAccountSelector;
