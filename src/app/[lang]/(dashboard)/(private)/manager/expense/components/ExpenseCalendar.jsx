import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, addMonths, subMonths, isSameMonth, startOfWeek, endOfWeek, isSameDay, addDays, getDay, parse } from 'date-fns';

export default function ExpenseCalendar({ expenses, onDayClick, selectedMonth }) {
    // Parse selected month string to Date object
    const initialDate = useMemo(() => {
        return parse(selectedMonth, 'yyyy-MM', new Date());
    }, [selectedMonth]);

    // State for current month navigation (initialized with selected month)
    const [currentDate, setCurrentDate] = useState(initialDate);

    // Reset current date when selected month changes
    useEffect(() => {
        setCurrentDate(parse(selectedMonth, 'yyyy-MM', new Date()));
    }, [selectedMonth]);

    // Enhanced date calculations with proper week alignment
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        // Get the start of the week for the first day of the month
        const weekStart = startOfWeek(start);
        // Get the end of the week for the last day of the month
        const weekEnd = endOfWeek(end);

        // Get all days including padding days
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }, [currentDate]);

    // Filter expenses for the current month only
    const currentMonthExpenses = useMemo(() => {
        return expenses.filter(expense =>
            isSameMonth(new Date(expense.date), currentDate)
        );
    }, [expenses, currentDate]);

    // Group expenses by date
    const expensesByDate = useMemo(() => {
        return currentMonthExpenses.reduce((acc, expense) => {
            const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    total: 0,
                    count: 0,
                    items: []
                };
            }

            acc[dateKey].items.push(expense);
            acc[dateKey].total += expense.amount;
            acc[dateKey].count += 1;

            return acc;
        }, {});
    }, [currentMonthExpenses]);

    // Memoized formatter
    const formatCurrency = useMemo(() => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        });
        return (amount) => formatter.format(amount);
    }, []);

    // Month navigation handlers
    const handlePreviousMonth = useCallback(() => {
        const newDate = subMonths(currentDate, 1);
        // Only allow navigation within the selected month
        if (format(newDate, 'yyyy-MM') === selectedMonth) {
            setCurrentDate(newDate);
        }
    }, [currentDate, selectedMonth]);

    const handleNextMonth = useCallback(() => {
        const newDate = addMonths(currentDate, 1);
        // Only allow navigation within the selected month
        if (format(newDate, 'yyyy-MM') === selectedMonth) {
            setCurrentDate(newDate);
        }
    }, [currentDate, selectedMonth]);

    // Calculate total for current month
    const currentMonthTotal = useMemo(() => {
        return currentMonthExpenses.reduce((total, expense) => total + expense.amount, 0);
    }, [currentMonthExpenses]);

    return (
        <Box sx={{ p: 2 }}>
            {/* Calendar Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
            >
                <Stack spacing={1}>
                    <Typography variant="h5">
                        {format(currentDate, 'MMMM yyyy')}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        Monthly Total: {formatCurrency(currentMonthTotal)}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <IconButton onClick={handlePreviousMonth}>
                        <i className="ri-arrow-left-s-line" />
                    </IconButton>
                    <IconButton onClick={handleNextMonth}>
                        <i className="ri-arrow-right-s-line" />
                    </IconButton>
                </Stack>
            </Stack>

            {/* Calendar Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 1,
                    mb: 2
                }}
            >
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Box
                        key={day}
                        sx={{
                            p: 1,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'text.secondary'
                        }}
                    >
                        {day}
                    </Box>
                ))}

                {/* Calendar Days with padding */}
                {calendarDays.map((date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayExpenses = expensesByDate[dateKey];
                    const isCurrentDay = isToday(date);
                    const isCurrentMonth = isSameMonth(date, currentDate);

                    return (
                        <Paper
                            key={dateKey}
                            onClick={() => isCurrentMonth && onDayClick?.(dateKey)}
                            sx={{
                                p: 1,
                                height: '120px',
                                cursor: isCurrentMonth ? 'pointer' : 'default',
                                position: 'relative',
                                bgcolor: isCurrentDay ? 'primary.lighter' :
                                    isCurrentMonth ? 'background.paper' : 'grey.50',
                                border: '1px solid',
                                borderColor: isCurrentDay ? 'primary.main' :
                                    isCurrentMonth ? 'divider' : 'grey.100',
                                opacity: isCurrentMonth ? 1 : 0.5,
                                '&:hover': {
                                    borderColor: isCurrentMonth ? 'primary.main' : 'grey.100',
                                    boxShadow: isCurrentMonth ? 1 : 0
                                },
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography
                                    sx={{
                                        fontWeight: isCurrentDay ? 'bold' : 'regular',
                                        color: isCurrentDay ? 'primary.main' :
                                            isCurrentMonth ? 'text.primary' : 'text.secondary'
                                    }}
                                >
                                    {format(date, 'd')}
                                </Typography>
                                {isCurrentDay && (
                                    <Chip
                                        label="Today"
                                        size="small"
                                        sx={{
                                            height: '16px',
                                            fontSize: '0.625rem',
                                            bgcolor: 'primary.main',
                                            color: 'white'
                                        }}
                                    />
                                )}
                            </Stack>

                            {dayExpenses && isCurrentMonth && (
                                <Stack spacing={0.5} mt="auto">
                                    <Tooltip
                                        title={`${dayExpenses.count} transaction${dayExpenses.count !== 1 ? 's' : ''}`}
                                        placement="top"
                                    >
                                        <Chip
                                            size="small"
                                            label={dayExpenses.count}
                                            sx={{
                                                bgcolor: 'primary.lighter',
                                                color: 'primary.main',
                                                fontSize: '0.75rem',
                                                height: '20px'
                                            }}
                                        />
                                    </Tooltip>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: (theme) => {
                                                // Show green for income (positive amounts) and red for expenses (negative amounts)
                                                return dayExpenses.total >= 0 ? theme.palette.success.main : theme.palette.error.main;
                                            },
                                            fontWeight: 'medium',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {formatCurrency(dayExpenses.total)}
                                    </Typography>
                                </Stack>
                            )}

                            {/* Week number indicator for first day of week */}
                            {getDay(date) === 0 && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        color: 'text.secondary',
                                        fontSize: '0.625rem'
                                    }}
                                >
                                    W{format(date, 'w')}
                                </Typography>
                            )}
                        </Paper>
                    );
                })}
            </Box>
        </Box>
    );
} 
