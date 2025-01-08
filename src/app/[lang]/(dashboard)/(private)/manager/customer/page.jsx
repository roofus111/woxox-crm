"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    TableSortLabel,
    Dialog,
    Drawer,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
    Tabs,
    Tab,
    Avatar,
    TextField,
    Grid,
    Card,
    CardContent,
    MenuItem,
} from "@mui/material";
import AddCustomerForm from "@/views/apps/customer/Addcustomer";
import { state } from "@formkit/drag-and-drop";

const Customer = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [sortBy, setSortBy] = useState({ field: null, direction: "asc" });
    const [selectedRows, setSelectedRows] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);

    const [isEditable, setIsEditable] = useState(false);
    const [customerId, setCustomerId] = useState("");

    const activities = [
        {
            title: "Project Update",
            description: "Finalized project timeline and deliverables.",
            date: "2024-12-15",
            time: "10:30 AM",
        },
        {
            title: "Design Review",
            description: "Reviewed the latest designs and provided feedback.",
            date: "2024-12-14",
            time: "3:00 PM",
        },
    ];

    const invoiceData = [
        {
            id: 1,
            createdAt: '2024-06-12',
            billNumber: 'INV-2024-001',
            refId: 'REF12345',
            paymentStatus: 'Paid',
            totalAmount: '₹15,000',
            balance: '₹0',
        },
    ];

    const handleViewInvoice = () => {
        // Set the invoice details and open the modal
        setInvoiceDetails(invoiceData[0]); // Use the first item from the array
        setOpenModal(true);
    };

    const leadsData = [
        {
            id: 1,
            createdDate: '2024-06-01',
            campaignName: 'Summer Sales Campaign',
            campaignDescription: 'A campaign to boost summer product sales.',
            status: 'Active',
            assignedTo: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
        },
        {
            id: 2,
            createdDate: '2024-06-05',
            campaignName: 'Winter Discounts Campaign',
            campaignDescription: 'Special discounts on winter essentials.',
            status: 'Pending',
            assignedTo: { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
        },
        {
            id: 3,
            createdDate: '2024-06-10',
            campaignName: 'Back-to-School Campaign',
            campaignDescription: 'Promoting school supplies and uniforms.',
            status: 'Completed',
            assignedTo: { name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=3' },
        },
    ];

    const handleDownloadInvoice = async (invoiceId) => {
        try {
            // Simulating an API call to get the invoice file URL
            const invoiceUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/download/${invoiceId}`;

            // Create an anchor element to trigger the download
            const link = document.createElement("a");
            link.href = invoiceUrl;  // Set the file URL
            link.download = `Invoice-${invoiceId}.pdf`;  // Set the default filename
            link.click();  // Trigger the download
        } catch (error) {
            console.error("Error downloading the invoice:", error);
        }
    };


    // Fetch customers dynamically
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/getcustomers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Fetched customers:", response.data);
            response.data.customers.forEach((customer) => {
                console.log("Customer ID:", customer._id);
            });
            setCustomers(response.data.customers); // Update the state with fetched data



        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to add a new customer and update the customer list using ...prev
    const addCustomer = async (customerData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/customer/createcustomer`,
                customerData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Customer added successfully:', response.data);

            // Update customers list using spread operator to retain previous state
            setCustomers((prevCustomers) => [
                ...prevCustomers, // Keep previous customers
                response.data, // Add the newly created customer
            ]);
            handleCloseDialog(); // Close the dialog after successful submission
        } catch (error) {
            console.error('Error adding customer:', error);
        }
    };


    const [openEditDialog, setOpenEditDialog] = useState(false);

    console.log(customerId);


    useEffect(() => {

        if (!customerId) return;

        const fetchCustomerData = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token");
                console.log(token);

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/customer/getcustomer/${customerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log("umesh", response.data);
                const customer = response.data.customer;

                const flattenedData = {
                    ...customer,
                    ...customer.address,
                };

                delete flattenedData.address;
                setFormData(flattenedData);
            } catch (error) {
                console.error("Error fetching customer data:", error);
                setError("Failed to fetch customer data", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, [customerId]);

    useEffect(() => {
        if (!customerId) return;
    
        const fetchCustomerData = async () => {
            setLoading(true);
            setError(null);
    
            try {
                const token = localStorage.getItem("token");
                console.log(token);
    
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/customer/getcustomer/${customerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log("Response Data:", response.data);
                console.log("leadID", response.data.leadID);
                
                const leadIds = response.data.leadIds;
    
                // Combine customer and lead data
                const combinedData = {
                    ...flattenedCustomerData,
                    leadIds, // Add leadIds to the state
                };
    
                setFormData(combinedData);
            } catch (error) {
                console.error("Error fetching customer data:", error);
                setError("Failed to fetch customer data");
            } finally {
                setLoading(false);
            }
        };
    
        fetchCustomerData();
    }, [customerId]);
    

    // handleChange function
    const handleChange = ({ target: { name, value } }) => {
        if (name.startsWith("address.")) {
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

    // Handle "Edit" button click
    const handleEdit = () => {
        setIsEditable(true); // Enable the fields for editing
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            // Prepare the updated customer data
            const updatedData = {
                ...formData,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country,
                },
            };

            // Remove street, city, state, postalCode, country from the formData object
            delete updatedData.street;
            delete updatedData.city;
            delete updatedData.state;
            delete updatedData.postalCode;
            delete updatedData.country;

            console.log("Sending updated data:", updatedData); // Log to check the data

            // Make the PUT request to update the customer
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/customer/updatecustomer/${customerId}`,
                updatedData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            
            // Handle successful update
            console.log("Customer updated successfully:", response.data);
            setIsEditable(false); // Disable the fields after saving
        } catch (error) {
            // Handle and log error
            console.error("Error updating customer:", error.response?.data || error.message);
        }
    };

    const handleOpenEditDialog = (id) => {
        setCustomerId(id);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setCustomerId("");
        setFormData({});
        setIsEditable(false);
    };

    // const updateCustomer = async (id, updatedData) => {
    //     try {
    //         const token = localStorage.getItem('token');
    //         await axios.put(
    //             `${process.env.NEXT_PUBLIC_API_URL}/api/customer/updatecustomer/${_id}`,
    //             updatedData,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //         setCustomers((prev) =>
    //             prev.map((customer) =>
    //                 customer._id === id ? { ...customer, ...updatedData } : customer
    //             )
    //         );
    //         setOpenEditDialog(false); // Close the dialog after successful update
    //     } catch (error) {
    //         console.error("Error updating customer:", error);
    //     }
    // };


    // Delete a customer
    const deleteCustomer = async (_id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/deletecustomer/${_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCustomers((prev) => prev.filter((customer) => customer._id !== _id)); // Use _id to filter customers
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    };

    useEffect(() => {
        fetchCustomers(); // Fetch data when the component mounts
    }, []);

    // Handle Tab Change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Function to open the dialog
    const handleOpenDialog = () => {
        setOpenAddDialog(true);
    };

    // Function to close the dialog
    const handleCloseDialog = () => {
        setOpenAddDialog(false);
    };

    // Handle sorting
    const handleSort = (field) => {
        const isAsc = sortBy.field === field && sortBy.direction === "asc";
        setSortBy({ field, direction: isAsc ? "desc" : "asc" });
    };

    const sortedCustomers = Array.isArray(customers) ? [...customers].sort((a, b) => {
        if (!sortBy.field) return 0;
        const valueA = a[sortBy.field];
        const valueB = b[sortBy.field];
        if (valueA < valueB) return sortBy.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortBy.direction === "asc" ? 1 : -1;
        return 0;
    }) : [];      // Handle row selection
    const handleRowSelect = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    // Handle "Select All" checkbox
    const handleSelectAll = () => {
        if (selectedRows.length === customers.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(customers.map((customer) => customer.id));
        }
    };

    // Drawer open and close
    const handleOpenDrawer = (customer) => {
        setSelectedCustomer(customer);
        setDrawerOpen(true);
        // Map the customer data to formData
        setFormData({
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email || "",
            phone: customer.phone || "",
            address: {
                street: customer.address?.street || "",
                city: customer.address?.city || "",
                state: customer.address?.state || "",
                postalCode: customer.address?.postalCode || "",
                country: customer.address?.country || "",
            },
            dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split("T")[0] : "", // Format the date
            gender: customer.gender || "",
            status: customer.status || "Active",
        });
    };
    const handleCloseDrawer = () => {
        setSelectedCustomer(null);
        setDrawerOpen(false);
    };

    const handleViewLead = (id) => console.log(`Viewing lead with ID: ${id}`);
    const handleEditLead = (id) => console.log(`Editing lead with ID: ${id}`);

    const refreshCustomers = () => {
        fetchCustomers(); // Call fetchCustomers to reload the customer list
    };

    return (
        <div>
            {/* Add Customer Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <AddCustomerForm
                        setOpenDialog={setOpenAddDialog}
                        isEdit={isEditable}
                        selectedCustomer={selectedCustomer}
                        refreshCustomers={refreshCustomers}  // Ensure this is passed properly
                    />
                </DialogContent>
            </Dialog>

            <Button
                variant="contained"
                onClick={() => setOpenAddDialog(true)}
                sx={{ mb: 4 }}
            >
                Add Customer
            </Button>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Checkbox
                                    indeterminate={
                                        selectedRows.length > 0 && selectedRows.length < customers.length
                                    }
                                    checked={selectedRows.length === customers.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy.field === "firstName"}
                                    direction={sortBy.field === "firstName" ? sortBy.direction : "asc"}
                                    onClick={() => handleSort("firstName")}
                                >
                                    <strong>Name</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy.field === "email"}
                                    direction={sortBy.field === "email" ? sortBy.direction : "asc"}
                                    onClick={() => handleSort("email")}
                                >
                                    <strong>Email</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <strong>Phone</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Actions</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCustomers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.includes(customer.id)}
                                        onChange={() => handleRowSelect(customer.id)}
                                    />
                                </TableCell>
                                <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => handleOpenDrawer(customer)} // Use handleOpenDrawer instead of handleCloseDrawer
                                        sx={{
                                            borderColor: "#007BFF",
                                            color: "#007BFF",
                                            fontWeight: "bold",
                                            borderRadius: "50%",
                                            padding: 1,
                                            "&:hover": {
                                                backgroundColor: "rgba(0, 123, 255, 0.1)",
                                                borderColor: "#0056b3",
                                                color: "#0056b3",
                                            },
                                            mx: 1,
                                        }}
                                    >
                                        <i class="ri-eye-line" sx={{ fontSize: 24 }} />
                                    </Button>

                                    {/* <Button
                                        onClick={() => handleEdit(customer)} // Open edit dialog and pass customer data
                                        sx={{
                                            borderColor: "green",
                                            color: "green",
                                            fontWeight: "bold",
                                            borderRadius: "50%",
                                            padding: 1,
                                            "&:hover": {
                                                backgroundColor: "rgba(255, 193, 7, 0.1)",
                                                borderColor: "green",
                                                color: "green",
                                            },
                                            mx: 2,
                                        }}
                                    >
                                        <i class="ri-edit-line" sx={{ fontSize: 20 }} />
                                    </Button> */}

                                    <Button
                                        onClick={() => deleteCustomer(customer._id)} // Call deleteCustomer with customer id
                                        sx={{
                                            borderColor: "#DC3545",
                                            color: "#DC3545",
                                            fontWeight: "bold",
                                            borderRadius: "50%",
                                            padding: 1,
                                            "&:hover": {
                                                backgroundColor: "rgba(220, 53, 69, 0.1)",
                                                borderColor: "#b21f2d",
                                                color: "#b21f2d",
                                            },
                                            mx: 1,
                                        }}
                                    >
                                        <i class="ri-delete-bin-line" sx={{ fontSize: 20 }} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogContent>
                        {selectedCustomer && (
                            <AddCustomerForm
                                customer={selectedCustomer} // Pass the selected customer data to the form
                                setOpenAddDialog={setOpenEditDialog}
                                addCustomer={addCustomer} // You can reuse the addCustomer function for updating
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </TableContainer>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseDrawer}
                PaperProps={{
                    sx: {
                        width: {
                            xs: "100%", // Full width for extra-small devices
                            sm: "90%",  // 90% for small devices
                            md: "50%",  // Half width for medium devices
                            lg: "40%",  // 40% for larger devices
                        },
                        padding: { xs: 2, sm: 3 },
                        background: "linear-gradient(135deg, #ffffff, #f8f9fa)", // Subtle premium gradient
                        boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)", // Stronger shadow for depth
                        borderRadius: { xs: 0, sm: "16px 0 0 16px" }, // Rounded corners only on larger screens
                    },
                }}
            >
                <Box>
                    {/* Top Section */}
                    <Box
                        sx={{
                            backgroundColor: "#007bff", // Premium blue background
                            color: "white",
                            padding: { xs: 2, sm: 3 },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            height: { xs: "120px", sm: "140px" },
                        }}
                    >
                        {selectedCustomer?.profileImage ? (
                            <Avatar
                                src={selectedCustomer.profileImage}
                                alt={selectedCustomer.firsrName}
                                sx={{
                                    width: { xs: 80, sm: 100 },
                                    height: { xs: 80, sm: 100 },
                                    border: "3px solid #28a745",
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)", // Premium shadow
                                    position: "absolute",
                                    top: { xs: "calc(100% + 10px)", sm: "50%" },
                                    transform: "translateY(-50%)",
                                }}
                            />
                        ) : (
                            <Avatar
                                sx={{
                                    width: { xs: 80, sm: 100 },
                                    height: { xs: 80, sm: 100 },
                                    backgroundColor: "#28a745",
                                    fontSize: { xs: 24, sm: 32 },
                                    fontWeight: "bold",
                                    color: "white",
                                    position: "absolute",
                                    top: { xs: "calc(100% + 10px)", sm: "50%" },
                                    transform: "translateY(-50%)",
                                }}
                            >
                                {selectedCustomer?.firstName?.charAt(0)}
                            </Avatar>
                        )}
                    </Box>

                    {/* Customer Details */}
                    <Box
                        sx={{
                            backgroundColor: "white",
                            padding: { xs: 2, sm: 4 },
                            textAlign: "center",
                            borderRadius: { sm: "0 0 16px 16px" },
                        }}
                    >
                        <Grid container spacing={2}>
                            {/* Name Section */}
                            <Grid item xs={3} sm={4}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#495057",
                                        fontWeight: "bold",
                                        fontSize: { xs: "0.9rem", sm: "1rem" },
                                        textAlign: "center",
                                    }}
                                >
                                    {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                                </Typography>
                                <Chip
                                    label="Premium"
                                    variant="outlined"
                                    sx={{
                                        marginTop: 1,
                                        fontSize: "0.8rem",
                                        color: "#007bff",
                                        borderColor: "#007bff",
                                        height: "24px",
                                    }}
                                />
                            </Grid>

                            {/* Email & Phone */}
                            <Grid item xs={12} sm={8}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#495057",
                                        fontSize: "0.8rem",
                                        textAlign: { xs: "center", sm: "right" },
                                    }}
                                >
                                    Email: {selectedCustomer?.email}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#495057",
                                        fontSize: "0.8rem",
                                        textAlign: { xs: "center", sm: "right" },
                                    }}
                                >
                                    Phone: {selectedCustomer?.phone || "Not available"}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* User Details (Name, Email, Phone, Address) - Horizontal Row */}
                    {/* <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 4, // Add space between the items
                        paddingBottom: 2,
                    }}
                    >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Name
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Email
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.email}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Phone
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.phone}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Address
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.address}
                        </Typography>
                    </Box>
                    </Box> */}

                    {/* Tabs for Additional Customer Details */}
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                        sx={{ marginBottom: 2, marginTop: 6 }}
                    >
                        <Tab label="Basic" />
                        <Tab label="Lead" />
                        <Tab label="Documents" />
                        <Tab label="Activity" />
                        <Tab label="Sales" />
                    </Tabs>

                    {/* Display content based on active tab */}
                    <Box
                        sx={{
                            paddingTop: 2,
                            overflowY: "auto", // Ensure scrolling for content if it's long
                            maxHeight: "60vh", // Limit the height of the content to avoid overflow
                        }}
                    >
                        {tabValue === 0 && (
                            <Box sx={{ width: '100%', padding: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                                <Typography variant="h6">Basic Information</Typography>
                                <Box sx={{ padding: 2 }}>
                                    {/* Render form fields dynamically */}
                                    <form>
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
                                                    disabled={isEditable}
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
                                                    value={formData.address?.street}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="City"
                                                    name="address.city"
                                                    value={formData.address?.city}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="State"
                                                    name="address.state"
                                                    value={formData.address?.state}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Postal Code"
                                                    name="address.postalCode"
                                                    value={formData.address?.postalCode}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Country"
                                                    name="address.country"
                                                    value={formData.address?.country}
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
                                        </Grid>
                                    </form>

                                    {/* Edit/Save Buttons */}
                                    <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        {!isEditable && (
                                            <Button variant="outlined" onClick={handleEdit}>
                                                <i className="ri-edit-line" style={{ fontSize: 20 }} />
                                            </Button>
                                        )}
                                        {isEditable && (
                                            <Button variant="contained" onClick={handleSave}>
                                                Save
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
                                {leadsData.map((lead) => (
                                    <Card
                                        key={lead.id}
                                        sx={{
                                            width: '100%',
                                            border: '0.5px solid #ccc',  // Thin gray border
                                            borderRadius: 2,
                                            padding: 2,
                                            cursor: 'pointer',
                                            boxShadow: 'none',
                                            transition: 'all 0.3s',
                                            '&:hover': { boxShadow: 3 },
                                        }}
                                    >
                                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            {/* Left Side */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                                    Created Date: {lead.createdDate}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'semibold', color: '#000' }}>
                                                    {lead.campaignName}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#495057' }}>
                                                    {lead.campaignDescription}
                                                </Typography>
                                            </Box>

                                            {/* Right Side */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                                {/* Chip for Status */}
                                                <Chip
                                                    label={lead.status}
                                                    color={
                                                        lead.status === 'Active'
                                                            ? 'success'
                                                            : lead.status === 'Pending'
                                                                ? 'warning'
                                                                : 'default'
                                                    }
                                                    sx={{ fontWeight: 'bold', marginBottom: 1 }}
                                                />

                                                {/* Assigned to */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/* Assigned to text */}
                                                        <Box sx={{ display: 'flex', gap: 1, }}>
                                                            <Typography variant="body2" sx={{ color: '#495057', fontWeight: 'semibold' }}>

                                                                Assigned to:<Avatar
                                                                    src={lead.assignedTo.avatar}
                                                                    alt={lead.assignedTo.name}
                                                                    sx={{ width: 40, height: 40 }}
                                                                />
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>

                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Invoice Data */}
                                {/* {invoiceData.map((invoice) => (
                                    <Card
                                        key={invoice.id}
                                        sx={{
                                            width: '100%',
                                            // boxShadow: 3,
                                            borderRadius: 2,
                                            padding: 2,
                                            transition: 'all 0.3s',
                                            '&:hover': { boxShadow: 3 },
                                        }}
                                    >
                                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}> */}
                                {/* Left Side */}
                                {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <i class="ri-receipt-fill" sx={{ color: '#007bff', fontSize: 40 }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>
                                                        Invoice
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                                    Created At: {invoice.createdAt}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#495057' }}>
                                                    Bill Number: {invoice.billNumber}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#495057' }}>
                                                    Ref ID: {invoice.refId}
                                                </Typography>
                                            </Box>

                                            {/* Right Side */}

                            </Box>
                        )}
                        {tabValue === 2 && (
                            <>
                                {/* First Card: File Info with Icons (View, Delete, Download) */}
                                <Card sx={{ width: '100%', padding: 2, marginBottom: 2, border: '1px solid #ccc', borderRadius: 2, boxShadow: 'none', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {/* Left side: File icon and File name */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <i class="ri-folder-add-line" sx={{ marginRight: 1 }} /> {/* Dummy file icon */}
                                            <Typography variant="body2">Document1.pdf</Typography> {/* Dummy file name */}
                                        </Box>
                                        {/* Right side: Icons for View, Delete, and Download */}
                                        <Box sx={{ display: 'flex', gap: 1, }}>
                                            <Button>
                                                <i class="ri-eye-line" /> {/* View Icon */}
                                            </Button>
                                            <Button>
                                                <i class="ri-delete-bin-line"></i> {/* Delete Icon */}
                                            </Button>
                                            <Button>
                                                <i class="ri-download-line"></i> {/* Download Icon */}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Second Card: File Info with Upload Button */}
                                <Card sx={{ width: '100%', padding: 2, boxShadow: 'none', border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {/* Left side: File icon and File name */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <i class="ri-folder-add-line" sx={{ marginRight: 1 }} /> {/* Dummy file icon */}
                                            <Typography variant="body2">Image1.jpg</Typography> {/* Dummy file name */}
                                        </Box>
                                        {/* Right side: Upload button */}
                                        <Button variant="contained" color="primary">
                                            Upload
                                        </Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {tabValue === 3 && (
                            <Box sx={{ position: "relative", paddingLeft: "40px" }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#212529", marginBottom: 2 }}>
                                    Activity Timeline
                                </Typography>
                                {/* Vertical Line */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: "20px",
                                        height: "100%",
                                        borderLeft: "3px solid #007bff",
                                    }}
                                ></Box>

                                {/* Map through activities */}
                                {activities.map((activity, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            position: "relative",
                                            marginBottom: 3,
                                            marginLeft: "40px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        {/* Timeline Dot */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                left: "-65px", // Slightly adjusted to make it touch the line
                                                top: "10px",
                                                width: "12px",
                                                height: "12px",
                                                borderRadius: "50%",
                                                backgroundColor: "#28a745",
                                                border: "2px solid #007bff",
                                            }}
                                        ></Box>

                                        {/* Title and Date Row */}
                                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "70%", marginBottom: "5px" }}>
                                            <Typography variant="body1" sx={{ fontWeight: "semibold", color: "#000", marginLeft: "-40px", marginTop: "4px" }}>
                                                {activity.title || "Title"} {/* Title */}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#495057", paddingLeft: "5px" }}>
                                                {activity.date} {/* Date */}
                                            </Typography>

                                        </Box>

                                        {/* Description and Time Row */}
                                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "70%" }}>
                                            <Typography variant="body2" sx={{ color: "#6c757d", marginBottom: "5px", flex: 1, marginLeft: "-40px" }}>
                                                {activity.description || "No description available"} {/* Description */}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#495057", marginLeft: "10px" }}>
                                                {activity.time} {/* Time */}
                                            </Typography>
                                        </Box>

                                        {/* Uploaded File or Image */}
                                        <Box sx={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
                                            {activity.fileType === "image" ? (
                                                <img
                                                    src={`path_to_images/${activity.fileName}`}
                                                    alt={activity.fileName}
                                                    style={{
                                                        width: "50px",
                                                        height: "auto",
                                                        borderRadius: "4px",
                                                        marginRight: "10px",
                                                        border: "1px solid #ddd",
                                                        marginLeft: "-40px",
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="body2" sx={{ color: "#6c757d", marginRight: "10px", marginLeft: "-40px" }}>
                                                    {activity.fileName}
                                                </Typography>
                                            )}
                                            {/* View Button */}
                                            {/* <IconButton
                                            sx={{
                                                borderColor: "#007BFF",
                                                color: "#007BFF",
                                                fontWeight: "bold",
                                                borderRadius: "50%",
                                                padding: 1,
                                                "&:hover": {
                                                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                                                    borderColor: "#0056b3",
                                                    color: "#0056b3",
                                                },
                                            }}
                                        >
                                            <VisibilityIcon sx={{ fontSize: 24 }} />
                                        </IconButton> */}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {tabValue === 4 && (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 3,
                                    paddingBottom: 2,
                                }}
                            >
                                {/* Status */}
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                                        Status
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#495057" }}>
                                        {selectedCustomer?.finance?.status || "Pending"}
                                    </Typography>
                                </Box>

                                {/* Amount */}
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                                        Amount
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#495057" }}>
                                        ₹{selectedCustomer?.finance?.amount || "0.00"}
                                    </Typography>
                                </Box>

                                {/* Amount Paid */}
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                                        Amount Paid
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#495057" }}>
                                        ₹{selectedCustomer?.finance?.amountPaid || "0.00"}
                                    </Typography>
                                </Box>

                                {/* Balance */}
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                                        Balance
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#495057" }}>
                                        ₹{selectedCustomer?.finance?.balance || "0.00"}
                                    </Typography>
                                </Box>

                                {/* Actions (Download & View Invoice) */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            fontWeight: "bold",
                                            width: "100%",
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                        }}
                                        onClick={handleDownloadInvoice}
                                    >
                                        Download
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        sx={{
                                            fontWeight: "bold",
                                            width: "100%",
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                        }}
                                        onClick={handleViewInvoice}
                                    >
                                        View Invoice
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Drawer>
        </div>
    );
}

export default Customer;
