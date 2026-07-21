import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { useSession } from 'next-auth/react';

const ProfileSection = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [profile, setProfile] = useState(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('/default-profile.png');
  const [hasExistingAvatar, setHasExistingAvatar] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: ''
  });

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setEditedData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || ''
        });

        // Fetch the profile image using the specified API endpoint
        axios
          .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/get/image`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          })
          .then((imgRes) => {
            const imageUrl = URL.createObjectURL(imgRes.data);
            setAvatarPreview(imageUrl);
            setHasExistingAvatar(true);
          })
          .catch((imgError) => {
            console.error('Error fetching profile image:', imgError);
            setAvatarPreview('/default-profile.png');
            setHasExistingAvatar(false);
          });
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setSnackbar({ open: true, message: 'Error fetching profile', severity: 'error' });
      });
  };

  // -------- Avatar (Image) Dialog Handlers --------
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = () => {
    if (!avatarFile) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profileImage', avatarFile);

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const updatedUrl = res.data.fileUrl;
        if (updatedUrl) {
          const refreshedUrl = `${updatedUrl}?t=${Date.now()}`;
          setAvatarPreview(refreshedUrl);
          // Update profile state if needed
          setProfile((prev) => ({ ...prev, profileImage: { fileUrl: refreshedUrl } }));
        } else {
          // Even if the API did not return a valid URL, we still have a preview image to show
          // So we mark that an image exists.
          setSnackbar({ open: true, message: 'Profile image updated successfully!', severity: 'success' });
        }
        setHasExistingAvatar(true);
        setAvatarFile(null);
        setAvatarDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error uploading avatar:', error);
        setSnackbar({ open: true, message: 'Failed to upload avatar', severity: 'error' });
      });
  };

  const handleRemoveAvatar = () => {
    const token = localStorage.getItem('token');
    axios
      .delete(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/remove-image`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setAvatarPreview('/default-profile.png');
        setHasExistingAvatar(false);
        setAvatarFile(null);
        setSnackbar({ open: true, message: 'Profile image removed successfully!', severity: 'success' });
        // Optionally update profile state
        setProfile((prev) => ({ ...prev, profileImage: null }));
      })
      .catch((error) => {
        console.error('Error removing avatar:', error);
        setSnackbar({ open: true, message: 'Failed to remove avatar', severity: 'error' });
      });
  };

  // -------- Profile Details Dialog Handlers --------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    const token = localStorage.getItem('token');
    axios
      .put(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/put/${userId}`, editedData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setProfile(res.data.profile);
        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        setEditDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        setSnackbar({ open: true, message: 'Error updating profile', severity: 'error' });
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Helper to get initials
  const getInitials = () => {
    const f = profile.firstName?.[0] || '';
    const l = profile.lastName?.[0] || '';
    return (f + l).toUpperCase() || 'U';
  };

  // Define whether an image is showing (i.e. not the default)
  const imageExists = avatarPreview && avatarPreview !== '/default-profile.png';

  // Determine active user status (example logic)
  const isActiveUser = profile.isActive !== false;

  return (
    <Box>
      {/* Top section */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#E7F3FF',
          p: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          {/* Left side: Avatar and Info */}
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarPreview}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', color: 'white' }}
                >
                  {getInitials()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    backgroundColor: 'white',
                    boxShadow: 1
                  }}
                  size="small"
                  onClick={() => setAvatarDialogOpen(true)}
                >
                  <i className="ri-camera-line"></i>
                </IconButton>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Role: {profile.role}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Email: {profile.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Status:
                  </Typography>
                  <Box
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.2,
                      borderRadius: 1,
                      fontSize: '0.8rem',
                      color: isActiveUser ? 'green' : 'red',
                      backgroundColor: isActiveUser ? '#DFF7E0' : '#FCE2E2'
                    }}
                  >
                    {isActiveUser ? 'Active' : 'Inactive'}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right side: Edit Profile button */}
          <Grid item>
            <Button variant="outlined" onClick={() => setEditDialogOpen(true)} sx={{ textTransform: 'none' }}>
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Info section */}
      <Box sx={{ p: 3, mt: 2, backgroundColor: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
            Info
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', rowGap: 1.5 }}>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary' }}>
              First Name
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              : {profile.firstName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary' }}>
              Last Name
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              : {profile.lastName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary' }}>
              Email
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              : {profile.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary' }}>
              Phone Number
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              : {profile.phone}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary' }}>
              Role
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              : {profile.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* -------- Avatar Edit Dialog -------- */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>Update Profile Image</DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
            <Avatar
              src={avatarPreview}
              alt={`${profile.firstName} ${profile.lastName}`}
              sx={{ width: 150, height: 150, mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
            >
              {getInitials()}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
              disabled={hasExistingAvatar && !avatarFile}
              startIcon={<i className="ri-upload-2-line"></i>}
            >
              Select Image
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </Button>
            {avatarFile && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected file: <strong>{avatarFile.name}</strong>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          <Button onClick={() => setAvatarDialogOpen(false)} variant="text">
            Cancel
          </Button>
          {avatarFile ? (
            <Button variant="contained" color="primary" onClick={handleAvatarUpload}>
              Upload Image
            </Button>
          ) : imageExists ? (
            <Button variant="contained" color="error" onClick={handleRemoveAvatar}>
              Remove Image
            </Button>
          ) : (
            <Button variant="contained" disabled>
              Upload Image
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* -------- Profile Details Edit Dialog -------- */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" name="firstName" value={editedData.firstName} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" name="lastName" value={editedData.lastName} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" name="email" value={editedData.email} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone" name="phone" value={editedData.phone} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select name="role" value={editedData.role} label="Role" onChange={handleInputChange}>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSection;
