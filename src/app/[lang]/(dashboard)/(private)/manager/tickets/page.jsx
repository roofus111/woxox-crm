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
            ticket_id: "",
            priority: "",
            Customer: "",
            category: "",
            sub_category: "",
            created_at: "",
            updated_at: "",
            status: "",
        }
    ];

    const [tickets, setTickets] = useState([]);
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
                    console.log(tickets);

                    setTickets([]);
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
        router.push(`/en/manager/tickets/details?ticketId=${ticketId}`);
    };

    return (
        <Box
            sx={{
                p: 4,
                backgroundColor: "#f9fafb",
                minHeight: "100vh",
                border: "1px solid",
                borderColor: "rgba(229, 231, 235, 1)",
                borderRadius: "1.5rem",
                "@media (max-width: 600px)": {
                    p: 2,
                },
            }}
        >
            {/* Sort and Filter Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Button variant="contained" onClick={handleSort}>
                    Sort {sortOrder === "asc" ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
                </Button>
                {/* <FormControl sx={{ minWidth: 120 }}>
      <InputLabel></InputLabel>
      <Select value={statusFilter} onChange={handleFilter} displayEmpty>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Open">Open</MenuItem>
        <MenuItem value="In Progress">In Progress</MenuItem>
        <MenuItem value="Closed">Closed</MenuItem>
        <MenuItem value="Resolved">Resolved</MenuItem>
      </Select>
    </FormControl> */}
            </Box>

            {/* Tickets Section */}
            {tickets.length !== 0 ? <Grid container spacing={3}>
                {filteredTickets?.map((ticket) => (
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
                                <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                    {formatToDateTime(ticket.timestamps?.created_at)}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
                                        #{ticket.ticket_id}
                                    </Typography>
                                    <Box
                                        sx={{
                                            px: 4,
                                            py: 0.5,
                                            border: `2px solid ${getPriorityColor(ticket.issue_details?.priority)}`, // Outline border
                                            color: getPriorityColor(ticket.issue_details?.priority), // Text color matches the border
                                            borderRadius: 2,
                                            fontSize: "0.8rem",
                                            fontWeight: "semibold",
                                            textTransform: "uppercase",
                                            backgroundColor: "transparent", // Make the background transparent
                                        }}
                                    >
                                        {ticket.issue_details?.priority}
                                    </Box>
                                </Box>
                                <Typography variant="body1" sx={{ color: "#757575", fontWeight: "500" }}>
                                    {ticket.Customer}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                    {ticket.issue_details?.category} / {ticket.issue_details?.sub_category}
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#757575", fontWeight: "500" }}>
                                    {ticket.customer?.firstName}
                                </Typography>
                            </CardContent>

                            {/* Right Content */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: { xs: "center", sm: "center", md: "flex-end", marginTop: "20px" },
                                    gap: 1,
                                }}
                            >
                                {/* <Box
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
              </Box> */}
                                <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                    Updated: {formatToDateTime(ticket.timestamps?.updated_at)}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid> : <Box display={'flex'} justifyContent={'center'} alignItems={'center'} minHeight={"300px"} bgcolor={'#e8e9ee'}><p>No Tickets</p></Box>}
        </Box>
    );
};

export default TicketSection;
