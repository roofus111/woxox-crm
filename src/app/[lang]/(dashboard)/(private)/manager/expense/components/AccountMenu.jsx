"use client";

import React, { useState } from 'react';
import {
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Button,
    Typography,
    Divider,
    Box
} from '@mui/material';

export default function AccountMenu({ accounts, currentAccount, setCurrentAccount, onAddAccount }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [isAdding, setIsAdding] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');

    const handleOpen = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setIsAdding(false);
        setNewAccountName('');
    };

    const handleSelectAccount = (accountId) => {
        setCurrentAccount(accountId);
        handleClose();
    };

    const currentAccountObj = accounts.find(acc => acc.id === currentAccount);

    const handleAddAccountSubmit = () => {
        if (newAccountName.trim()) {
            const newAccount = {
                id: Date.now(), // simple id generation
                name: newAccountName.trim(),
            };
            onAddAccount(newAccount);
            setNewAccountName('');
            setIsAdding(false);
        }
    }

    return (
        <>
            <IconButton className='mr-6' onClick={handleOpen} size="large" edge="end" color="inherit">
                <i class="ri-account-circle-fill w-9 h-9"></i>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {currentAccountObj && (
                    <>
                        <MenuItem disabled>
                            <Typography variant="subtitle1">
                                Current: {currentAccountObj.name}
                            </Typography>
                        </MenuItem>
                        <Divider />
                    </>
                )}
                {accounts.map((account) => (
                    <MenuItem key={account.id} onClick={() => handleSelectAccount(account.id)}>
                        {account.name}
                    </MenuItem>
                ))}
                <Divider />
                {!isAdding ? (
                    <MenuItem onClick={() => setIsAdding(true)}>
                        <Typography variant="body2" color="primary">
                            + Add Account
                        </Typography>
                    </MenuItem>
                ) : (
                    <Box sx={{ p: 2, width: 250 }}>
                        <TextField
                            label="New Account"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            fullWidth
                            size="small"
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button onClick={handleAddAccountSubmit} variant="contained" size="small">
                                Add
                            </Button>
                        </Box>
                    </Box>
                )}
            </Menu>
        </>
    );
}