"use client";

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

export default function ExpenseReports({ expenses }) {
    // Group expenses by month for chart data
    const monthlyData = {};
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + parseFloat(exp.amount);
    });
    const chartData = Object.keys(monthlyData).map(key => ({
        month: key,
        total: monthlyData[key],
    }));

    // Summary calculations
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalVAT = expenses.reduce((sum, exp) => {
        const vat = exp.vatPercentage ? (parseFloat(exp.amount) * parseFloat(exp.vatPercentage) / 100) : 0;
        return sum + vat;
    }, 0);

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
                Expense Reports & Insights
            </Typography>
            {/* <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                    Total Expenses: {totalExpenses.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                    Total VAT: {totalVAT.toFixed(2)}
                </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#1976d2" />
                </BarChart>
            </ResponsiveContainer> */}
        </Container>
    );
}
