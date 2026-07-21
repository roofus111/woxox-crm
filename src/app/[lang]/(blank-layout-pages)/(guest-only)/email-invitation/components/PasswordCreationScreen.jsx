"use client"

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  InputAdornment,
  IconButton,
  Button
} from '@mui/material';

export default function PasswordCreationScreen({ onBack, onCreate }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const steps = ['Invitation', 'Profile', 'Password'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper elevation={4} sx={{ p: 4, maxWidth: 480, width: '100%', borderRadius: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#ede9fe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <i class="ri-lock-2-line"></i>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Create Password
            </Typography>
            <Typography color="textSecondary">
              Set up your login credentials
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={2} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, idx) => (
            <Step key={label} completed={idx < 2}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box component="form" noValidate autoComplete="off" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
          <TextField
            fullWidth
            label="Password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(v => !v)} edge="end">
                    {showPwd ? <i class="ri-eye-off-line"></i> : <i class="ri-eye-line"></i>}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm your password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                    {showConfirm ? <i class="ri-eye-off-line"></i> : <i class="ri-eye-line"></i>}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Navigation Buttons */}
          <Box display="flex" gap={2} mt={3}>
            <Button variant="outlined" fullWidth onClick={onBack}>
              Back
            </Button>
            <Button variant="contained" fullWidth onClick={onCreate}>
              Create Account
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
