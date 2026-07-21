"use client"

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Box, Grid, TextField, Typography, List, ListItem,
    ListItemIcon, ListItemText, IconButton, Button, Divider, Paper,
    InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Snackbar, Alert, CircularProgress, Chip
} from '@mui/material';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MultiTagInput = ({ value, onChange, placeholder, suggestions }) => {
    const [inputValue, setInputValue] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const inputRef = useRef(null);
    const popupRef = useRef(null);

    // Handle click outside to close popup
    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setIsPopupOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (inputValue.trim() === '') {
            setFilteredSuggestions(suggestions);
        } else {
            const filtered = suggestions.filter(
                sugg => sugg.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        }
    }, [inputValue, suggestions]);

    const handleAddTag = (tag) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !value.includes(trimmedTag)) {
            onChange([...value, trimmedTag]);
        }
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleRemoveTag = (tagToRemove) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                minHeight: '40px',
                p: 1,
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                alignItems: 'center'
            }}>
                {value.map((tag) => (
                    <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onDelete={() => handleRemoveTag(tag)}
                        sx={{ m: '2px' }}
                    />
                ))}
                <Box sx={{ position: 'relative', flexGrow: 1 }}>
                    <TextField
                        inputRef={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setIsPopupOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && inputValue.trim()) {
                                e.preventDefault();
                                handleAddTag(inputValue);
                            }
                        }}
                        placeholder={placeholder}
                        variant="standard"
                        size="small"
                        sx={{
                            width: '100%',
                            minWidth: '120px',
                            '& .MuiInput-underline:before': { borderBottom: 'none' },
                            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                            '& .MuiInput-underline:after': { borderBottom: 'none' },
                        }}
                        InputProps={{
                            disableUnderline: true,
                        }}
                    />
                </Box>
            </Box>

            {isPopupOpen && (
                <Paper
                    ref={popupRef}
                    sx={{
                        position: 'absolute',
                        zIndex: 1000,
                        width: '100%',
                        maxHeight: '200px',
                        overflow: 'auto',
                        mt: 1,
                        boxShadow: 3,
                    }}
                >
                    {filteredSuggestions.length > 0 ? (
                        <List dense sx={{ p: 0 }}>
                            {filteredSuggestions.map((suggestion) => (
                                <ListItem
                                    key={suggestion}
                                    button
                                    onClick={() => handleAddTag(suggestion)}
                                    sx={{ py: 0.5 }}
                                >
                                    <ListItemText primary={suggestion} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                            {inputValue.trim() ? 'No suggestions found' : 'Type to search'}
                        </Box>
                    )}
                    {inputValue.trim() && !filteredSuggestions.includes(inputValue.trim()) && (
                        <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0' }}>
                            <Button
                                fullWidth
                                size="small"
                                onClick={() => handleAddTag(inputValue)}
                            >
                                Add "{inputValue}"
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default function TagsManagement() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedTagName, setEditedTagName] = useState("");
    const [selectedTagLeads, setSelectedTagLeads] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [sortField, setSortField] = useState('createdAt'); // default sort by created date
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [statusFilter, setStatusFilter] = useState('');
    const [editedTagDescription, setEditedTagDescription] = useState("");
    const [filterTags, setFilterTags] = useState([]);
    const [allLeads, setAllLeads] = useState([]);
    const [newTag, setNewTag] = useState({
        name: '',
        description: '',
        collectionName: 'leads'
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const tagColors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A1",
        "#FFBD33", "#8D33FF", "#33FFF3", "#FF3333",
        "#33FFBD", "#A133FF", "#33A1FF", "#57FF33",
        "#FF8D33", "#FF33F3", "#5733FF", "#BDFF33"
      ];

    // For tag suggestions in filter
    const [allTagCategories, setAllTagCategories] = useState([]);

    const collections = ['leads', 'books', 'products', 'contacts'];

    useEffect(() => {
        fetchTags();
    }, []);

    const router = useRouter();

    useEffect(() => {
        // Extract all unique categories/collections from tags
        const categoriesSet = new Set();
        tags.forEach(tag => {
            if (tag.category) categoriesSet.add(tag.category);
            if (tag.collectionName) categoriesSet.add(tag.collectionName);
        });
        setAllTagCategories(Array.from(categoriesSet));
    }, [tags]);

    const fetchTags = async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            // 1. Fetch all tags
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/alltags`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const tagsData = response.data;

            const countsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/tags-with-counts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const countsData = countsResponse.data.data;

            // 3. Merge the counts into the tags data
            const tagsWithCounts = tagsData.map(tag => {
                const tagCounts = countsData[tag.name] || { leads: 0, files: 0 };
                const leads = tagCounts.leads;
                const files = tagCounts.files;
                return {
                    ...tag,
                    leadsCount: leads,
                    filesCount: files,
                    totalCount: leads + files,
                };
            });
            console.log('Merged tags:', tagsWithCounts);

            setTags(tagsWithCounts);
            setError(null);
        } catch (err) {
            console.error('Error fetching tags:', err);
            setError('Failed to load tags. Please try again later.');
            setSnackbar({
                open: true,
                message: 'Failed to load tags',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // 1. Added a new function to fetch a single tag by name:
    const fetchTagByName = async (tagName) => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/tagmanager/tag/${tagName}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            console.error('Error fetching tag by name:', err);
            setSnackbar({
                open: true,
                message: 'Failed to load the tag',
                severity: 'error'
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleTagSelect = async (tag) => {
        const token = localStorage.getItem("token");
        setLoading(true);

        try {
            // Manually format query parameters
            const params = new URLSearchParams();
            params.append("tagIds[]", tag._id); // Ensuring proper bracket notation

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/leads-by-tags?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            if (response.data.success) {
                console.log('Leads by tag:', response.data.data);
                
                setSelectedTagLeads(response.data.data);
            } else {
                setSnackbar({
                    open: true,
                    message: 'Failed to load leads by tag',
                    severity: 'error'
                });
            }
        } catch (err) {
            console.error('Error fetching leads by tag:', err);
            setSnackbar({
                open: true,
                message: 'Failed to load leads by tag',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async () => {
        const token = localStorage.getItem("token");
    
        if (!newTag.name || newTag.name.trim() === '') {
            setSnackbar({
                open: true,
                message: 'Tag name cannot be empty',
                severity: 'error'
            });
            return;
        }
    
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/createTag`, newTag, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            // Fetch updated tags list after creating a tag
            await fetchTags(); 
    
            setNewTag({ name: '', description: '', collectionName: 'leads' });
            setOpenCreateDialog(false);
    
            setSnackbar({
                open: true,
                message: 'Tag created successfully',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error creating tag:', err);
            setSnackbar({
                open: true,
                message: 'Failed to create tag',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    

    const handleUpdateTagName = async (tagId, newTagName, newDescription) => {
        if (!newTagName.trim()) return;
      
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
          const slug = newTagName.toLowerCase().replace(/\s+/g, '-');
          const payload = {
            newName: newTagName.trim(),
            description: newDescription || "", // This now allows an empty description
            color: selectedTag?.color || ""
          };
      
          await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/updatetags/${tagId}`, payload, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
      
          // Update local state so the changes are reflected immediately
          setTags(prevTags => prevTags.map(tag =>
            tag._id === tagId ? { ...tag, name: newTagName, slug: slug, description: newDescription || "", color: selectedTag?.color || "" } : tag
          ));
      
          if (selectedTag && selectedTag._id === tagId) {
            setSelectedTag(prev => ({ ...prev, name: newTagName, slug: slug, description: newDescription || "", color: selectedTag?.color || "" }));
          }
      
          setSnackbar({
            open: true,
            message: 'Tag updated successfully',
            severity: 'success'
          });
        } catch (err) {
          console.error('Error updating tag:', err);
          setSnackbar({
            open: true,
            message: `Failed to update tag: ${err.response?.data?.error || err.message}`,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };      
    

    // Delete a tag
    const handleDeleteTag = async (tagId) => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager//deletetags/${tagId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update state immediately
            setTags(prevTags => prevTags.filter(tag => tag._id !== tagId));

            // If deleted tag was selected, clear selection
            if (selectedTag && selectedTag._id === tagId) {
                setSelectedTag(null);
            }

            setSnackbar({
                open: true,
                message: 'Tag deleted successfully',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error deleting tag:', err);
            setSnackbar({
                open: true,
                message: 'Failed to delete tag',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Update tag items (add or remove)
    const handleUpdateTagItems = async (tagId, itemId, collectionName, action) => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/update-items`, {
                tagId,
                itemId,
                collectionName,
                action 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (action === 'remove') {
                if (selectedTag && selectedTag._id === tagId) {
                    setSelectedTag(prev => ({
                        ...prev,
                        items: prev.items.filter(item => item.itemId !== itemId)
                    }));
                }

                setTags(prevTags => prevTags.map(tag => {
                    if (tag._id === tagId && tag.items) {
                        return {
                            ...tag,
                            items: tag.items.filter(item => item.itemId !== itemId)
                        };
                    }
                    return tag;
                }));
            } else {
                // For adding, fetch the updated tag to get the correct items
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/tag/${tagId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const updatedTag = response.data;

                // Update in the state
                if (selectedTag && selectedTag._id === tagId) {
                    setSelectedTag(updatedTag);
                }

                setTags(prevTags => prevTags.map(tag =>
                    tag._id === tagId ? updatedTag : tag
                ));
            }

            setSnackbar({
                open: true,
                message: `Item ${action === 'add' ? 'added to' : 'removed from'} tag`,
                severity: 'success'
            });
        } catch (err) {
            console.error('Error updating tag items:', err);
            setSnackbar({
                open: true,
                message: 'Failed to update tag items',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch and select tag
    const handleFetchAndSelectTag = async (tagId) => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tagmanager/tag/${tagId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const tagData = response.data;

            // Update the tag in the state
            setTags(prevTags => prevTags.map(tag =>
                tag._id === tagId ? tagData : tag
            ));

            // Select the tag
            setSelectedTag(tagData);

        } catch (err) {
            console.error('Error fetching tag details:', err);
            setSnackbar({
                open: true,
                message: 'Failed to load tag details',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredSidebarTags = tags.filter(tag =>
        tag?.name?.toLowerCase()?.includes(sidebarSearchTerm.toLowerCase()));

    const filteredMainTags = tags.filter(tag => {
        // Skip tags without a name
        if (!tag || !tag.name) return false;

        // Text search filter
        const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter tags (categories) filter
        const matchesFilterTags = filterTags.length === 0 ||
            (tag.category && filterTags.includes(tag.category)) ||
            (tag.collectionName && filterTags.includes(tag.collectionName));

        return matchesSearch && matchesFilterTags;
    });

// Fetch leads as before:
useEffect(() => {
    fetchLeads();
  }, []);
  
  const fetchLeads = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Fetched leads:", response.data);
      // API response contains leads under the "leads" key
      setAllLeads(response.data.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };
  
  const [leadsSearchTerm, setLeadsSearchTerm] = useState('');
  
  const leadsToFilter = selectedTagLeads;

// Apply filtering and sorting
const filteredLeads = Array.isArray(leadsToFilter)
  ? leadsToFilter
      .filter(lead => {
        const searchLower = leadsSearchTerm.toLowerCase();
        // Check lead name and campaign name
        const campaignName = lead.campaignid && typeof lead.campaignid === 'object'
          ? lead.campaignid.name || ""
          : lead.campaignid || "";
        const matchesSearch =
          lead.name?.toLowerCase().includes(searchLower) ||
          campaignName.toLowerCase().includes(searchLower);
        // If statusFilter is set, match exactly on the lead's status
        const matchesStatus = statusFilter ? lead.status === statusFilter : true;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Compare based on the chosen sort field
        if (sortField === 'createdAt') {
          return sortOrder === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortField === 'name') {
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortField === 'assignedTo') {
          // For sorting on assignedTo, we assume that a lead with no assignedTo returns an empty string.
          const aName = a.assignedTo ? `${a.assignedTo.firstName || ''} ${a.assignedTo.lastName || ''}`.trim() : '';
          const bName = b.assignedTo ? `${b.assignedTo.firstName || ''} ${b.assignedTo.lastName || ''}`.trim() : '';
          return sortOrder === 'asc'
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName);
        }
        return 0;
      })
  : [];

useEffect(() => {
  console.log('Filtered Leads:', filteredLeads);
}, [filteredLeads]);
  
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle the sort order
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Change the field and reset order to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };  
            
    // Handle going back to the tags list
    const handleBackToList = () => {
        setSelectedTagLeads(null);
    };

    const handleOpenEditDialog = (tag) => {
        setSelectedTag(tag); 
        setEditedTagName(tag.name);
        setEditedTagDescription(tag.description || "");
        setEditDialogOpen(true);
      };      

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterTags([]);
    };

    // Function to search for specific tags by name
    const handleSearchTagsByName = async () => {
        // Example usage - you could tie this to UI elements as needed
        const tagNamesToSearch = ["Education", "Technology"];
        const foundTags = await fetchTagsByNames(tagNamesToSearch);

        if (foundTags && foundTags.length > 0) {
            // Do something with the found tags
            console.log("Found tags:", foundTags);

            // For example, you could filter to show only these tags
            setTags(prevTags => {
                // Merge the found tags with existing tags
                const tagIds = foundTags.map(tag => tag._id);
                const filteredTags = prevTags.filter(tag => !tagIds.includes(tag._id));
                return [...filteredTags, ...foundTags];
            });

            // Or set these as filter criteria
            setFilterTags(tagNamesToSearch);
        }
    };
console.log(filteredLeads,"checkin");

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
        }}>
            {/* Tags Sidebar */}
            <Box sx={{
                width: '280px',
                height: '100%',
                borderRight: '1px solid #e0e0e0',
                p: 2,
                overflowY: 'auto'
            }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Tags</Typography>
                <Button
                    variant="outlined"
                    startIcon={<i className="ri-add-fill"></i>}
                    sx={{ mb: 1 }}
                    onClick={() => setOpenCreateDialog(true)}
                >
                    Create Tag
                </Button>

                <TextField
                    fullWidth
                    placeholder="Search tags..."
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2, mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <i className="ri-search-line"></i>
                            </InputAdornment>
                        ),
                    }}
                    value={sidebarSearchTerm}
                    onChange={(e) => setSidebarSearchTerm(e.target.value)}
                />

                <Divider sx={{ mb: 2 }} />

                {loading && tags.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredSidebarTags.map((tag) => (
                            <ListItem
                                button
                                key={tag._id}
                                selected={selectedTag?._id === tag._id}
                                onClick={() => handleTagSelect(tag)}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                <i className="ri-price-tag-3-fill" style={{
                                        color: tag.color
                                    }}> </i>
                                </ListItemIcon>
                                <ListItemText primary={tag.name || "Unnamed Tag"} />
                                <div 
                                    className="flex items-center justify-center bg-gray-200 rounded-full w-6 h-6 min-w-[24px] text-xs font-medium"
                                    >
                                    {tag.totalCount || 0}
                                    </div>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
            {/* Main content */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
            {/* Search bar always appears when in leads view */}
            {(selectedTagLeads || leadsSearchTerm) ? (
                <Box>
                <Paper sx={{ p: 2, mb: 3, boxShadow: "none", backgroundColor: "#F7F7F9" }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        placeholder="Search leads..."
                        variant="outlined"
                        size="small"
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                            <i className="ri-search-line"></i>
                            </InputAdornment>
                        ),
                        }}
                        value={leadsSearchTerm}
                        onChange={(e) => setLeadsSearchTerm(e.target.value)}
                    />
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                        label="Status Filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="New">New</MenuItem>
                        <MenuItem value="Contacted">Contacted</MenuItem>
                        <MenuItem value="Converted">Converted</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                        <MenuItem value="Interested">Interested</MenuItem>
                        <MenuItem value="Lost">Lost</MenuItem>
                        <MenuItem value="Not Interested">Not Interested</MenuItem>
                        {/* Add other status values as needed */}
                        </Select>
                    </FormControl>
                    </Grid>
                </Grid>
                </Paper>
                {/* Back button to clear tag selection/search */}
                <Box sx={{ mb: 2 }}>
                    <Button
                    startIcon={<i className="ri-arrow-left-line"></i>}
                    onClick={() => {
                        setSelectedTagLeads(null);
                        setLeadsSearchTerm('');
                    }}
                    >
                    Back to Tag List
                    </Button>
                </Box>

                {!selectedTagLeads ? (
                <Typography variant="body1">Please select a tag to view leads.</Typography>
                ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="leads table">
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => handleSortChange('name')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Lead Name
                            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                                <i
                                className="ri-arrow-up-s-line"
                                style={{
                                    fontSize: '16px',
                                    opacity: sortField === 'name' && sortOrder === 'asc' ? 1 : 0.3,
                                }}
                                />
                                <i
                                className="ri-arrow-down-s-line"
                                style={{
                                    fontSize: '16px',
                                    opacity: sortField === 'name' && sortOrder === 'desc' ? 1 : 0.3,
                                }}
                                />
                            </Box>
                            </TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Campaign Name</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell onClick={() => handleSortChange('createdAt')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Created At
                            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                                <i
                                className="ri-arrow-up-s-line"
                                style={{
                                    fontSize: '16px',
                                    opacity: sortField === 'createdAt' && sortOrder === 'asc' ? 1 : 0.3,
                                }}
                                />
                                <i
                                className="ri-arrow-down-s-line"
                                style={{
                                    fontSize: '16px',
                                    opacity: sortField === 'createdAt' && sortOrder === 'desc' ? 1 : 0.3,
                                }}
                                />
                            </Box>
                            </TableCell>
                        </TableRow>
                        </TableHead>
                    <TableBody>
                        {filteredLeads.map(lead => (
                        <TableRow
                            key={lead._id}
                            onClick={() => router.push(`/en/manager/leads/byid/${lead._id}`)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <TableCell>{lead.name}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>
                            {lead.campaignid && typeof lead.campaignid === 'object'
                                ? lead.campaignid.name
                                : lead.campaignid || ''}
                            </TableCell>
                            <TableCell>
                            {lead.assignedTo?.firstName || lead.assignedTo?.lastName
                                ? `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim()
                                : 'Unassigned'}
                            </TableCell>
                            <TableCell>{lead.status}</TableCell>
                            <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                )}
                </Box>
            ) : (
                // Else, show your main tag list table
                <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table sx={{ minWidth: 650 }} aria-label="tags table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Tag Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Items Count</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {filteredMainTags.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={6} align="center">
                            {loading ? (
                            <CircularProgress size={24} sx={{ my: 2 }} />
                            ) : (
                            'No tags found'
                            )}
                        </TableCell>
                        </TableRow>
                    ) : (
                        filteredMainTags.map((tag) => (
                        <TableRow
                            key={tag._id}
                            sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                            onClick={() => handleTagSelect(tag)}
                        >
                            <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <i className="ri-price-tag-3-fill" style={{ marginRight: '8px', color: tag.color }} />
                                {tag.name || "Unnamed Tag"}
                            </Box>
                            </TableCell>
                            <TableCell>{tag.category || tag.collectionName || "N/A"}</TableCell>
                            <TableCell>{tag.totalCount || 0}</TableCell>
                            <TableCell>{new Date(tag.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                            <IconButton
                                onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDialog(tag);
                                }}
                            >
                                <i className="ri-edit-line text-blue-500"></i>
                            </IconButton>
                            <IconButton
                                onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                                setDeleteDialogOpen(true);
                                }}
                            >
                                <i className="ri-delete-bin-4-line text-red-500"></i>
                            </IconButton>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </TableContainer>
            )}
            </Box>

    {/* Create Tag Dialog */}
    <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
      <DialogTitle>Create New Tag</DialogTitle>
      <DialogContent sx={{ minWidth: 400 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Tag Name"
          fullWidth
          variant="outlined"
          value={newTag.name}
          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          value={newTag.description}
          onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
          sx={{ mb: 2 }}
          placeholder="Enter a description for this tag"
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel>Collection</InputLabel>
          <Select
            value={newTag.collectionName}
            onChange={(e) => setNewTag({ ...newTag, collectionName: e.target.value })}
            label="Collection"
          >
            {collections.map((collection) => (
              <MenuItem key={collection} value={collection}>
                {collection}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Color Picker */}
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>Select Tag Color</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {tagColors.map((color) => (
            <Box
              key={color}
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: color,
                cursor: "pointer",
                border: newTag.color === color ? "2px solid black" : "2px solid transparent"
              }}
              onClick={() => setNewTag({ ...newTag, color })}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenCreateDialog(false)} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleCreateTag}
          variant="contained"
          disabled={loading || !newTag.name?.trim()}
        >
          {loading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Edit Tag Dialog (with optional color editing) */}
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
      <DialogTitle>Edit Tag</DialogTitle>
      <DialogContent sx={{ minWidth: 400 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Tag Name"
          fullWidth
          variant="outlined"
          value={editedTagName}
          onChange={(e) => setEditedTagName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          value={editedTagDescription || ""}
          onChange={(e) => setEditedTagDescription(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Enter a description for this tag"
        />

        {/* Optional Color Picker for Editing */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Select Tag Color</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {tagColors.map((color) => (
            <Box
              key={color}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                backgroundColor: color,
                cursor: "pointer",
                border: selectedTag?.color === color ? "2px solid black" : "2px solid transparent"
              }}
              onClick={() => {
                // Update color for selected tag. Adjust state handling as needed.
                setSelectedTag({ ...selectedTag, color });
              }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditDialogOpen(false)} disabled={loading}>Cancel</Button>
        <Button
            onClick={() => {
                if (editedTagName.trim() && selectedTag && selectedTag._id) {
                handleUpdateTagName(selectedTag._id, editedTagName, editedTagDescription);
                setEditDialogOpen(false);
                } else {
                console.error("Selected tag is null or invalid.");
                }
            }}
            variant="contained"
            disabled={loading || !editedTagName.trim()}
            >
            Save
        </Button>
      </DialogActions>
    </Dialog>

    {/* Delete Tag Dialog */}
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
      <DialogTitle>Delete Tag</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{selectedTag?.name}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
        <Button
          onClick={() => {
            handleDeleteTag(selectedTag._id);
            setDeleteDialogOpen(false);
          }}
          variant="contained"
          color="error"
          disabled={loading}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>

    );
}
