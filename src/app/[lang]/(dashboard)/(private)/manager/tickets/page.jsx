"use client";

import Autocomplete from '@mui/material/Autocomplete';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

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
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const locale = params?.lang || 'en';

    const formatToDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [openDialog, setOpenDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customers, setCustomers] = useState([]);
    const linkedLeadId = searchParams.get('leadId') || '';
    const [newTicket, setNewTicket] = useState({
        Customer: "",
        leadId: "",
        issue_details: {
            subject: "",
            description: "",
            category: "",
            sub_category: "",
            priority: "Medium",
            status: "Open",
        },
        attachments: [],
    });

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const query = linkedLeadId ? `?leadId=${encodeURIComponent(linkedLeadId)}` : '';
            const response = await axios.get(`${apiUrl}/api/ticket/gettickets${query}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTickets(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error getting tickets", error);
            setTickets([]);
            if (error.response?.status !== 404) {
                toast.error(error.response?.data?.message || 'Failed to load tickets');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await axios.get(`${apiUrl}/api/customer/getcustomers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomers(response.data?.customers || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
            setCustomers([]);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchCustomers();
    }, [linkedLeadId]);

    // Open create dialog when landing from menu: /manager/tickets?create=1
    useEffect(() => {
        if (searchParams.get('create') === '1') {
            setOpenDialog(true);
        }
        if (linkedLeadId) {
            setNewTicket((prev) => ({ ...prev, leadId: linkedLeadId }));
        }
    }, [searchParams, linkedLeadId]);

    const handleSort = () => {
        const sortedTickets = [...tickets].sort((a, b) => {
            const dateA = new Date(a.timestamps?.created_at || a.created_at || 0);
            const dateB = new Date(b.timestamps?.created_at || b.created_at || 0);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        setTickets(sortedTickets);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const getTicketStatus = (ticket) =>
        ticket?.issue_details?.status || ticket?.history?.[ticket.history.length - 1]?.status || 'Open';

    const filteredTickets = statusFilter
        ? tickets.filter((ticket) => getTicketStatus(ticket) === statusFilter)
        : tickets;

    const handleCardClick = (ticketId) => {
        router.push(`/${locale}/manager/tickets/details?ticketId=${ticketId}`);
    };

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewTicket({
            Customer: "",
            leadId: linkedLeadId || "",
            issue_details: {
                subject: "",
                description: "",
                category: "",
                sub_category: "",
                priority: "Medium",
                status: "Open",
            },
            attachments: [],
        });
    };

    const handleInputChange = ({ target: { name, value } }) => {
        if (name in newTicket.issue_details) {
            setNewTicket((prev) => ({
                ...prev,
                issue_details: {
                    ...prev.issue_details,
                    [name]: value,
                },
            }));
        } else {
            setNewTicket((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmitTicket = async () => {
        const token = localStorage.getItem("token");
        if (!newTicket.Customer) {
            toast.error('Please select a customer');
            return;
        }
        if (!newTicket.issue_details.subject?.trim() || !newTicket.issue_details.description?.trim()) {
            toast.error('Subject and description are required');
            return;
        }
        if (!newTicket.issue_details.category) {
            toast.error('Category is required');
            return;
        }

        const formData = new FormData();
        formData.append("customerId", newTicket.Customer);
        if (newTicket.leadId || linkedLeadId) {
            formData.append("leadId", newTicket.leadId || linkedLeadId);
        }
        formData.append("subject", newTicket.issue_details.subject.trim());
        formData.append("description", newTicket.issue_details.description.trim());
        formData.append("category", newTicket.issue_details.category);
        formData.append("sub_category", newTicket.issue_details.sub_category || "");
        formData.append("priority", newTicket.issue_details.priority || "Medium");

        if (Array.isArray(newTicket.attachments)) {
            newTicket.attachments.forEach((file) => formData.append("attachments", file));
        }

        try {
            setSubmitting(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            await axios.post(`${apiUrl}/api/ticket/create`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success('Ticket created successfully');
            await fetchTickets();
            handleCloseDialog();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
            console.error("Error adding new ticket:", error.response?.data || error);
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High":
            case "Critical":
                return "#f44336";
            case "Medium":
                return "#ff9800";
            case "Low":
                return "#4caf50";
            default:
                return "#9e9e9e";
        }
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
                "@media (max-width: 600px)": { p: 2 },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                    p: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                }}
            >
                <Typography variant="h5" fontWeight={700}>
                    Support Tickets
                    {linkedLeadId ? (
                        <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 500 }}>
                            (linked to lead)
                        </Typography>
                    ) : null}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 140 }} size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Open">Open</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="outlined" onClick={handleSort}>
                        Sort {sortOrder === "asc" ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleOpenDialog}
                        startIcon={<i className="ri-add-line" />}
                        sx={{ fontWeight: 700, px: 3 }}
                    >
                        Create Ticket
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                    <p>Loading tickets...</p>
                </Box>
            ) : tickets.length !== 0 ? (
                <Grid container spacing={3}>
                    {filteredTickets.map((ticket) => (
                        <Grid item xs={12} key={ticket._id}>
                            <Card
                                sx={{
                                    p: 3,
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "column", md: "row" },
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
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
                                            #{ticket.ticket_id}
                                        </Typography>
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 0.5,
                                                border: `2px solid ${getPriorityColor(ticket.issue_details?.priority)}`,
                                                color: getPriorityColor(ticket.issue_details?.priority),
                                                borderRadius: 2,
                                                fontSize: "0.8rem",
                                                fontWeight: "semibold",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {ticket.issue_details?.priority}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            {getTicketStatus(ticket)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: "#757575", fontWeight: "500" }}>
                                        {ticket.issue_details?.subject}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                        {ticket.issue_details?.category}
                                        {ticket.issue_details?.sub_category ? ` / ${ticket.issue_details.sub_category}` : ''}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "#757575", fontWeight: "500" }}>
                                        {ticket.customer
                                            ? `${ticket.customer.firstName || ''} ${ticket.customer.lastName || ''}`.trim()
                                            : 'No customer'}
                                    </Typography>
                                    {ticket.leadId && (
                                        <Typography variant="caption" sx={{ color: '#6366f1' }}>
                                            Lead: {ticket.leadId.name
                                              || [ticket.leadId.first_name, ticket.leadId.last_name].filter(Boolean).join(' ')
                                              || 'Linked'}
                                        </Typography>
                                    )}
                                </CardContent>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: { xs: "center", sm: "center", md: "flex-end", marginTop: "20px" },
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                                        Updated: {formatToDateTime(ticket.timestamps?.updated_at)}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px" bgcolor="#e8e9ee" borderRadius={2} gap={2}>
                    <Typography>No tickets yet</Typography>
                    <Button variant="contained" onClick={handleOpenDialog}>Create your first ticket</Button>
                </Box>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create Ticket</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <Autocomplete
                        options={customers}
                        getOptionLabel={(option) =>
                            option ? `${option.firstName || ''} ${option.lastName || ''}`.trim() || option.email || 'Customer' : ''
                        }
                        onChange={(_, value) =>
                            setNewTicket((prev) => ({ ...prev, Customer: value?._id || '' }))
                        }
                        renderInput={(params) => <TextField {...params} label="Customer *" margin="dense" />}
                    />
                    {customers.length === 0 && (
                        <Typography variant="caption" color="error">
                            No customers found. Add a customer first, then create a ticket.
                        </Typography>
                    )}
                    <TextField
                        label="Subject *"
                        name="subject"
                        value={newTicket.issue_details.subject}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        label="Description *"
                        name="description"
                        value={newTicket.issue_details.description}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        select
                        label="Category *"
                        name="category"
                        value={newTicket.issue_details.category}
                        onChange={handleInputChange}
                        fullWidth
                    >
                        <MenuItem value="Support">Support</MenuItem>
                        <MenuItem value="Billing">Billing</MenuItem>
                        <MenuItem value="Technical">Technical</MenuItem>
                        <MenuItem value="General">General</MenuItem>
                    </TextField>
                    <TextField
                        label="Sub category"
                        name="sub_category"
                        value={newTicket.issue_details.sub_category}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Priority"
                        name="priority"
                        value={newTicket.issue_details.priority}
                        onChange={handleInputChange}
                        fullWidth
                    >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Critical">Critical</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitTicket} disabled={submitting || customers.length === 0}>
                        {submitting ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketSection;
