import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

export default function EmployeeUpdateForm({ data, onChange, onBack, onNext }) {
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
          maxWidth: 800,
          width: '100%',
          borderRadius: 2
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#d1fae5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <i class="ri-user-line"></i>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Complete Your Profile
            </Typography>
            <Typography color="textSecondary">
              Please fill in your details to continue
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label} completed={label === steps[0]}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box component="form" noValidate autoComplete="off" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
          <Grid container spacing={2}>
            {/* First & Last Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                fullWidth
                value={data.firstName}
                onChange={e => onChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                fullWidth
                value={data.lastName}
                onChange={e => onChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </Grid>

            {/* Email (disabled) */}
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                fullWidth
                value={data.email}
                disabled
              />
            </Grid>

            {/* Phone & Department */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                fullWidth
                value={data.phone}
                onChange={e => onChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={data.department}
                  label="Department"
                  onChange={e => onChange('department', e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="engineering">Engineering</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="hr">Human Resources</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Position & Start Date */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Position"
                fullWidth
                value={data.position}
                onChange={e => onChange('position', e.target.value)}
                placeholder="Enter your position"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={data.startDate}
                onChange={e => onChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={data.address}
                onChange={e => onChange('address', e.target.value)}
                placeholder="Enter your address"
              />
            </Grid>
          </Grid>

          {/* Navigation Buttons */}
          <Box display="flex" gap={2} mt={3}>
            <Button variant="outlined" fullWidth onClick={onBack}>
              Back
            </Button>
            <Button variant="contained" fullWidth onClick={onNext}>
              Continue
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
