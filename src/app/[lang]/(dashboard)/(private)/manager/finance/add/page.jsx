'use client'

import { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Tab,
    Tabs,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Button
} from '@mui/material'
import CustomCalendar from './components/CustomCalendar'
import {
    PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import ExpenseForm from '@/app/[lang]/(dashboard)/(private)/manager/expense/components/ExpenseForm'

function TabPanel(props) {
    const { children, value, index, ...other } = props
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

// Add these helper functions before the main component
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const calculateCategoryTotals = (transactions, type) => {
    return transactions
        .filter(t => t.type === type)
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
            return acc
        }, {})
}

export default function FinanceManager() {
    const [tabValue, setTabValue] = useState(0)
    const [date, setDate] = useState(new Date())
    const [orderBy, setOrderBy] = useState('date')
    const [order, setOrder] = useState('desc')
    const [filter, setFilter] = useState('all')
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
    const [currentAccount, setCurrentAccount] = useState('all')
    const [bankAccounts, setBankAccounts] = useState([])
    const [bankAccountId, setBankAccountId] = useState(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isIncomeForm, setIsIncomeForm] = useState(false)

    // Fetch bank accounts
    const fetchBankAccounts = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/account/getbankaccounts`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                    }
                }
            )
            if (!response.ok) throw new Error('Failed to fetch bank accounts')
            const data = await response.json()
            setBankAccounts(data.data)
        } catch (err) {
            console.error('Error fetching bank accounts:', err)
            setError(err.message)
        }
    }

    // Fetch transactions based on filter
    const fetchTransactions = async (filterType) => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('token')
            const headers = {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
            }

            // Extract month and year from selectedMonth
            const [year, month] = selectedMonth.split('-')
            let allTransactions = []

            if (filterType === 'all' || filterType === 'income') {
                const queryParams = new URLSearchParams({
                    month: month,
                    year: year,
                    // Only add accountId if it exists and is not 'all'
                    ...(currentAccount && currentAccount !== 'all' && { accountId: currentAccount })
                })

                const incomeRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/income/getincome?${queryParams}`,
                    { headers }
                )
                if (!incomeRes.ok) throw new Error('Failed to fetch income data')
                const incomeData = await incomeRes.json()
                const formattedIncome = incomeData.map(income => ({
                    id: income._id,
                    date: new Date(income.date).toISOString().split('T')[0],
                    type: 'income',
                    amount: Math.abs(income.amount),
                    description: income.description,
                    category: income.category?.[0]?.name || 'Uncategorized',
                    paymentMethod: income.paymentMethod,
                    currency: income.currency,
                    bankAccountId: income.bankAccountId || null
                }))
                allTransactions = [...allTransactions, ...formattedIncome]
            }

            if (filterType === 'all' || filterType === 'expense') {
                const queryParams = new URLSearchParams({
                    month: month,
                    year: year,
                    // Only add accountId if it exists and is not 'all'
                    ...(currentAccount && currentAccount !== 'all' && { accountId: currentAccount })
                })

                const expenseRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/expense/getexpenses?${queryParams}`,
                    { headers }
                )
                if (!expenseRes.ok) throw new Error('Failed to fetch expense data')
                const expenseData = await expenseRes.json()
                const formattedExpenses = expenseData.map(expense => ({
                    id: expense._id,
                    date: new Date(expense.date).toISOString().split('T')[0],
                    type: 'expense',
                    amount: -Math.abs(expense.amount),
                    description: expense.description,
                    category: expense.category?.name || 'Uncategorized',
                    paymentMethod: expense.paymentMethod,
                    currency: expense.currency,
                    bankAccountId: expense.bankAccountId || null,
                    vat: expense.vat || 0,
                    totalAmount: expense.totalAmount || expense.amount
                }))
                allTransactions = [...allTransactions, ...formattedExpenses]
            }

            // Filter out transactions with null/undefined bankAccountId if specific account is selected
            if (currentAccount && currentAccount !== 'all') {
                allTransactions = allTransactions.filter(t => t.bankAccountId === currentAccount)
            }

            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
            setTransactions(allTransactions)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching transactions:', err)
        } finally {
            setLoading(false)
        }
    }

    // Effect to fetch bank accounts on mount
    useEffect(() => {
        fetchBankAccounts()
    }, [])

    // Effect to fetch transactions when filters change
    useEffect(() => {
        fetchTransactions(filter)
    }, [filter, selectedMonth, currentAccount])

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setFilter(newFilter)
        }
    }

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    // Function to get transactions for a specific date
    const getDailyTotals = (date) => {
        const dateStr = date.toISOString().split('T')[0]
        const dayTransactions = transactions.filter(t => t.date === dateStr)

        const income = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const expenses = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

        return {
            income,
            expenses,
            total: income + expenses
        }
    }

    // Custom tile content for calendar
    const tileContent = ({ date, view }) => {
        if (view !== 'month') return null

        const totals = getDailyTotals(date)
        if (totals.income === 0 && totals.expenses === 0) return null

        return (
            <div style={{ fontSize: '0.7em', padding: '2px', textAlign: 'left' }}>
                {totals.income > 0 && (
                    <div style={{ color: 'green' }}>
                        +{formatCurrency(totals.income)}
                    </div>
                )}
                {totals.expenses < 0 && (
                    <div style={{ color: 'red' }}>
                        {formatCurrency(totals.expenses)}
                    </div>
                )}
                <div style={{
                    color: totals.total >= 0 ? 'green' : 'red',
                    borderTop: '1px solid #eee',
                    marginTop: '2px',
                    paddingTop: '2px'
                }}>
                    {formatCurrency(totals.total)}
                </div>
            </div>
        )
    }

    // Modified table columns to match the data structure
    const renderTransactionTable = () => (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'date'}
                                direction={orderBy === 'date' ? order : 'asc'}
                                onClick={() => handleSort('date')}
                            >
                                Date
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'amount'}
                                direction={orderBy === 'amount' ? order : 'asc'}
                                onClick={() => handleSort('amount')}
                            >
                                Amount
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Currency</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell>{transaction.type}</TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell sx={{
                                color: transaction.amount < 0 ? 'error.main' : 'success.main'
                            }}>
                                {formatCurrency(transaction.amount)}
                                {transaction.type === 'expense' && transaction.vat > 0 && (
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        (Inc. VAT {transaction.vat}%)
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.paymentMethod}</TableCell>
                            <TableCell>{transaction.currency}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )

    // Bank account selector with null handling
    const BankAccountSelector = () => (
        <FormControl fullWidth>
            <InputLabel>Bank Account</InputLabel>
            <Select
                value={currentAccount || 'all'}
                onChange={(e) => setCurrentAccount(e.target.value)}
                label="Bank Account"
            >
                <MenuItem value="all">All Accounts</MenuItem>
                {bankAccounts?.map((account) => (
                    <MenuItem key={account._id} value={account._id}>
                        {account.accountName || 'Unnamed Account'}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )

    // Filter controls component with null handling
    const FilterControls = () => (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    type="month"
                    label="Select Month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <BankAccountSelector />
            </Grid>
        </Grid>
    )

    // Inside FinanceManager component, add:
    const renderInsightsTab = () => {
        // Calculate category-wise totals
        const expensesByCategory = calculateCategoryTotals(transactions, 'expense')
        const incomeByCategory = calculateCategoryTotals(transactions, 'income')

        // Prepare data for pie charts
        const expensePieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
            name: category,
            value: amount
        }))
        const incomePieData = Object.entries(incomeByCategory).map(([category, amount]) => ({
            name: category,
            value: amount
        }))

        // Prepare daily totals for trend line
        const dailyTotals = transactions.reduce((acc, t) => {
            const date = t.date
            if (!acc[date]) {
                acc[date] = { date, income: 0, expenses: 0, net: 0 }
            }
            if (t.type === 'income') {
                acc[date].income += t.amount
            } else {
                acc[date].expenses += Math.abs(t.amount)
            }
            acc[date].net = acc[date].income - acc[date].expenses
            return acc
        }, {})

        const trendData = Object.values(dailyTotals)
            .sort((a, b) => new Date(a.date) - new Date(b.date))

        return (
            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 3, backgroundColor: 'background.default' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <i className="ri-pie-chart-line" style={{ fontSize: '1.2em' }} />
                            Key Metrics
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <i className="ri-scales-3-line" style={{ fontSize: '2em', color: '#6366f1', marginBottom: '8px' }} />
                                        <Typography color="textSecondary" gutterBottom variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Income/Expense Ratio
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {totalExpenses !== 0
                                                ? (totalIncome / Math.abs(totalExpenses)).toFixed(2)
                                                : '∞'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <i className="ri-arrow-down-circle-line" style={{ fontSize: '2em', color: '#ef4444', marginBottom: '8px' }} />
                                        <Typography color="textSecondary" gutterBottom variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Largest Expense
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                            {formatCurrency(Math.min(...transactions
                                                .filter(t => t.type === 'expense')
                                                .map(t => t.amount) || [0]))}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <i className="ri-calendar-check-line" style={{ fontSize: '2em', color: '#10b981', marginBottom: '8px' }} />
                                        <Typography color="textSecondary" gutterBottom variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Average Daily Expense
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            {formatCurrency(Math.abs(totalExpenses) /
                                                (new Set(transactions
                                                    .filter(t => t.type === 'expense')
                                                    .map(t => t.date)).size || 1))}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <i className="ri-money-dollar-circle-line" style={{ fontSize: '2em', color: '#0ea5e9', marginBottom: '8px' }} />
                                        <Typography color="textSecondary" gutterBottom variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Savings Rate
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                                            {totalIncome ?
                                                `${(((totalIncome + totalExpenses) / totalIncome) * 100).toFixed(1)}%`
                                                : '0%'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Expense Distribution</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expensePieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(1)}%`}
                                >
                                    {expensePieData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Income Sources</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={incomePieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(1)}%`}
                                >
                                    {incomePieData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Cash Flow Trend</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#00C49F" name="Income" />
                                <Line type="monotone" dataKey="expenses" stroke="#FF8042" name="Expenses" />
                                <Line type="monotone" dataKey="net" stroke="#0088FE" name="Net" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        )
    }

    // Add form handlers
    const handleFormClose = () => {
        setIsFormOpen(false)
    }

    const handleFormSave = async (data) => {
        // Refresh transactions after saving
        await fetchTransactions(filter)
        setIsFormOpen(false)
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
            {/* Header with Add Transaction buttons */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4
            }}>
                <Typography variant="h4" component="h1">
                    Finance Manager
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<i className="ri-add-line" />}
                        onClick={() => {
                            setIsIncomeForm(true)
                            setIsFormOpen(true)
                        }}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 3,
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Add Income
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<i className="ri-add-line" />}
                        onClick={() => {
                            setIsIncomeForm(false)
                            setIsFormOpen(true)
                        }}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 3,
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Add Expense
                    </Button>
                </Box>
            </Box>

            {/* Render ExpenseForm when isFormOpen is true */}
            {isFormOpen && (
                <ExpenseForm
                    onClose={handleFormClose}
                    onSave={handleFormSave}
                    isIncome={isIncomeForm}
                />
            )}

            <FilterControls />

            {/* Transaction type filter */}
            <Box sx={{ mb: 3 }}>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={handleFilterChange}
                    aria-label="transaction filter"
                >
                    <ToggleButton value="all">
                        All
                    </ToggleButton>
                    <ToggleButton value="income">
                        Income
                    </ToggleButton>
                    <ToggleButton value="expense">
                        Expense
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Loading and error states */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Transaction display */}
            {!loading && !error && (
                <>
                    <Paper sx={{ mb: 3 }}>
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6">Summary</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Typography color="success.main">
                                        Total Income: {formatCurrency(totalIncome)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography color="error.main">
                                        Total Expenses: {formatCurrency(totalExpenses)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography color={totalIncome + totalExpenses >= 0 ? 'success.main' : 'error.main'}>
                                        Net: {formatCurrency(totalIncome + totalExpenses)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>

                    {/* Tabs */}
                    <Paper sx={{ width: '100%', mb: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, newValue) => setTabValue(newValue)}
                            centered
                        >
                            <Tab icon={<i className="ri-list-check-2" />} label="List View" />
                            <Tab icon={<i className="ri-calendar-2-line" />} label="Calendar View" />
                            <Tab icon={<i className="ri-bar-chart-2-line" />} label="Insights" />
                        </Tabs>

                        {/* List View */}
                        <TabPanel value={tabValue} index={0}>
                            {renderTransactionTable()}
                        </TabPanel>

                        {/* Calendar View */}
                        <TabPanel value={tabValue} index={1}>
                            <CustomCalendar
                                value={date}
                                onChange={setDate}
                                transactions={transactions}
                                selectedMonth={selectedMonth}
                            />
                        </TabPanel>

                        {/* Insights View */}
                        <TabPanel value={tabValue} index={2}>
                            {renderInsightsTab()}
                        </TabPanel>
                    </Paper>
                </>
            )}
        </Box>
    )
}
