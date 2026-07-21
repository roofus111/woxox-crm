import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    InputAdornment,
    Button,
    Stack,
    Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function FilterDrawer({
    open,
    onClose,
    filters,
    filterOptions,
    onFilterChange,
    onClearFilters,
}) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 320, p: 2 }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>

                {/* Categories */}
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Categories</Typography>
                    <FormGroup>
                        {filterOptions.categories.map(category => (
                            <FormControlLabel
                                key={category}
                                control={
                                    <Checkbox
                                        checked={filters.categories.includes(category)}
                                        onChange={(e) => onFilterChange('categories', category, e.target.checked)}
                                        size="small"
                                    />
                                }
                                label={category}
                            />
                        ))}
                    </FormGroup>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                {/* Payment Methods */}
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Payment Methods</Typography>
                    <FormGroup>
                        {filterOptions.paymentMethods.map(method => (
                            <FormControlLabel
                                key={method}
                                control={
                                    <Checkbox
                                        checked={filters.paymentMethods.includes(method)}
                                        onChange={(e) => onFilterChange('paymentMethods', method, e.target.checked)}
                                        size="small"
                                    />
                                }
                                label={method}
                            />
                        ))}
                    </FormGroup>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                {/* Accounts */}
                {filterOptions.accounts.length > 0 && (
                    <>
                        <FormControl component="fieldset" sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Accounts</Typography>
                            <FormGroup>
                                {filterOptions.accounts.map(account => (
                                    <FormControlLabel
                                        key={account}
                                        control={
                                            <Checkbox
                                                checked={filters.accounts.includes(account)}
                                                onChange={(e) => onFilterChange('accounts', account, e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label={account}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                {/* Date Range */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Date Range</Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <DatePicker
                        label="Start Date"
                        value={filters.dateRange.start}
                        onChange={(newValue) => onFilterChange('dateRange', { ...filters.dateRange, start: newValue })}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                        label="End Date"
                        value={filters.dateRange.end}
                        onChange={(newValue) => onFilterChange('dateRange', { ...filters.dateRange, end: newValue })}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Amount Range */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Amount Range</Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        label="Min"
                        type="number"
                        value={filters.amountRange.min}
                        onChange={(e) => onFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                    />
                    <TextField
                        size="small"
                        label="Max"
                        type="number"
                        value={filters.amountRange.max}
                        onChange={(e) => onFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Additional Filters */}
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Additional Filters</Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.recurring === true}
                                    indeterminate={filters.recurring === null}
                                    onChange={() => onFilterChange('recurring', !filters.recurring)}
                                    size="small"
                                />
                            }
                            label="Recurring Expenses"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.hasReceipt === true}
                                    indeterminate={filters.hasReceipt === null}
                                    onChange={() => onFilterChange('hasReceipt', !filters.hasReceipt)}
                                    size="small"
                                />
                            }
                            label="Has Receipt"
                        />
                    </FormGroup>
                </FormControl>

                {/* Action Buttons */}
                <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClearFilters}
                        sx={{ mb: 1 }}
                    >
                        Clear Filters
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onClose}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
} 
