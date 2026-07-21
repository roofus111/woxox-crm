"use client";

import React, { useState, useEffect } from 'react';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import AccountMenu from './components/AccountMenu';
import { IconButton, Box, Typography } from '@mui/material';
import axios from 'axios';

export default function ExpensesPage() {
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [isIncome, setIsIncome] = useState(false); // false = Expense, true = Income

  // Manage accounts state.
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Personal' },
    { id: 2, name: 'Business' },
  ]);
  const [currentAccount, setCurrentAccount] = useState(accounts[0].id);
  const [refreshExpenses, setRefreshExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Toggle between Expense and Income
  const handleToggleType = () => {
    setIsIncome(prev => !prev);
    // Optionally, reset refreshExpenses to force re-fetch.
    setRefreshExpenses(prev => prev + 1);
  };

  // This handler will be called after a new expense/income is created or updated.
  const handleSaveExpense = (savedExpense) => {
    setRefreshExpenses(prev => prev + 1);
    setShowAddExpenseForm(false);
  };

  // Handler for adding a new account.
  const handleAddAccount = (newAccount) => {
    setAccounts([...accounts, newAccount]);
  };

  return (
    <div className="container mx-auto p-4">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="h3" fontWeight="bold">
            {isIncome ? "Income Manager" : "Expense Manager"}
          </Typography>
          <Box
            sx={{
              ml: 3,
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "20px",
              overflow: "hidden",
              cursor: "pointer",
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
            onClick={handleToggleType}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: isIncome ? "white" : "primary.main",
                color: isIncome ? "text.primary" : "white",
              }}
            >
              Expense
            </Box>
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: isIncome ? "primary.main" : "white",
                color: isIncome ? "white" : "text.primary",
              }}
            >
              Income
            </Box>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <IconButton
            onClick={() => setShowAddExpenseForm(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              width: 40,
              height: 40,
            }}
          >
            <i className="ri-add-large-fill"></i>
          </IconButton>
        </Box>
      </Box>
      {/* Pass isIncome along with currentAccount and refreshExpenses */}
      <ExpenseList
        currentAccount={currentAccount}
        refreshExpenses={refreshExpenses}
        isIncome={isIncome}
        selectedMonth={selectedMonth}
      />
      {showAddExpenseForm && (
        <ExpenseForm
          onClose={() => setShowAddExpenseForm(false)}
          onSave={handleSaveExpense}
          isIncome={isIncome}
          selectedMonth={selectedMonth}
        />
      )}
    </div>
  );
}
