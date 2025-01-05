import React, { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Button, Grid, Typography } from "@mui/material";
import axios from "axios";

const AddCustomerForm = ({
    setOpenDialog,
    isEdit = false,
    selectedCustomer = null,
    refreshCustomers,
}) => {
    const [formData, setFormData] = useState({
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        },
        dateOfBirth: "",
        gender: "",
        status: "Active",
    });

    // Populate form data when editing a customer
    useEffect(() => {
        if (isEdit && selectedCustomer) {
            // Debugging: Log selectedCustomer to check its structure
            console.log("Selected Customer for Edit:", selectedCustomer);

            setFormData({
                id: selectedCustomer._id || selectedCustomer.id || null, // Use the correct field for the ID
                firstName: selectedCustomer.firstName || "",
                lastName: selectedCustomer.lastName || "",
                email: selectedCustomer.email || "",
                phone: selectedCustomer.phone || "",
                address: {
                    street: selectedCustomer.address?.street || "",
                    city: selectedCustomer.address?.city || "",
                    state: selectedCustomer.address?.state || "",
                    postalCode: selectedCustomer.address?.postalCode || "",
                    country: selectedCustomer.address?.country || "",
                },
                dateOfBirth: selectedCustomer.dateOfBirth || "",
                gender: selectedCustomer.gender || "",
                status: selectedCustomer.status || "Active",
            });
        }
    }, [isEdit, selectedCustomer]);

    // handleChange function
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes("address.")) {
            const addressField = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data Before Submission:", formData); // Debugging
    
        try {
            // No need for id in the formData when creating a new customer (POST)
            const token = localStorage.getItem("token");
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/customer`;
            const url = isEdit
                ? `${apiUrl}/updatecustomer/${formData.id}` // For update (PUT request)
                : `${apiUrl}/createcustomer`; // For create (POST request)
    
            console.log("API URL:", url); // Debugging
            console.log("Payload:", formData); // Debugging
    
            const method = isEdit ? "put" : "post";
    
            const response = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            // For creating a customer (POST request), we don't need to update the `formData.id`
            if (!isEdit) {
                // If successful, you can use the returned data from the response to refresh the list
                console.log("New Customer Created:", response.data);
            }
    
            refreshCustomers(); // Refresh customer list after successful update or create
            setOpenDialog(false); // Close dialog
            console.log(isEdit ? "Customer updated successfully" : "Customer added successfully");
        } catch (error) {
            console.error("Error submitting form:", error.response?.data || error.message);
        }
    };
    

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                {isEdit ? "Edit Customer" : "Add Customer"}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Street"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="City"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="State"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Postal Code"
                            name="address.postalCode"
                            value={formData.address.postalCode}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Date of Birth"
                            name="dateOfBirth"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" fullWidth>
                            {isEdit ? "Update" : "Submit"}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default AddCustomerForm;
