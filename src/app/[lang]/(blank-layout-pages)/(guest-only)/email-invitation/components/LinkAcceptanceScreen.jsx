import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

export default function LinkAcceptanceScreen({ email, onAccept }) {
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
      <Paper
        elevation={4}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            mx: 'auto',
            width: 64,
            height: 64,
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <i class="ri-mail-line"></i>
        </Box>

        {/* Title */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Employee Invitation
        </Typography>
        <Typography color="textSecondary" mb={3}>
          You've been invited to join our team!
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={0} alternativeLabel sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Invitation Details */}
        <Box
          sx={{
            backgroundColor: '#f9fafb',
            borderRadius: 1,
            p: 2,
            mb: 3,
            textAlign: 'left'
          }}
        >
          <Typography variant="caption" color="textSecondary" gutterBottom>
            Invitation Details:
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Email:</Typography>
            <Typography fontWeight="medium">{email}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Company:</Typography>
            <Typography fontWeight="medium">TechCorp Inc.</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Status:</Typography>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.5,
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: 1,
                fontSize: '0.75rem'
              }}
            >
              Pending
            </Box>
          </Box>
        </Box>

        {/* Accept Button */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<i class="ri-checkbox-circle-line"></i>}
          onClick={onAccept}
          sx={{ mb: 2 }}
        >
          Accept Invitation
        </Button>

        <Typography variant="caption" color="textSecondary">
          By accepting, you agree to our terms and conditions.
        </Typography>
      </Paper>
    </Box>
  );
}
