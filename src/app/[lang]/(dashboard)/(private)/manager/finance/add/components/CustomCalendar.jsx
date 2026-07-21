'use client'

import { useState, useMemo, useCallback } from 'react'
import { IconButton, Box, Typography } from '@mui/material'

export default function CustomCalendar({ value, onChange, transactions, selectedMonth }) {
    const [currentDate, setCurrentDate] = useState(value || new Date())

    // Memoize the transactions map for better performance
    const transactionsByDate = useMemo(() => {
        return transactions.reduce((acc, transaction) => {
            const date = transaction.date
            if (!acc[date]) {
                acc[date] = {
                    income: 0,
                    expenses: 0,
                    transactions: []
                }
            }
            if (transaction.type === 'income') {
                acc[date].income += transaction.amount
            } else {
                acc[date].expenses += transaction.amount
            }
            acc[date].transactions.push(transaction)
            return acc
        }, {})
    }, [transactions])

    const getDaysInMonth = useCallback((date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }, [])

    const getFirstDayOfMonth = useCallback((date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }, [])

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }, [])

    const getDailyTotals = useCallback((date) => {
        const dateStr = date.toISOString().split('T')[0]
        const dayData = transactionsByDate[dateStr] || { income: 0, expenses: 0 }
        return {
            income: dayData.income,
            expenses: dayData.expenses,
            total: dayData.income + dayData.expenses,
            transactions: dayData.transactions || []
        }
    }, [transactionsByDate])

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const navigationButtons = useMemo(() => ({
        prev: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)),
        next: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }), [currentDate])

    const DayCell = useCallback(({ date, isToday, isSelected }) => {
        const totals = getDailyTotals(date)
        const hasTransactions = totals.income > 0 || totals.expenses < 0

        return (
            <Box
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => onChange(date)}
                sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: '120px',
                    p: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: '#f8f9fa',
                        transform: 'scale(1.02)',
                        zIndex: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                }}
            >
                <Box className="day-header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {date.getDate()}
                    </Typography>
                    {hasTransactions && (
                        <Box
                            className={`day-indicator ${totals.total >= 0 ? 'positive' : 'negative'}`}
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: totals.total >= 0 ? '#4caf50' : '#f44336'
                            }}
                        />
                    )}
                </Box>

                {hasTransactions && (
                    <Box className="day-totals" sx={{ fontSize: '0.85rem' }}>
                        {totals.income > 0 && (
                            <Box className="income" sx={{ color: '#4caf50', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <i className="ri-arrow-up-circle-fill" />
                                {formatCurrency(totals.income)}
                            </Box>
                        )}
                        {totals.expenses < 0 && (
                            <Box className="expense" sx={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <i className="ri-arrow-down-circle-fill" />
                                {formatCurrency(Math.abs(totals.expenses))}
                            </Box>
                        )}
                        <Box
                            className={`total ${totals.total >= 0 ? 'positive' : 'negative'}`}
                            sx={{
                                mt: 0.5,
                                pt: 0.5,
                                borderTop: '1px dashed #eee',
                                fontWeight: 600,
                                color: totals.total >= 0 ? '#4caf50' : '#f44336'
                            }}
                        >
                            {formatCurrency(totals.total)}
                        </Box>
                    </Box>
                )}
            </Box>
        )
    }, [getDailyTotals, formatCurrency, onChange])

    const renderCalendarGrid = useCallback(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const days = [];

        // Empty cells
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<Box key={`empty-${i}`} className="calendar-day empty" sx={{ backgroundColor: '#fafafa' }} />)
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day)
            const isToday = new Date().toDateString() === date.toDateString()
            const isSelected = value?.toDateString() === date.toDateString()

            days.push(
                <DayCell
                    key={day}
                    date={date}
                    isToday={isToday}
                    isSelected={isSelected}
                />
            )
        }

        return days
    }, [currentDate, value, DayCell, selectedMonth])

    return (
        <Box className="custom-calendar" sx={{
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
        }}>
            <Box className="calendar-header" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: '1px solid #f0f0f0'
            }}>
                {/* <IconButton onClick={navigationButtons.prev}>
                    <i className="ri-arrow-left-s-line" />
                </IconButton> */}
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {(() => {
                        const [year, month] = selectedMonth.split('-').map(Number);
                        return `${monthNames[month - 1]} ${year}`;
                    })()}
                </Typography>
                {/* <IconButton onClick={navigationButtons.next}>
                    <i className="ri-arrow-right-s-line" />
                </IconButton> */}
            </Box>

            <Box className="weekdays-header" sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                borderBottom: '1px solid #f0f0f0'
            }}>
                {weekDays.map(day => (
                    <Typography
                        key={day}
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#666',
                            fontSize: '0.9rem'
                        }}
                    >
                        {day}
                    </Typography>
                ))}
            </Box>

            <Box className="calendar-grid" sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                backgroundColor: '#f5f5f5',
                p: '1px'
            }}>
                {renderCalendarGrid()}
            </Box>
        </Box>
    )
} 
