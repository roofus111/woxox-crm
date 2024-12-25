"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const TicketSection = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handle file change
  const handleFileChange = (event) => {
    const files = event.target.files;
    const fileNames = Array.from(files).map((file) => file.name);
    setSelectedFiles(fileNames); // Store the file names in the state
  };

  const allTickets = [
    {
      id: 1,
      priority: "High",
      customer: "John Doe",
      category: "Billing",
      subCategory: "Refund",
      createdDate: "2024-12-20",
      lastUpdate: "2024-12-21",
      status: "Completed",
    },
    {
      id: 2,
      priority: "Medium",
      customer: "Jane Smith",
      category: "Technical",
      subCategory: "Login Issues",
      createdDate: "2024-12-19",
      lastUpdate: "2024-12-20",
      status: "In Progress",
    },
    {
      id: 3,
      priority: "Low",
      customer: "Michael Brown",
      category: "Account",
      subCategory: "Password Reset",
      createdDate: "2024-12-18",
      lastUpdate: "2024-12-19",
      status: "Pending",
    },
    {
      id: 4,
      priority: "High",
      customer: "Sarah Connor",
      category: "Technical",
      subCategory: "Network Issues",
      createdDate: "2024-12-17",
      lastUpdate: "2024-12-18",
      status: "Completed",
    },
  ];

  const [tickets, setTickets] = useState(allTickets);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog open/close
  const [newTicket, setNewTicket] = useState({
    customer: "",
    subject: "",
    description: "",
    category: "",
    subCategory: "",
    priority: "",
    status: "",
    attachments: [],
  });

  // Function to handle sorting by created date
  const handleSort = () => {
    const sortedTickets = [...tickets].sort((a, b) => {
      const dateA = new Date(a.createdDate);
      const dateB = new Date(b.createdDate);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    setTickets(sortedTickets);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Function to handle status filter
  const handleFilter = (event) => {
    setStatusFilter(event.target.value);
  };

  // Function to handle opening the dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to handle form field changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle file uploads (attachments)
//   const handleFileChange = (event) => {
//     setNewTicket((prev) => ({ ...prev, attachments: [...event.target.files] }));
//   };

  // Function to submit the new ticket (add it to the tickets list)
  const handleSubmitTicket = () => {
    setTickets((prevTickets) => [
      ...prevTickets,
      {
        id: prevTickets.length + 1,
        ...newTicket,
        createdDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      },
    ]);
    handleCloseDialog(); // Close the dialog after submission
    setNewTicket({
      customer: "",
      subject: "",
      description: "",
      category: "",
      subCategory: "",
      priority: "",
      status: "",
      attachments: [],
    }); // Reset the form
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#4caf50"; // Green
      case "In Progress":
        return "#ff9800"; // Orange
      case "Pending":
        return "#f44336"; // Red
      default:
        return "#9e9e9e"; // Gray
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#f44336"; // Red
      case "Medium":
        return "#ff9800"; // Orange
      case "Low":
        return "#4caf50"; // Green
      default:
        return "#9e9e9e"; // Gray
    }
  };

  const filteredTickets = statusFilter
    ? tickets.filter((ticket) => ticket.status === statusFilter)
    : tickets;

  return (
    <Box sx={{ p: 4, backgroundColor: "#f9fafb", minHeight: "100vh", border: "1px solid",
        borderColor: "rgba(229, 231, 235, 1)", borderRadius: "1.5rem",}}>
      {/* Top Row: Sort, Filter, and Add Ticket Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Sort Button */}
          <Button variant="contained" onClick={handleSort}>
            Sort {sortOrder === "asc" ? <i class="ri-arrow-up-s-line"></i> : <i class="ri-arrow-down-s-line"></i>}
          </Button>

          {/* Filter Dropdown */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel></InputLabel>
            <Select value={statusFilter} onChange={handleFilter} label="Filter by Status" displayEmpty>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Add Ticket Button */}
        <Button variant="contained" color="primary" sx={{ fontWeight: "bold", height: "52px" }} onClick={handleOpenDialog}>
          Add Ticket
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredTickets.map((ticket) => (
          <Grid item xs={12} key={ticket.id}>
            <Link href={`/tickets/details`} passHref>
              <Card
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "rgba(229, 231, 235, 1)", 
                  borderRadius: "1.5rem",
                  transition: "transform 0.2s ease-in-out",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  {/* Top Row: Ticket ID and Priority */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
                      #{ticket.id}
                    </Typography>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        backgroundColor: getPriorityColor(ticket.priority),
                        color: "#fff",
                        borderRadius: 2,
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {ticket.priority}
                    </Box>
                  </Box>

                  {/* Customer and Category Details */}
                  <Typography variant="body1" sx={{ color: "#757575" }}>
                    {ticket.customer}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                    {ticket.category} / {ticket.subCategory}
                  </Typography>
                </CardContent>

                {/* Right Section: Dates and Status */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                    Created: {ticket.createdDate}
                  </Typography>
                 
                  <Box
                    sx={{
                      px: 3,
                      py: 1,
                      backgroundColor: getStatusColor(ticket.status),
                      color: "#fff",
                      borderRadius: 3,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "0.9rem",
                    }}
                  >
                    {ticket.status}
                  </Box>
                  <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                    Updated: {ticket.lastUpdate}
                  </Typography>
                </Box>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Add Ticket Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Ticket</DialogTitle>
        <DialogContent>
          {/* Customer Input */}
          <FormControl fullWidth sx={{ mb: 2, mt:2 }}>
            <InputLabel>Customer</InputLabel>
            <Select value={newTicket.subCategory} name="subCategory" onChange={handleInputChange} label="Sub-Category">
              <MenuItem value="Refund">Customer 1</MenuItem>
              <MenuItem value="Network Issues">Customer 2</MenuItem>
              <MenuItem value="Password Reset">Customer 3</MenuItem>
            </Select>
          </FormControl>
          {/* Subject Input */}
          <TextField
            fullWidth
            label="Subject"
            name="subject"
            value={newTicket.subject}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          {/* Description Input */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={newTicket.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            multiline
            rows={4}
          />
          {/* Category Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={newTicket.category} name="category" onChange={handleInputChange} label="Category">
              <MenuItem value="Billing">Billing</MenuItem>
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Account">Account</MenuItem>
            </Select>
          </FormControl>
          {/* Sub-Category Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Sub-Category</InputLabel>
            <Select value={newTicket.subCategory} name="subCategory" onChange={handleInputChange} label="Sub-Category">
              <MenuItem value="Refund">Refund</MenuItem>
              <MenuItem value="Network Issues">Network Issues</MenuItem>
              <MenuItem value="Password Reset">Password Reset</MenuItem>
            </Select>
          </FormControl>
          {/* Priority Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={newTicket.priority} name="priority" onChange={handleInputChange} label="Priority">
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          {/* Status Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={newTicket.status} name="status" onChange={handleInputChange} label="Status">
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
          {/* Attachments */}
          <Button variant="outlined" component="label">
            Upload Attachments
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>
          {/* Displaying selected file names */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                
              </Typography>
              {selectedFiles.map((fileName, index) => (
                <Typography key={index} variant="body2" color="textPrimary">
                  {fileName}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmitTicket} color="primary">
            Add Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketSection;
