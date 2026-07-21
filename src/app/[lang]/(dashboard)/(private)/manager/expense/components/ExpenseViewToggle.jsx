"use client";

import React from 'react';
import {
    ToggleButtonGroup,
    ToggleButton,
    Box,
    Tooltip,
    useTheme,
    useMediaQuery
} from '@mui/material';

export default function ExpenseViewToggle({ value, onChange }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (event, newValue) => {
        if (newValue !== null) {
            onChange(newValue);
        }
    };

    const views = [
        {
            value: 'list',
            icon: 'ri-list-check-2',
            label: 'List View'
        },
        {
            value: 'grid',
            icon: 'ri-grid-fill',
            label: 'Grid View'
        },
        {
            value: 'calendar',
            icon: 'ri-calendar-2-fill',
            label: 'Calendar View'
        },
        {
            value: 'analytics',
            icon: 'ri-bar-chart-2-fill',
            label: 'Analytics View'
        }
    ];

    return (
        <Box sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
            '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '8px !important',
                mx: 0.5,
                px: isMobile ? 2 : 3,
                py: 1.5,
                color: 'text.secondary',
                '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    }
                },
                '&:hover': {
                    backgroundColor: 'action.hover',
                }
            }
        }}>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={handleChange}
                aria-label="view mode"
            >
                {views.map((view) => (
                    <Tooltip key={view.value} title={view.label}>
                        <ToggleButton
                            value={view.value}
                            aria-label={view.label}
                            sx={{
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <i className={view.icon} style={{ fontSize: '1.2rem' }} />
                                {!isMobile && view.label}
                            </Box>
                        </ToggleButton>
                    </Tooltip>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
} 
