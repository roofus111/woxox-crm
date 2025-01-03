"use client";

import Autocomplete from '@mui/material/Autocomplete';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from 'next/navigation';

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

import { useSearchParam } from 'next/navigation';

const TicketSection = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const formatToDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12 || 12;
  
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`; // Format as DD/MM/YYYY HH:MM AM/PM
  };  

  // Handle file change
  const handleFileChange = (event) => {
    const files = event.target.files;
    const fileNames = Array.from(files).map((file) => file.name);
    setSelectedFiles(fileNames); // Store the file names in the state
  };

  const allTickets = [
    {
      ticket_id: "ticket_id",
      priority: "priority",
      Customer: "Customer",
      category: "category",
      sub_category: "sub_category",
      created_at: "created_at",
      updated_at: "updated_at",
      status: "status",
    }
  ];

  const [tickets, setTickets] = useState(allTickets);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog open/close
  const [newTicket, setNewTicket] = useState({
    Customer: "",
    subject: "",
    description: "",
    category: "",
    sub_category: "",
    priority: "",
    status: "",
    attachments: [],
  });

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios
        .get(`${apiUrl}/api/ticket/gettickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setTickets(response.data);
        })
        .catch((error) => {
          console.error("Error getting tickets", error);
        });
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };


  useEffect(() => {
    fetchTickets();
  }, []);


  const [customers, setCustomers] = useState([]); // Store customers

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL; 
      const response = await axios.get(`${apiUrl}/api/customer/getcustomers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomers(response.data.customers);
      console.log(response.data) // Assuming response.data is an array of customers
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCustomers(); // Fetch customers when component mounts
  }, []);

  // Function to handle sorting by created date
  const handleSort = () => {
    const sortedTickets = [...tickets].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
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
  const handleSubmitTicket = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Append customer ID
    formData.append("customerId", newTicket.Customer);
    formData.append("assignedTo", "66ff7eb29cfb482d716fcbbd");
    formData.append("subject", "sdfjekjn");
    formData.append("description", "sdfjek");
    formData.append("category", "cate");
    formData.append("sub_category", "subcate");
    formData.append("priority", "High");

    // Append attachments
    if (Array.isArray(newTicket.attachments)) {
      newTicket.attachments.forEach((file) => formData.append("attachments", file));
    }

    // Debugging: Log formData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    console.log(JSON.stringify(formData))

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/api/ticket/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Necessary for FormData
        },
      });

      console.log("Ticket created successfully:", response.data);

      // Update tickets state and reset form
      setTickets((prevTickets) => [
        ...prevTickets,
        {
          id: response.data.ticket._id,
          ...newTicket,
          created_at: response.data.ticket.timestamps.created_at,
          updated_at: response.data.ticket.timestamps.updated_at,
        },
      ]);

      handleCloseDialog();
      setNewTicket({
        Customer: "",
        issue_details: {
          subject: "",
          description: "",
          category: "",
          sub_category: "",
          priority: "",
          status: "",
        },
        attachments: [],
      });
    } catch (error) {
      console.error("Error adding new ticket:", error.response?.data || error);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
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


  const router = useRouter();

  const handleCardClick = (ticketId) => {
    router.push(`/en/tickets/details?ticketId=${ticketId}`);
  };

  return (
    <Box sx={{
      p: 4, backgroundColor: "#f9fafb", minHeight: "100vh", border: "1px solid",
      borderColor: "rgba(229, 231, 235, 1)", borderRadius: "1.5rem",
    }}>
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
            <Grid item xs={12} key={ticket._id}>
                <Card
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "column", md: "row" }, // Center items on small screens
                      justifyContent: { xs: "center", sm: "center", md: "space-between" },
                      alignItems: { xs: "center", sm: "center", md: "flex-start" },
                      border: "1px solid",
                      boxShadow: "none",
                      borderColor: "rgba(229, 231, 235, 1)",
                      borderRadius: "1.5rem",
                      textAlign: { xs: "center", sm: "center", md: "left" },
                      transition: "transform 0.2s ease-in-out",
                      cursor: "pointer",
                      "&:hover": { transform: "scale(1.02)" },
                        }}
                      onClick={() => handleCardClick(ticket._id)}
                    >
                    {/* Left Content */}
                      <CardContent
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          alignItems: { xs: "center", sm: "center", md: "flex-start" },
                        }}
                      >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
                          #{ticket.ticket_id}
                        </Typography>
                        <Box
                        sx={{
                        px: 2,
                        py: 0.5,
                        backgroundColor: getPriorityColor(ticket.issue_details?.priority),
                        color: "#fff",
                        borderRadius: 2,
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        }}
                        >
                          {ticket.issue_details?.priority}
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ color: "#757575", fontWeight: "500" }}>
                        {ticket.Customer}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#757575", fontWeight: "500" }}>
                        {ticket.customer?.firstName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                        {ticket.issue_details?.category} / {ticket.issue_details?.sub_category}
                      </Typography>
                    </CardContent>
          
                    {/* Right Content */}
                    <Box
                      sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: { xs: "center", sm: "center", md: "flex-end", marginTop: "20px"},
                      gap: 1,
                      }}
                    >
                    <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                      Created: {formatToDateTime(ticket.timestamps?.created_at)}
                    </Typography>
                    <Box
                      sx={{
                      px: 4,
                      py: 1,
                      backgroundColor: getStatusColor(ticket.issue_details?.status),
                      color: "#fff",
                      borderRadius: 3,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "0.9rem",
                    }}
                  >
                    {ticket.issue_details?.status}
                  </Box>
                  <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                      Updated: {formatToDateTime(ticket.timestamps?.updated_at)}
                  </Typography>
                </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Ticket Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Ticket</DialogTitle>
        <DialogContent>
          {/* Customer Input */}
          <FormControl fullWidth>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              renderInput={(params) => <TextField {...params} label="Customer" />}
              onChange={(event, value) =>
                handleInputChange({
                  target: {
                    name: 'Customer',
                    value: value ? value._id : '',
                  },
                })
              }
              isOptionEqualToValue={(option, value) => option._id === value}
            />
          </FormControl>

          {/* Subject Input */}
          <TextField
            fullWidth
            label="Subject"
            name="subject"
            value={newTicket.issue_details?.subject}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          {/* Description Input */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={newTicket.issue_details?.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            multiline
            rows={4}
          />
          {/* Category Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={newTicket.issue_details?.category} name="category" onChange={handleInputChange} label="Category">
              <MenuItem value="Billing">Billing</MenuItem>
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Account">Account</MenuItem>
            </Select>
          </FormControl>
          {/* Sub-Category Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Sub-Category</InputLabel>
            <Select value={newTicket.issue_details?.sub_category} name="subCategory" onChange={handleInputChange} label="Sub-Category">
              <MenuItem value="Refund">Refund</MenuItem>
              <MenuItem value="Network Issues">Network Issues</MenuItem>
              <MenuItem value="Password Reset">Password Reset</MenuItem>
            </Select>
          </FormControl>
          {/* Priority Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={newTicket.issue_details?.priority} name="priority" onChange={handleInputChange} label="Priority">
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          {/* Status Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={newTicket.issue_details?.status} name="status" onChange={handleInputChange} label="Status">
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
