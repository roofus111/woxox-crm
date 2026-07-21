import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  Card,
  CardContent,
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

const CompanyDetails = () => {
  // Updated initial state without Module field
  const initialCompanyData = {
    _id: "",
    name: "Acme, Inc.",
    logo: "/company-logo.png",
    website: "www.acme-inc.com",
    phone: "1234567890",
    email: "info@acme.com",
    industry: "Technology",
    employees: 150,
    gstNo: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    }
  };  

  // State for company data and UI controls
  const [companyData, setCompanyData] = useState(initialCompanyData);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState({ ...initialCompanyData });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [hasExistingLogo, setHasExistingLogo] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        const data = response.data;
        const mappedData = {
          _id: data._id,
          name: data.name,
          // Set a temporary logo; it will be updated once we fetch the image
          logo: data.profileImage?.fileUrl || "/default-profile.png",
          website: data.website,
          phone: data.phone,
          email: data.email,
          industry: data.industry,
          employees: data.employees,
          gstNo: data.gstNo || "",
          address: {
            street: data.address.street,
            country: data.address.country,
            city: data.address.city,
            state: data.address.state,
            postalCode: data.address.postalCode
          }
        };
        setCompanyData(mappedData);
        setEditedData(mappedData);
  
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/get-image`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' 
        })
        .then((imgResponse) => {
          const imageUrl = URL.createObjectURL(imgResponse.data);
          setCompanyData(prev => ({ ...prev, logo: imageUrl }));
          setHasExistingLogo(true); 
        })
        .catch((imgError) => {
          console.error("Error fetching profile image:", imgError);
          setHasExistingLogo(false); 
        });
      })
      .catch((error) => {
        console.error("Error fetching company data:", error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch company data.',
          severity: 'error'
        });
      });
  }, []);
  
  // Handle logo file selection
  const handleLogoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler to remove the current logo (reset to default)
  const handleRemoveLogo = () => {
    const token = localStorage.getItem("token");
  
    axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/remove-image`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setCompanyData((prev) => ({ ...prev, logo: "/company-logo.png" }));
      setHasExistingLogo(false); // Update state to show no logo exists
      setLogoFile(null); // Clear any selected file
      setLogoPreview(null); // Clear any preview
      setSnackbar({
        open: true,
        message: 'Logo removed successfully!',
        severity: 'success',
      });
    })
    .catch((error) => {
      console.error("Error removing logo:", error);
      setSnackbar({
        open: true,
        message: 'Failed to remove logo.',
        severity: 'error',
      });
    });
    };  

  // Handle logo upload submission
  const handleLogoUpload = () => {
    if (logoFile) {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profileImage", logoFile);
      
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // After successful upload, force re-fetch the image with a cache buster
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/get-image?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        })
        .then((imgResponse) => {
          const refreshedLogoUrl = URL.createObjectURL(imgResponse.data);
          setCompanyData(prev => ({ ...prev, logo: refreshedLogoUrl }));
          setHasExistingLogo(true);
          setSnackbar({
            open: true,
            message: 'Logo uploaded successfully!',
            severity: 'success',
          });
          setLogoDialogOpen(false);
          setLogoFile(null);
          setLogoPreview(null);
        })
        .catch((imgError) => {
          console.error("Error fetching refreshed image:", imgError);
          setSnackbar({
            open: true,
            message: 'Logo uploaded, but failed to refresh image.',
            severity: 'error',
          });
        });
      })
      .catch((error) => {
        console.error("Error uploading logo:", error);
        setSnackbar({
          open: true,
          message: 'Failed to upload logo.',
          severity: 'error',
        });
      });
    }
  };
  
  // Reset logo dialog state when opened
  const handleOpenLogoDialog = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setLogoDialogOpen(true);
  };

  // Open edit dialog with current company data
  const handleEditOpen = () => {
    setEditedData({ ...companyData });
    setEditDialogOpen(true);
  };

  // Handle form field changes for top-level fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
  };

  // Handle changes for nested address fields
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      address: {
        ...editedData.address,
        [name]: value
      }
    });
  };  

  const handleSaveChanges = () => {
    const token = localStorage.getItem("token");
    let config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    if (logoFile) {
      const payload = new FormData();
      payload.append("logo", logoFile);
      Object.keys(editedData).forEach((key) => {
        if (key === "address") {
          Object.keys(editedData.address).forEach((addrKey) => {
            payload.append(`address.${addrKey}`, editedData.address[addrKey]);
          });
        } else {
          payload.append(key, editedData[key]);
        }
      });
  
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, payload, config)
        .then((response) => {
          setCompanyData(response.data);
          setEditDialogOpen(false);
          setSnackbar({
            open: true,
            message: 'Company details updated successfully!',
            severity: 'success'
          });
          setLogoFile(null);
          setLogoPreview(null);
        })
        .catch((error) => {
          console.error("Error updating company details:", error);
          setSnackbar({
            open: true,
            message: 'Failed to update company details.',
            severity: 'error'
          });
        });
    } else {
      axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, editedData, config)
        .then((response) => {
          setCompanyData(response.data);
          setEditDialogOpen(false);
          setSnackbar({
            open: true,
            message: 'Company details updated successfully!',
            severity: 'success'
          });
        })
        .catch((error) => {
          console.error("Error updating company details:", error);
          setSnackbar({
            open: true,
            message: 'Failed to update company details.',
            severity: 'error'
          });
        });
    }
  };

  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const industryOptions = [
    "Computer Software & Engineering",
    "Information Technology",
    "Marketing & Advertising",
    "Financial Services",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Telecommunications",
    "Technology"
  ];

  // Check if company logo is the default one
  const isDefaultLogo = companyData.logo === "/company-logo.png" || companyData.logo === "/default-profile.png";

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Company Profile</Typography>
      <Card sx={{ mb: 4, boxShadow: "none" }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={companyData.logo}
                  alt={companyData.name}
                  sx={{ width: 80, height: 80, bgcolor: 'primary.main', color: 'white', fontSize: '1.9rem' }}
                >
                  {companyData.name.charAt(0)}
                </Avatar>
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    bottom: -5, 
                    right: -5,
                    backgroundColor: 'white',
                    boxShadow: 1,
                  }}
                  size="small"
                  onClick={handleOpenLogoDialog}
                >
                  <i className="ri-camera-line"></i>
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">{companyData.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {companyData.industry}
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleEditOpen}>
                Edit Company Details
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Paper sx={{ p: 5, boxShadow: "none" }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Website</Typography>
              <Typography className='text-lg'>{companyData.website}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography className='text-lg'>{companyData.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography className='text-lg'>{companyData.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">GST No.</Typography>
              <Typography className='text-lg'>{companyData.gstNo || "Not Provided"}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              <Typography className='text-lg'>
                {companyData.address.street}, {companyData.address.city}, {companyData.address.state}, {companyData.address.country}, {companyData.address.postalCode}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Employees</Typography>
              <Typography className='text-lg'>{companyData.employees}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Dialog 
  open={logoDialogOpen} 
  onClose={() => setLogoDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>Company Logo</DialogTitle>
  <DialogContent sx={{ px: 4 }}>
    <Box sx={{ my: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Avatar
          src={logoPreview || companyData.logo}
          alt={companyData.name}
          sx={{ 
            width: 150, 
            height: 150, 
            bgcolor: 'primary.main',
            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          {companyData.name.charAt(0)}
        </Avatar>
      </Box>
      
      {/* Conditional rendering based on whether there's an existing logo and whether we're in "select new" mode */}
      <Box sx={{ mx: 2 }}>
        {!hasExistingLogo && !logoFile ? (
          // No existing logo and no file selected - show enabled upload button
          <Button
            variant="outlined"
            component="label"
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
            startIcon={<i className="ri-upload-2-line"></i>}
          >
            Select Logo Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoChange}
            />
          </Button>
        ) : logoFile ? (
          // New file selected - show filename
          <Typography variant="body2" display="block" sx={{ mt: 2, textAlign: 'center' }}>
            Selected file: <strong>{logoFile.name}</strong>
          </Typography>
        ) : (
          // Existing logo but no new file selected - show disabled upload button
          <Button
            variant="outlined"
            component="label"
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
            disabled
            startIcon={<i className="ri-upload-2-line"></i>}
          >
            Select Logo Image
            <input
              type="file"
              accept="image/*"
              hidden
              disabled
            />
          </Button>
        )}
        
        {/* Help text explaining the workflow */}
        {hasExistingLogo && !logoFile && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            sx={{ mt: 2, textAlign: 'center', px: 1 }}
          >
            You must remove the existing logo before uploading a new one.
          </Typography>
        )}
      </Box>
    </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button 
          onClick={() => setLogoDialogOpen(false)}
          variant="text"
          sx={{ px: 3 }}
        >
          Cancel
        </Button>
        
        {/* Conditional action buttons */}
        {logoFile ? (
          // If new file is selected, show upload button
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogoUpload}
            sx={{ px: 3 }}
          >
            Upload Logo
          </Button>
        ) : hasExistingLogo ? (
          // If there's an existing logo but no new file, show remove button
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleRemoveLogo}
            sx={{ px: 3 }}
          >
            Remove Image
          </Button>
        ) : (
          // If no existing logo and no file selected, show disabled upload button
          <Button 
            variant="contained" 
            disabled
            sx={{ px: 3 }}
          >
            Upload Logo
          </Button>
        )}
      </DialogActions>
    </Dialog>
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Company Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="name"
                value={editedData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  name="industry"
                  value={editedData.industry}
                  label="Industry"
                  onChange={handleInputChange}
                >
                  {industryOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={editedData.website}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={editedData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editedData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST No."
                name="gstNo"
                value={editedData.gstNo}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">Address</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street"
                name="street"
                value={editedData.address.street}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={editedData.address.country}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={editedData.address.city}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={editedData.address.state}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={editedData.address.postalCode}
                onChange={handleAddressChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyDetails;