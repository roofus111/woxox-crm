import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Skeleton,
    Stack,
} from '@mui/material';

export default function InsightsPanelSkeleton() {
    return (
        <Box sx={{ mt: 2, mb: 3 }}>
            <Grid container spacing={2}>
                {[...Array(4)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width={150} height={32} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width={100} height={20} />
                                {index === 3 && (
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        {[...Array(3)].map((_, i) => (
                                            <Box key={i}>
                                                <Skeleton variant="text" width={140} height={20} sx={{ mb: 0.5 }} />
                                                <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 
