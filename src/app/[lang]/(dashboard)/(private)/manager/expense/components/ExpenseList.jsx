"use client";

import React, { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import {
  Container, Box, Typography, Paper, CircularProgress,
  Tabs, Tab, Fade, Alert, Backdrop, SpeedDial, SpeedDialAction,
  SpeedDialIcon, Button
} from "@mui/material";
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from 'lodash';
import { toast } from "react-toastify";
import axios from "axios";
import ExpenseFilters from "./ExpenseFilters";
import ExpenseForm from "./ExpenseForm";
import ExpenseTable from "./ExpenseTable";
import ExpenseReports from "./ExpenseReport";
import ImagePreview from "./ImagePreview";
import ExpenseAnalytics from "./ExpenseAnalytics";
import ExpenseViewToggle from "./ExpenseViewToggle";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ExpenseGrid from "./ExpenseGrid";
import ExpenseCalendar from "./ExpenseCalendar";

// import NoDataIcon from "@mui/icons-material/NoData";

export default function ExpenseList({ currentAccount, refreshExpenses, isIncome, selectedMonth }) {
  const [isPending, startTransition] = useTransition();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'calendar'
  const [selectedTab, setSelectedTab] = useState(0);
  const [groupBy, setGroupBy] = useState('date'); // 'date', 'category', 'payment'
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetched, setLastFetched] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    categories: [],
    paymentMethods: [],
    accounts: [],
    amountRange: { min: '', max: '' },
    showRecurringOnly: false,
    hasReceipt: null,
    search: "",
    tags: [],
  });

  // State for selected expense/income (for editing)
  const [selectedExpense, setSelectedExpense] = useState(null);

  // State for image preview modal
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalAmount: 0,
    averageAmount: 0,
    topCategories: [],
    monthlyTrend: [],
    recentTransactions: [],
  });

  // Initialize data fetching
  useEffect(() => {
    fetchExpenses();

    // Set up auto-refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        startTransition(() => {
          fetchFreshData(true); // silent refresh
        });
      }
    }, 300000);

    return () => clearInterval(refreshInterval);
  }, [selectedMonth, isIncome, currentAccount]);

  // Enhanced fetch function with retry logic
  const fetchExpenses = useCallback(async () => {
    const cacheKey = `expenses_${selectedMonth}_${isIncome}_${currentAccount}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
    const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;

    // Use cache if it's less than 5 minutes old
    if (cachedData && cacheAge < 300000) {
      try {
        const parsedData = JSON.parse(cachedData);
        setExpenses(parsedData);
        setLoading(false);
        setLastFetched(new Date(parseInt(cacheTimestamp)));

        // Fetch fresh data in background if cache is older than 1 minute
        if (cacheAge > 60000) {
          startTransition(() => {
            fetchFreshData(true);
          });
        }
        return;
      } catch (err) {
        console.error("Cache parsing error:", err);
        // Continue to fetch fresh data if cache parsing fails
      }
    }

    await fetchFreshData();
  }, [selectedMonth, isIncome, currentAccount]);

  const fetchFreshData = async (silent = false) => {
    if (!silent) setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      const [year, month] = selectedMonth.split('-');
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/${isIncome ? 'income/getincome' : 'expense/getexpenses'}`;

      const response = await axios.get(endpoint, {
        params: {
          month,
          year,
          accountId: currentAccount,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
        timeout: 10000, // 10 second timeout
      });

      const fetchedExpenses = Array.isArray(response.data) ? response.data : [];

      // Validate and transform data
      const transformedExpenses = fetchedExpenses.map(expense => ({
        ...expense,
        amount: Number(expense.amount),
        date: new Date(expense.date).toISOString(),
        category: expense.category || 'Uncategorized',
        paymentMethod: expense.paymentMethod || 'Other',
      }));

      // Cache the results
      const cacheKey = `expenses_${selectedMonth}_${isIncome}_${currentAccount}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(transformedExpenses));
      sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

      setExpenses(transformedExpenses);
      setLastFetched(new Date());
      setError(null);
      setRetryCount(0);

      if (!silent) {
        toast.success('Expenses updated successfully');
      }

      // Calculate analytics in the background
      startTransition(() => {
        calculateAnalytics(transformedExpenses);
      });

    } catch (err) {
      console.error("Error fetching data:", err);

      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch expenses";

      if (!silent) {
        setError(errorMessage);
        toast.error(errorMessage);
      }

      // Implement retry logic
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchFreshData(silent);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Calculate analytics
  const calculateAnalytics = useCallback((data) => {
    const analytics = {
      totalAmount: data.reduce((sum, item) => sum + item.amount, 0),
      averageAmount: data.length ? data.reduce((sum, item) => sum + item.amount, 0) / data.length : 0,
      topCategories: Object.entries(
        data.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.amount;
          return acc;
        }, {})
      ).sort(([, a], [, b]) => b - a).slice(0, 5),
      monthlyTrend: Object.entries(
        data.reduce((acc, item) => {
          const month = new Date(item.date).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + item.amount;
          return acc;
        }, {})
      ),
      recentTransactions: data.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    };
    setAnalytics(analytics);
  }, []);

  // Delete handler using the proper API endpoint based on type
  const handleDeleteExpense = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const endpoint = isIncome
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/income/deleteincome/${id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/expense/deleteexpense/${id}`;
      await axios.delete(
        endpoint,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Remove the deleted expense/income from state
      setExpenses(expenses.filter((expense) => expense.id !== id));
      toast.success('Expense deleted successfully');
    } catch (err) {
      toast.error('Failed to delete expense');
      console.error("Error deleting data:", err);
    } finally {
      setLoading(false);
    }
  }, [expenses, isIncome]);

  // Optimized filtering with memoization
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Quick rejection checks
      if (filters.showRecurringOnly && !expense.isRecurring) return false;
      if (filters.hasReceipt !== null && !!expense.receiptImage !== filters.hasReceipt) return false;

      // Complex filters
      const matchesSearch = !filters.search ||
        expense.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        expense.category.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategories = !filters.categories.length ||
        filters.categories.includes(expense.category);

      const matchesPaymentMethods = !filters.paymentMethods.length ||
        filters.paymentMethods.includes(expense.paymentMethod);

      const matchesDateRange = (!filters.dateFrom || new Date(expense.date) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(expense.date) <= new Date(filters.dateTo));

      const matchesAmountRange = (!filters.amountRange.min || expense.amount >= Number(filters.amountRange.min)) &&
        (!filters.amountRange.max || expense.amount <= Number(filters.amountRange.max));

      return matchesSearch && matchesCategories && matchesPaymentMethods &&
        matchesDateRange && matchesAmountRange;
    });
  }, [expenses, filters]);

  // Group expenses based on selected grouping
  const groupedExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const key = groupBy === 'date' ? expense.date.split('T')[0] :
        groupBy === 'category' ? (expense.category?.name || expense.category) :
          (expense.paymentMethod?.name || expense.paymentMethod);

      if (!acc[key]) {
        acc[key] = {
          items: [],
          total: 0,
        };
      }

      acc[key].items.push(expense);
      acc[key].total += expense.amount;

      return acc;
    }, {});
  }, [filteredExpenses, groupBy]);

  // Add these memoized functions at component level
  const memoizedFilters = useMemo(() => {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <ExpenseFilters filters={filters} setFilters={setFilters} />
      </Paper>
    );
  }, [filters, setFilters]);

  const memoizedExpenseTable = useMemo(() => {
    return filteredExpenses.length === 0 ? (
      <Box display="flex" flexDirection="column" alignItems="center" py={4}>
        {/* <NoDataIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} /> */}
        <Typography variant="body1" color="text.secondary">
          No {isIncome ? "incomes" : "expenses"} match your filters.
        </Typography>
      </Box>
    ) : (
      <ExpenseTable
        expenses={filteredExpenses}
        onDelete={handleDeleteExpense}
        onEdit={setSelectedExpense}
        onImageClick={setPreviewImageUrl}
      />
    );
  }, [filteredExpenses, isIncome, handleDeleteExpense, setSelectedExpense, setPreviewImageUrl]);

  const debouncedSetFilters = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
    }, 300),
    []
  );

  // Add export functionality
  const handleExport = useCallback(async () => {
    try {
      if (!filteredExpenses.length) {
        toast.warning('No expenses to export');
        return;
      }

      // Format data for export
      const exportData = filteredExpenses.map(expense => ({
        Date: new Date(expense.date).toLocaleDateString(),
        Description: expense.description,
        Category: expense.category,
        Amount: expense.amount.toFixed(2),
        'Payment Method': expense.paymentMethod,
        Recurring: expense.isRecurring ? 'Yes' : 'No',
        Notes: expense.notes || '',
        'Receipt Available': expense.receiptImage ? 'Yes' : 'No'
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add column widths
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 30 }, // Description
        { wch: 15 }, // Category
        { wch: 12 }, // Amount
        { wch: 15 }, // Payment Method
        { wch: 10 }, // Recurring
        { wch: 30 }, // Notes
        { wch: 15 }  // Receipt Available
      ];
      ws['!cols'] = colWidths;

      // Add workbook metadata
      const fileName = `${isIncome ? 'Income' : 'Expenses'}_${selectedMonth}`;
      XLSX.utils.book_append_sheet(wb, ws, fileName);

      // Add summary sheet
      const summaryData = [
        ['Summary'],
        ['Total Amount', analytics.totalAmount.toFixed(2)],
        ['Average Amount', analytics.averageAmount.toFixed(2)],
        ['Number of Transactions', filteredExpenses.length],
        [''],
        ['Top Categories'],
        ...analytics.topCategories.map(([category, amount]) => [
          category,
          amount.toFixed(2)
        ])
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save file
      saveAs(data, `${fileName}.xlsx`);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  }, [filteredExpenses, isIncome, selectedMonth, analytics]);

  if (loading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: 9999 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" />
          <Typography>Loading expenses...</Typography>
        </Box>
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => fetchFreshData()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Enhanced UI components */}
      <ExpenseAnalytics data={analytics} />
      <ExpenseFilters filters={filters} setFilters={setFilters} />
      <ExpenseViewToggle value={viewMode} onChange={setViewMode} />

      {viewMode === 'list' ? (
        <ExpenseTable
          expenses={groupedExpenses}
          groupBy={groupBy}
          onDelete={handleDeleteExpense}
          onEdit={setSelectedExpense}
          onImageClick={setPreviewImageUrl}
        />
      ) : viewMode === 'grid' ? (
        <ExpenseGrid
          expenses={groupedExpenses}
          groupBy={groupBy}
        />
      ) : (
        <ExpenseCalendar
          expenses={filteredExpenses}
          onExpenseClick={setSelectedExpense}
          selectedMonth={selectedMonth}
        />
      )}

      {/* Quick Actions */}
      <SpeedDial
        ariaLabel="Expense actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<i className="ri-add-line" />}
          tooltipTitle="Add New"
          onClick={() => setSelectedExpense({})}
        />
        <SpeedDialAction
          icon={<i className="ri-file-excel-line" />}
          tooltipTitle="Export"
          onClick={handleExport}
        />
      </SpeedDial>

      {selectedExpense && (
        <ExpenseForm
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onSave={(updatedExpense) => {
            setExpenses(
              expenses.map((exp) => exp.id === updatedExpense.id ? updatedExpense : exp
              )
            );
            setSelectedExpense(null);
          }}
          isIncome={isIncome} />
      )}

      {previewImageUrl && (
        <ImagePreview
          open={Boolean(previewImageUrl)}
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)} />
      )}
    </Container>
  );
}
