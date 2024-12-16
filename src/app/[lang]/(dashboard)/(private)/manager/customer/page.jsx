'use client';
import React, { useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    Button,
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
} from "@mui/material";
import AddCustomerForm from "@/views/apps/customer/Addcustomer";
const Customer = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);


    const handleOpenDetailsDialog = (customer) => {
        setSelectedCustomer(customer);
        setOpenDetailsDialog(true);
    };

    const handleCloseDetailsDialog = () => {
        setSelectedCustomer(null);
        setOpenDetailsDialog(false);
    };
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

    const handleOpenDrawer = (customer) => {
        setSelectedCustomer(customer);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedCustomer(null);
        setDrawerOpen(false);
    };

    return (
        <div>

            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <AddCustomerForm />
                </DialogContent>
            </Dialog>
            <Button variant="contained" onClick={handleOpenAddDialog}>
                Add Customer
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Phone</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleOpenDrawer(customer)}
                                    >
                                        View Details
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
                        width: { xs: '100%', sm: '400px' },
                        padding: 2,
                        backgroundColor: "#f5f5f5",
                    },
                }}
            >
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Customer Details
                    </Typography>
                    {selectedCustomer ? (
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Name"
                                    secondary={selectedCustomer.name}
                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Email"
                                    secondary={selectedCustomer.email}
                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Phone"
                                    secondary={selectedCustomer.phone}
                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Address"
                                    secondary={selectedCustomer.address}
                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="City"
                                    secondary={selectedCustomer.city}
                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="State"
                                    secondary={selectedCustomer.state}
                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="ZIP Code"
                                    secondary={selectedCustomer.zip}
                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                />
                            </ListItem>
                        </List>
                    ) : (
                        <Typography variant="body1">No customer selected.</Typography>
                    )}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleCloseDrawer}
                        sx={{ marginTop: 2 }}
                        fullWidth
                    >
                        Close
                    </Button>
                </Box>
            </Drawer>
        </div>
    );
};

export default Customer;
