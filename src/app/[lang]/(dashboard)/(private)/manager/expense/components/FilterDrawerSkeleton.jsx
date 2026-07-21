import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

export default function FilterDrawerSkeleton() {
    return (
        <Box sx={{ width: 320, p: 2 }}>
            <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />

            {/* Categories Skeleton */}
            <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="text" width={200} height={32} sx={{ mb: 1 }} />
            ))}

            {/* Payment Methods Skeleton */}
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 1, mt: 2 }} />
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="text" width={200} height={32} sx={{ mb: 1 }} />
            ))}

            {/* Date Range Skeleton */}
            <Skeleton variant="text" width={80} height={24} sx={{ mb: 1, mt: 2 }} />
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" width={140} height={40} />
                <Skeleton variant="rectangular" width={140} height={40} />
            </Stack>

            {/* Amount Range Skeleton */}
            <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" width={140} height={40} />
                <Skeleton variant="rectangular" width={140} height={40} />
            </Stack>

            {/* Buttons Skeleton */}
            <Box sx={{ mt: 'auto', pt: 2 }}>
                <Skeleton variant="rectangular" width="100%" height={36} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={36} />
            </Box>
        </Box>
    );
} 
