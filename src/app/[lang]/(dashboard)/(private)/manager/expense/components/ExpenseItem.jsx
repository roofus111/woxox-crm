"use client";

import React, { useState } from "react";
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
    ButtonGroup,
    Typography,
    Box,
} from "@mui/material";

export default function ExpenseItem({ expense, onDelete, onEdit }) {
    const [showReceipt, setShowReceipt] = useState(false);

    // Add status color mapping
    const getStatusColor = (amount) => {
        if (amount >= 10000) return 'error.main';
        if (amount >= 5000) return 'warning.main';
        return 'success.main';
    };

    return (
        <TableContainer
            component={Paper}
            sx={{
                mb: 2,
                boxShadow: 2,
                borderRadius: 2,
                '& .MuiTableCell-root': {
                    fontSize: '0.95rem',
                    py: 2
                }
            }}
        >
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.light' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Method</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Recurring</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Receipt</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    <TableRow
                        hover
                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                            <Chip
                                label={expense.category}
                                size="small"
                                sx={{ bgcolor: 'primary.light', color: 'white' }}
                            />
                        </TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Typography
                                color={getStatusColor(expense.amount)}
                                fontWeight="medium"
                            >
                                ₹{expense.amount.toFixed(2)}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Chip
                                label={expense.paymentMethod}
                                size="small"
                                variant="outlined"
                            />
                        </TableCell>
                        <TableCell>
                            {expense.isRecurring && (
                                <Chip
                                    label="Recurring"
                                    size="small"
                                    color="secondary"
                                    sx={{ fontWeight: 'medium' }}
                                />
                            )}
                        </TableCell>
                        <TableCell>
                            <ButtonGroup size="small" aria-label="expense actions">
                                <Button
                                    onClick={() => onEdit(expense)}
                                    sx={{ mr: 1 }}
                                >
                                    <i className="ri-edit-line ri-lg" style={{ marginRight: '8px' }} />
                                    Edit
                                </Button>
                                <Button
                                    color="error"
                                    onClick={() => onDelete(expense.id)}
                                >
                                    <i className="ri-delete-bin-line ri-lg" style={{ marginRight: '8px' }} />
                                    Delete
                                </Button>
                            </ButtonGroup>
                        </TableCell>
                        <TableCell>
                            {expense.receiptImage && (
                                <Button
                                    onClick={() => setShowReceipt(!showReceipt)}
                                >
                                    <i className={`${showReceipt ? 'ri-eye-off-line' : 'ri-eye-line'} ri-lg`} style={{ marginRight: '8px' }} />
                                    {showReceipt ? "Hide" : "View"}
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>

                    {showReceipt && expense.receiptImage && (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <Box
                                    sx={{
                                        position: "relative",
                                        width: 200,
                                        height: 200,
                                        mx: 'auto',
                                        my: 2,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        boxShadow: 3
                                    }}
                                >
                                    <Image
                                        src={expense.receiptImage}
                                        alt="Receipt"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
