import React from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Skeleton,
    Box,
} from '@mui/material';

export default function TableSkeleton() {
    return (
        <TableContainer
            component={Paper}
            sx={{
                mb: 2,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        {/* Header cells */}
                        {[...Array(8)].map((_, index) => (
                            <TableCell key={index}>
                                <Skeleton variant="text" width={100} height={24} />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Month header skeleton */}
                    <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                        <TableCell colSpan={8}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Skeleton variant="text" width={200} height={32} />
                                <Skeleton variant="text" width={120} height={32} />
                            </Box>
                        </TableCell>
                    </TableRow>

                    {/* Date header skeleton */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell colSpan={8}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Skeleton variant="text" width={250} height={24} />
                                <Skeleton variant="text" width={100} height={24} />
                            </Box>
                        </TableCell>
                    </TableRow>

                    {/* Expense rows skeleton */}
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Skeleton variant="text" width={150} />
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="rounded" width={80} height={24} />
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="text" width={100} />
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="text" width={80} />
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="text" width={120} />
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="rounded" width={80} height={24} />
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Skeleton variant="rounded" width={36} height={36} />
                                    <Skeleton variant="rounded" width={36} height={36} />
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Skeleton variant="rounded" width={36} height={36} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
} 
