"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Container, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function ExpenseIncomeTracker() {
  // State management
  const [isIncome, setIsIncome] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    name: '',
    description: '',
    type: 'expense'
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/getcategories`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Map the _id to id for table rendering
        const fetchedCategories = response.data.data.map(item => ({
          ...item,
          id: item._id
        }));
        setEntries(fetchedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle between income and expense
  const handleToggle = () => {
    setIsIncome(!isIncome);
    setNewEntry(prev => ({
      ...prev,
      type: !isIncome ? 'income' : 'expense'
    }));
  };

  // Open add entry dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Close add entry dialog and reset form
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewEntry({
      name: '',
      description: '',
      type: isIncome ? 'income' : 'expense'
    });
  };

  // Add new category entry via API using axios
  const handleAddEntry = async () => { 
    if (!newEntry.name) return;
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/createcategory`,
        newEntry,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Append the newly created category to the state
        setEntries(prevEntries => [
          ...prevEntries, 
          { ...response.data.data, id: response.data.data._id }
        ]);
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  // Open edit dialog and set current entry
  const handleEditClick = (entry) => {
    setEditEntry(entry);
    setOpenEditDialog(true);
  };

  // Close edit dialog and reset editEntry
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditEntry(null);
  };

  // Handle updating a category via API
  const handleUpdateCategory = async () => {
    if (!editEntry?.name) return;
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/updatecategory/${editEntry.id}`,
        editEntry,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the entry in state
        setEntries(prevEntries => prevEntries.map(item => 
          item.id === editEntry.id ? { ...response.data.data, id: response.data.data._id } : item
        ));
        handleCloseEditDialog();
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Handle deleting a category via API
  const handleDeleteCategory = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/deletecategory/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Remove the deleted category from state
        setEntries(prevEntries => prevEntries.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Filter entries based on the type (income or expense) for display
  const filteredEntries = entries.filter(entry => entry.type === (isIncome ? 'income' : 'expense'));

  // Prepare data for pie chart (using category totals)
  const getPieChartData = () => {
    const categoryTotals = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.name]) {
        acc[entry.name] = 0;
      }
      // Assuming each entry might have an 'amount' property.
      acc[entry.name] += parseFloat(entry.amount || 0);
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([name, value]) => ({ 
      name, 
      value 
    }));
  };

  // Calculate insights
  const calculateInsights = () => {
    const totalAmount = filteredEntries.reduce((sum, entry) => 
      sum + parseFloat(entry.amount || 0), 0
    );

    const categoryTotals = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.name]) {
        acc[entry.name] = 0;
      }
      acc[entry.name] += parseFloat(entry.amount || 0);
      return acc;
    }, {});

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [category, amount]) => 
        amount > max.amount ? { category, amount } : max, 
      { category: '', amount: 0 }
    );

    return {
      totalCategories: new Set(filteredEntries.map(e => e.name)).size,
      totalAmount,
      topCategory: topCategory.category,
      topPercentage: totalAmount > 0 ? ((topCategory.amount / totalAmount) * 100).toFixed(2) : 0
    };
  };

  const insights = calculateInsights();
  const pieData = getPieChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <div 
          className="relative w-64 h-12 bg-primary rounded-full flex items-center cursor-pointer"
          onClick={handleToggle}
        >
          <div 
            className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full transition-all duration-300 ease-in-out ${
              isIncome ? 'right-1 left-auto' : 'left-1 right-auto'
            }`}
          />
          <div className="flex w-full z-10">
            <div 
              className={`w-1/2 text-center py-3 ${
                !isIncome ? 'text-black' : 'text-white'
              }`}
            >
              Expense
            </div>
            <div 
              className={`w-1/2 text-center py-3 ${
                isIncome ? 'text-black' : 'text-white'
              }`}
            >
              Income
            </div>
          </div>
        </div>
        <IconButton 
          variant="outlined" 
          color="primary" 
          onClick={handleOpenDialog}
          sx={{ ml: 2 }}
          className='bg-gray-200'
        >
          <i className="ri-add-line"></i>
        </IconButton>
      </Box>

      {/* Insights and Pie Chart */}
      <Grid container spacing={2} sx={{ mb: 2, mt: 4 }}>
        {/* Insights Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card sx={{ boxShadow: 'none' }}>
                <CardContent className='border border-gray-200 rounded-xl'>
                  <Typography variant="h6">Total Categories</Typography>
                  <Typography variant="h4">
                    {insights.totalCategories}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ boxShadow: 'none' }}>
                <CardContent className='border border-gray-200 rounded-xl'>
                  <Typography variant="h6">
                    Total {isIncome ? 'Income' : 'Expense'}
                  </Typography>
                  <Typography variant="h4">
                    ${insights.totalAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ boxShadow: 'none' }}>
                <CardContent className='border border-gray-200 rounded-xl'>
                  <Typography variant="h6">Top Category</Typography>
                  <Typography variant="h4">
                    {insights.topCategory || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ boxShadow: 'none' }}>
                <CardContent className='border border-gray-200 rounded-xl'>
                  <Typography variant="h6">Top Category %</Typography>
                  <Typography variant="h4">
                    {insights.topPercentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Pie Chart Column */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Grid>
      </Grid>

      {/* Entries Table - display only filtered categories */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(entry)}>
                    <i className="ri-pencil-line text-blue-500"></i>
                  </IconButton>
                  <IconButton onClick={() => handleDeleteCategory(entry.id)}>
                    <i className="ri-delete-bin-line text-red-500"></i>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Entry Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Add {isIncome ? 'Income' : 'Expense'} Category
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newEntry.name}
            onChange={(e) => setNewEntry(prev => ({
              ...prev, 
              name: e.target.value
            }))}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newEntry.description}
            onChange={(e) => setNewEntry(prev => ({
              ...prev, 
              description: e.target.value
            }))}
          />
          <Button 
            onClick={handleAddEntry} 
            color="primary" 
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add {isIncome ? 'Income' : 'Expense'} Category
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editEntry?.name || ''}
            onChange={(e) => setEditEntry(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={editEntry?.description || ''}
            onChange={(e) => setEditEntry(prev => ({ ...prev, description: e.target.value }))}
          />
          <Button 
            onClick={handleUpdateCategory} 
            color="primary" 
            variant="contained"
            sx={{ mt: 2 }}
          >
            Update Category
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
