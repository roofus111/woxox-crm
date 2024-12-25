"use client";
import React, { useState } from "react";
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import {
    Drawer,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogContent,
    DialogTitle,
    Paper,
    TableSortLabel,
    Checkbox,
    Tabs,
    Tab,
    Avatar,
    TextField,
    Grid,
    Card,
    CardContent,
} from "@mui/material";
import AddCustomerForm from "@/views/apps/customer/Addcustomer";

const Customer = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [sortBy, setSortBy] = useState({ field: null, direction: "asc" });
    const [selectedRows, setSelectedRows] = useState([]);

    const [openAddDialog, setOpenAddDialog] = useState(false);

    const customers = [
        {
            id: 1,
            name: "John Doe",
            email: "johndoe@example.com",
            phone: "+1 234 567 890",
            address: "123 Main Street, Springfield",
            city: "Springfield",
            state: "Illinois",
            zip: "62704",
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "janesmith@example.com",
            phone: "+1 987 654 321",
            address: "456 Elm Street, Shelbyville",
            city: "Shelbyville",
            state: "Indiana",
            zip: "46176",
        },
        {
            id: 3,
            name: "Alice Johnson",
            email: "alicej@example.com",
            phone: "+1 555 123 456",
            address: "789 Oak Avenue, Capital City",
            city: "Capital City",
            state: "Ohio",
            zip: "43085",
        },
    ];

    // Handle sorting
    const handleSort = (field) => {
        const isAsc = sortBy.field === field && sortBy.direction === "asc";
        setSortBy({ field, direction: isAsc ? "desc" : "asc" });
    };

    const sortedCustomers = [...customers].sort((a, b) => {
        if (!sortBy.field) return 0;
        const valueA = a[sortBy.field];
        const valueB = b[sortBy.field];
        if (valueA < valueB) return sortBy.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortBy.direction === "asc" ? 1 : -1;
        return 0;
    });

    // Handle row selection
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
    };
    const handleCloseDrawer = () => {
        setSelectedCustomer(null);
        setDrawerOpen(false);
    };

    const [tabValue, setTabValue] = useState(0); // Default tab is the first one
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Placeholder functions for the buttons
    const handleDownloadInvoice = () => {
        console.log("Downloading invoice...");
    };

    const handleViewInvoice = () => {
        console.log("Viewing invoice...");
    };

    const activities = [
        {
            title: "Project Update",
            description: "Finalized project timeline and deliverables.",
            date: "2024-12-15",
            time: "10:30 AM",
            fileName: "document.pdf",
            fileType: "document",
        },
        {
            title: "Design Review",
            description: "Reviewed the latest designs and provided feedback.",
            date: "2024-12-14",
            time: "3:00 PM",
            fileName: "image.jpg",
            fileType: "image",
        },
        {
            title: "Report Submission",
            description: "Submitted the annual financial report for approval.",
            date: "2024-12-13",
            time: "5:15 PM",
            fileName: "report.csv",
            fileType: "document",
        },
    ];

    const [isEditable, setIsEditable] = useState(false);

    // Initialize formData with dummy content
    const [formData, setFormData] = useState({
        input1: 'Dummy content 1',
        input2: 'Dummy content 2',
        input3: 'Dummy content 3',
        input4: 'Dummy content 4',
        input5: 'Dummy content 5',
        input6: 'Dummy content 6',
        input7: 'Dummy content 7',
        input8: 'Dummy content 8',
    });


    // Handle the Edit button click
    const handleEdit = () => {
        setIsEditable(true);
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle save button click
    const handleSave = () => {
        setIsEditable(false);
        console.log('Saved data:', formData); // Save logic can go here (e.g., call an API)
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
        {
            id: 2,
            createdAt: '2024-06-14',
            billNumber: 'INV-2024-002',
            refId: 'REF67890',
            paymentStatus: 'Pending',
            totalAmount: '₹25,000',
            balance: '₹5,000',
        },
    ];


    const handleViewLead = (id) => console.log(`Viewing lead with ID: ${id}`);
    const handleEditLead = (id) => console.log(`Editing lead with ID: ${id}`);

    return (
        <div>
            {/* Add Customer Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <AddCustomerForm />
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
                                    active={sortBy.field === "name"}
                                    direction={sortBy.field === "name" ? sortBy.direction : "asc"}
                                    onClick={() => handleSort("name")}
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
                                <TableCell>{customer.name}</TableCell>
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

                                    <Button
                                        onClick={() => console.log("Edit customer")}
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
                                    </Button>

                                    <Button
                                        onClick={() => console.log("Delete customer")}
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
            </TableContainer>

            {/* Customer Details Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseDrawer}
                PaperProps={{
                    sx: {
                        width: {
                            xs: "100%", // Full width on small screens (phones)
                            sm: "400px", // Fixed width for small devices
                            md: "50%", // 50% width on medium devices (tablets)
                        },
                        padding: { xs: 2, sm: 3 }, // Adjust padding for small and medium screens
                        backgroundColor: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        borderTopLeftRadius: "16px",
                        borderBottomLeftRadius: "16px",
                    },
                }}
            >
                <Box>
                    <Box
                        sx={{
                            width: '100%', // Full width
                            position: 'relative', // For positioning child elements
                            overflow: 'hidden',
                        }}
                    >
                        {/* Top Section (Blue Background) */}
                        <Box
                            sx={{
                                backgroundColor: '#007bff', // Blue background
                                color: 'white',
                                padding: 3,
                                display: 'flex',
                                justifyContent: 'center', // Center horizontally
                                alignItems: 'center', // Center vertically
                                height: '100px', // Adjust height to your needs
                                position: 'relative',
                                width: '100%',
                            }}
                        >
                            {/* Profile Image or First Letter */}
                            {selectedCustomer?.profileImage ? (
                                <Avatar
                                    src={selectedCustomer.profileImage}
                                    alt={selectedCustomer.name}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        border: '2px solid #28a745', // Green border for premium
                                        position: 'absolute', // Positioning to the middle vertically
                                        top: '50%', // 50% from the top
                                        marginTop: '50px',
                                        transform: 'translateY(-50%)', // Center the avatar vertically
                                    }}
                                />
                            ) : (
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        backgroundColor: '#28a745', // Green background for premium
                                        fontSize: 56,
                                        fontWeight: 'bold',
                                        color: "white",
                                        position: 'absolute',
                                        top: '50%',
                                        marginTop: '50px',
                                        marginLeft: '-570px',
                                        transform: 'translateY(-50%)', // Center the avatar vertically
                                    }}
                                >
                                    {selectedCustomer?.name?.charAt(0)} {/* First letter of the name */}
                                </Avatar>
                            )}
                        </Box>

                        {/* Bottom Section (White Background) */}
                        <Box
                            sx={{
                                backgroundColor: 'white',
                                padding: 3,
                                textAlign: 'center', // Centered text alignment
                                paddingTop: 4, // Add padding to space the content down
                            }}
                        >
                            <Grid container spacing={3}>
                                {/* Left: Customer Name */}
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#495057', fontWeight: 'bold', marginLeft: "36px", fontSize: "1.2rem", }}>
                                        {selectedCustomer?.name}
                                    </Typography>
                                    <Chip label="Chip outlined" variant="contained" sx={{ marginLeft: "50px", height: "23px" }} />
                                </Grid>
                                {/* Right: Email and Phone */}
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#495057', marginLeft: "96px", }}>
                                        Email: {selectedCustomer?.email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#495057', marginLeft: "96px", textAlign: "center" }}>
                                        Phone: {selectedCustomer?.phone || 'No phone available'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
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
                                <br />
                                <Box sx={{ marginTop: 2 }}>
                                    <Grid container spacing={2}>
                                        {Object.keys(formData).map((key, index) => (
                                            <Grid item xs={6} key={index}>
                                                <TextField
                                                    label={`Input ${index + 1}`}
                                                    variant="outlined"
                                                    fullWidth
                                                    // disabled={!isEditable} // Disable if not editable
                                                    value={formData[key]} // Access key directly
                                                    onChange={handleChange}
                                                    name={key}
                                                    sx={{ marginBottom: 2 }}
                                                    InputProps={{
                                                        // Disable the faded gray when the input is disabled
                                                        readOnly: !isEditable, // Keeps the field editable if 'isEditable' is true
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Button variant="outlined" onClick={handleEdit}>
                                        Edit
                                    </Button>
                                    {isEditable && (
                                        <Button variant="contained" onClick={handleSave}>
                                            Save
                                        </Button>
                                    )}
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
                                            //  border: '1px solid #ccc',  // Thin gray border
                                            borderRadius: 2,
                                            padding: 2,
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
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>
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
                                                            <Typography variant="body2" sx={{ color: '#495057', fontWeight: 'bold' }}>

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
                                {invoiceData.map((invoice) => (
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
                                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            {/* Left Side */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-end',
                                                    gap: 1,
                                                }}
                                            >
                                                <Chip
                                                    label={invoice.paymentStatus}
                                                    color={
                                                        invoice.paymentStatus === 'Paid'
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                    sx={{ fontWeight: 'bold', marginBottom: 1 }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 'bold', color: '#212529' }}
                                                >
                                                    Total: {invoice.totalAmount}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#495057' }}>
                                                    Balance: {invoice.balance}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            marginTop: 1,
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button>
                                                        <i class="ri-download-line" /> {/* Download Icon */}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}
                        {tabValue === 2 && (
                            <>
                                {/* First Card: File Info with Icons (View, Delete, Download) */}
                                <Card sx={{ width: '100%', padding: 2, marginBottom: 2, border: '1px solid #ccc', borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
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
                                <Card sx={{ width: '100%', padding: 2, border: '1px solid #ccc', borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
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
                                            <Typography variant="body1" sx={{ fontWeight: "bold", color: "#007bff", marginLeft: "-40px", marginTop: "4px" }}>
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
