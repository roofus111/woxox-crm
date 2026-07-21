"use client";

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function AccountSwitcher({ accounts, currentAccount, setCurrentAccount }) {
    return (
        <FormControl variant="outlined" size="small" sx={{ minWidth: 160, mr: 2 }}>
            <InputLabel id="account-switcher-label">Account</InputLabel>
            <Select
                labelId="account-switcher-label"
                value={currentAccount}
                onChange={(e) => setCurrentAccount(e.target.value)}
                label="Account"
            >
                {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                        {account.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}