import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  FormHelperText,
  Box,
  Typography,
  Button
} from '@mui/material';

const ChangeCompanyPassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Handle changes in password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (passwordError) {
      setPasswordError('');
    }
  };

  // Password validation
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    return isLongEnough && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  // Submit change password request
  const handleSubmitChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!validatePassword(newPassword)) {
      setPasswordError(
        'Password must contain at least 8 characters, including an uppercase letter, lowercase letter, number, and special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/change-password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === 'Password updated successfully') {
        toast.success('Password changed successfully!');
        // Clear input fields after success
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  // Toggle visibility of each password field
  const handleTogglePasswordVisibility = (field) => {
    if (field === 'current') {
      setShowCurrentPassword((prev) => !prev);
    } else if (field === 'new') {
      setShowNewPassword((prev) => !prev);
    } else if (field === 'confirm') {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <i className="ri-lock-fill" style={{ fontSize: '2rem', color: '#0070f3' }} />
        </Box>
        <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
          Change Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          To change your password, please fill in the fields below.
          Your password must contain at least 8 characters, including one uppercase letter,
          one lowercase letter, one number, and one special character.
        </Typography>
      </Box>

      {passwordError && (
        <Box sx={{ mb: 3 }}>
          <FormHelperText error>{passwordError}</FormHelperText>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Current Password
        </Typography>
        <OutlinedInput
          fullWidth
          name="currentPassword"
          placeholder="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          value={passwords.currentPassword}
          onChange={handlePasswordChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => handleTogglePasswordVisibility('current')}
                aria-label="toggle password visibility"
              >
                <i className={showCurrentPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          New Password
        </Typography>
        <OutlinedInput
          fullWidth
          name="newPassword"
          placeholder="New Password"
          type={showNewPassword ? 'text' : 'password'}
          value={passwords.newPassword}
          onChange={handlePasswordChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => handleTogglePasswordVisibility('new')}
                aria-label="toggle password visibility"
              >
                <i className={showNewPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Confirm Password
        </Typography>
        <OutlinedInput
          fullWidth
          name="confirmPassword"
          placeholder="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={passwords.confirmPassword}
          onChange={handlePasswordChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => handleTogglePasswordVisibility('confirm')}
                aria-label="toggle password visibility"
              >
                <i className={showConfirmPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSubmitChangePassword}
          sx={{ bgcolor: '#0070f3' }}
        >
          Change Password
        </Button>
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default ChangeCompanyPassword;
