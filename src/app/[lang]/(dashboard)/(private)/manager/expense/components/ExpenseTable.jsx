"use client";

import React, { useState, useMemo, useCallback, useTransition, Suspense } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import Image from "next/image";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
  Typography,
  Menu,
  MenuItem,
  Popover,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpenseCalendar from './ExpenseCalendar';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Dynamic imports for better code splitting
const FilterDrawer = dynamic(() => import('./FilterDrawer'), {
  suspense: true,
  loading: () => <FilterDrawerSkeleton />
});

const InsightsPanel = dynamic(() => import('./InsightsPanel'), {
  suspense: true,
  loading: () => <InsightsPanelSkeleton />
});

// Import TableSkeleton
const TableSkeleton = dynamic(() => import('./TableSkeleton'), {
  ssr: false
});

// Import other skeletons
const FilterDrawerSkeleton = dynamic(() => import('./FilterDrawerSkeleton'), {
  ssr: false
});

const InsightsPanelSkeleton = dynamic(() => import('./InsightsPanelSkeleton'), {
  ssr: false
});

export default function ExpenseTable({ expenses, onDelete, onEdit, onImageClick }) {
  const [isPending, startTransition] = useTransition();
  const [expandedRows, setExpandedRows] = useState({});
  const [filters, setFilters] = useState({
    categories: [],
    accounts: [],
    dateRange: { start: null, end: null },
    amountRange: { min: '', max: '' },
    paymentMethods: [],
    recurring: null,
    hasReceipt: null,
    searchTerm: '',
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' });
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'

  // Add filter handling functions
  const handleFilterChange = useCallback((newFilters) => {
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        ...newFilters
      }));
    });
  }, []);

  const handleSearchChange = useCallback(
    debounce((value) => {
      handleFilterChange({ searchTerm: value });
    }, 300),
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      accounts: [],
      dateRange: { start: null, end: null },
      amountRange: { min: '', max: '' },
      paymentMethods: [],
      recurring: null,
      hasReceipt: null,
      searchTerm: '',
    });
  }, []);

  // Memoized filter options
  const filterOptions = useMemo(() => {
    if (!expenses?.length) return { categories: [], paymentMethods: [], accounts: [] };

    return expenses.reduce((acc, expense) => {
      // Categories
      const categories = Array.isArray(expense.category)
        ? expense.category.map(c => typeof c === 'object' ? c.name : c)
        : [typeof expense.category === 'object' ? expense.category.name : expense.category];

      categories.forEach(category => {
        if (!acc.categories.includes(category)) acc.categories.push(category);
      });

      // Payment Methods
      if (!acc.paymentMethods.includes(expense.paymentMethod)) {
        acc.paymentMethods.push(expense.paymentMethod);
      }

      // Accounts
      if (expense.account && !acc.accounts.includes(expense.account)) {
        acc.accounts.push(expense.account);
      }

      return acc;
    }, { categories: [], paymentMethods: [], accounts: [] });
  }, [expenses]);

  // Debug log
  console.log('Raw expenses:', expenses);

  // Check if expenses is empty
  if (!expenses || Object.keys(expenses).length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No expenses found</Typography>
        <Typography variant="body2" color="text.secondary">
          Add some expenses to see them listed here
        </Typography>
      </Box>
    );
  }

  // Simplified grouping logic - we'll work directly with the date structure
  const dateKeys = Object.keys(expenses);

  // Setup virtualizer for dates instead of months
  const parentRef = React.useRef();

  const rowVirtualizer = useVirtualizer({
    count: dateKeys.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Adjust based on average date section height
    overscan: 1
  });

  // Add view mode toggle
  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
      <Suspense fallback={<TableSkeleton />}>
        {/* Enhanced Filter Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <TextField
              size="small"
              placeholder="Search expenses..."
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ri-search-line" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 300 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }
              }}
            />

            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => handleViewChange('list')}
                sx={{
                  color: viewMode === 'list' ? 'primary.main' : 'text.secondary'
                }}
              >
                <i className="ri-list-unordered" />
              </IconButton>
              <IconButton
                onClick={() => handleViewChange('calendar')}
                sx={{
                  color: viewMode === 'calendar' ? 'primary.main' : 'text.secondary'
                }}
              >
                <i className="ri-calendar-line" />
              </IconButton>
              <FilterButton
                onClick={() => setFilterDrawerOpen(true)}
                filterCount={getActiveFiltersCount(filters)}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Conditional render based on view mode */}
        {viewMode === 'calendar' ? (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <ExpenseCalendar
              expenses={expenses}
              onDayClick={(date) => {
                // Handle day click - maybe show details modal
                console.log('Day clicked:', date);
              }}
            />
          </Paper>
        ) : (
          // Existing list view
          <div
            ref={parentRef}
            style={{
              height: '70vh',
              overflow: 'auto',
              borderRadius: '12px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const dateKey = dateKeys[virtualRow.index];
                const dateData = expenses[dateKey];

                return (
                  <div
                    key={dateKey}
                    data-index={virtualRow.index}
                  >
                    <DateSection
                      dateKey={dateKey}
                      dateData={dateData}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onImageClick={onImageClick}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Drawer */}
        <Suspense fallback={<FilterDrawerSkeleton />}>
          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </Suspense>
      </Suspense>
    </Box>
  );
}

// Enhanced DateSection component
const DateSection = React.memo(function DateSection({
  dateKey,
  dateData,
  onDelete,
  onEdit,
  onImageClick
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Accordion
      defaultExpanded
      sx={{
        mb: 2,
        borderRadius: '12px !important',
        '&:before': { display: 'none' },
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        transition: 'box-shadow 0.3s ease'
      }}
    >
      <AccordionSummary
        // expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          '&.Mui-expanded': {
            minHeight: '64px',
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          pr: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {new Date(dateKey).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Typography>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Transactions: {dateData.items.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Total: {formatCurrency(dateData.total)}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 500 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Recurring</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Actions</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Receipt</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {dateData.items.map((expense) => (
                <TableRow
                  key={expense._id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={expense.category.name}
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'white',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: 'primary.main'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: expense.amount >= 10000 ? 'error.main' :
                          expense.amount >= 5000 ? 'warning.main' :
                            'success.main',
                        fontWeight: 500
                      }}
                    >
                      {formatCurrency(expense.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={expense.paymentMethod}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.lighter'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {expense.recurring && (
                      <Chip
                        label="Recurring"
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(expense)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.lighter'
                          }
                        }}
                      >
                        <i className="ri-edit-line" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(expense._id)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.lighter'
                          }
                        }}
                      >
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {expense.receipt && (
                      <IconButton
                        size="small"
                        onClick={() => onImageClick(expense.receipt)}
                        sx={{
                          color: 'info.main',
                          '&:hover': {
                            bgcolor: 'info.lighter'
                          }
                        }}
                      >
                        <i className="ri-image-line" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
});

const FilterButton = React.memo(function FilterButton({ onClick, filterCount }) {
  // Component implementation
});

// Constants
const defaultFilters = {
  categories: [],
  accounts: [],
  dateRange: { start: null, end: null },
  amountRange: { min: '', max: '' },
  paymentMethods: [],
  recurring: null,
  hasReceipt: null,
  searchTerm: '',
};

// Utility function to count active filters
const getActiveFiltersCount = (filters) => {
  let count = 0;
  if (filters.categories.length) count += filters.categories.length;
  if (filters.paymentMethods.length) count += filters.paymentMethods.length;
  if (filters.accounts.length) count += filters.accounts.length;
  if (filters.dateRange.start || filters.dateRange.end) count++;
  if (filters.amountRange.min || filters.amountRange.max) count++;
  if (filters.recurring !== null) count++;
  if (filters.hasReceipt !== null) count++;
  if (filters.searchTerm) count++;
  return count;
};
