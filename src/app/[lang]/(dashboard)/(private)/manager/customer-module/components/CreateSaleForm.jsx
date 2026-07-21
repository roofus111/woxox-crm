// CreateSaleForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, Grid, MenuItem, IconButton, FormControl, InputLabel, Select, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';

const CreateSaleForm = ({ open, onClose, customerId, leadId: propLeadId, invoiceId: propInvoiceId, onSaleCreated }) => {
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    leadId: propLeadId || '',
    products: [],
    notes: '',
    status: 'pending',
    accepted: false,
    currency: 'USD'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (open) {
      fetchInitialData();
      setFormData({
        customerId: customerId || '',
        leadId: propLeadId || '',
        products: [],
        notes: '',
        status: 'pending',
        accepted: false,
        currency: 'USD'
      });
      setError('');
      setSuccess('');
    }
  }, [open, customerId, propLeadId]);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [customersRes, leadsRes, productsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/getcustomers`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/getleads`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/getproducts`, { headers })
      ]);

      const customersList = customersRes.data.customers || [];
      const leadsList = leadsRes.data.leads || [];
      const productsList = productsRes.data.products || [];

      setCustomers(customersList);
      setLeads(leadsList);
      setProducts(productsList);

      // AUTO-ASSIGN leadId
      let chosenLeadId = propLeadId || '';
      if (!chosenLeadId) {
        if (customerId && leadsList.length > 0) {
          const matchByCustomerField = leadsList.find(l => {
            if (!l) return false;
            if (l.customer && typeof l.customer === 'string') return l.customer === customerId;
            if (l.customerId && typeof l.customerId === 'string') return l.customerId === customerId;
            if (l.customer && typeof l.customer === 'object' && l.customer._id) return String(l.customer._id) === String(customerId);
            return false;
          });

          if (matchByCustomerField) {
            chosenLeadId = matchByCustomerField._id;
          } else {
            const currentCustomer = customersList.find(c => String(c._id) === String(customerId));
            if (currentCustomer?.email) {
              const matchByEmail = leadsList.find(l => l.email && l.email === currentCustomer.email);
              if (matchByEmail) chosenLeadId = matchByEmail._id;
            }
          }
        }
      }

      // fallback to first lead
      if (!chosenLeadId && leadsList.length > 0) chosenLeadId = leadsList[0]._id;

      setFormData(prev => ({ ...prev, leadId: chosenLeadId }));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleProductAdd = () => setFormData(prev => ({ ...prev, products: [...prev.products, { productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }] }));

  const handleProductRemove = (index) => setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));

  const handleProductChange = (index, field, value) => {
    setFormData(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? value : newProducts[index].quantity;
        const unitPrice = field === 'unitPrice' ? value : newProducts[index].unitPrice;
        newProducts[index].totalPrice = (Number(quantity) || 0) * (Number(unitPrice) || 0);
      }

      if (field === 'productId' && value) {
        const sel = products.find(p => p._id === value);
        if (sel) {
          newProducts[index].unitPrice = sel.price || 0;
          newProducts[index].totalPrice = newProducts[index].quantity * (sel.price || 0);
        }
      }

      return { ...prev, products: newProducts };
    });
  };

  const calculateTotalAmount = () => formData.products.reduce((t, p) => t + (Number(p.totalPrice) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      // If invoiceId provided (propInvoiceId) prefer sending invoiceId to backend
      if (propInvoiceId) {
        const salesData = {
          invoiceId: propInvoiceId,
          leadId: formData.leadId || undefined,
          customerId: formData.customerId || undefined,
          notes: formData.notes,
          status: formData.status,
          accepted: formData.accepted,
          currency: formData.currency,
          totalAmountPaid: 0
        };

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/create`, salesData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        setSuccess('Sale created successfully from invoice!');
        if (onSaleCreated) onSaleCreated(response.data.sale);
        setTimeout(() => onClose(), 900);
        return;
      }

      // map products => items (backend shape)
      const items = formData.products.map(p => {
        const prod = products.find(x => x._id === p.productId);
        return {
          product: p.productId || null,
          itemName: prod?.name || '',
          quantity: Number(p.quantity) || 1,
          unitPrice: Number(p.unitPrice) || 0,
          description: p.description || '',
          total: Number(p.totalPrice) || (Number(p.quantity || 0) * Number(p.unitPrice || 0))
        };
      });

      const salesData = {
        customerId: formData.customerId,
        leadId: formData.leadId || undefined,
        items,
        invoices: [], // if you have invoice ids to attach, set here
        notes: formData.notes,
        status: formData.status,
        accepted: formData.accepted,
        currency: formData.currency,
        totalAmountPaid: 0
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/create`, salesData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      setSuccess('Sale created successfully!');
      if (onSaleCreated) onSaleCreated(response.data.sale);
      setTimeout(() => onClose(), 900);
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(err.response?.data?.message || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent><Box display="flex" justifyContent="center" alignItems="center" p={4}><CircularProgress /><Typography ml={2}>Loading...</Typography></Box></DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle><Typography variant="h5" fontWeight={600} color="#007bff">Create New Sale</Typography></DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Grid container spacing={3}>
              {/* Customer */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Customer</InputLabel>
                  <Select value={formData.customerId} onChange={(e) => handleChange('customerId', e.target.value)} label="Customer">
                    {customers.map((c) => <MenuItem key={c._id} value={c._id}>{c.firstName} {c.lastName} - {c.email}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* Lead (auto) */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Lead (auto)" value={(leads.find(l => String(l._id) === String(formData.leadId))?.name ?? leads.find(l => String(l._id) === String(formData.leadId))?.email ?? (formData.leadId || 'No lead selected'))} InputProps={{ readOnly: true }} />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth><InputLabel>Status</InputLabel><Select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} label="Status"><MenuItem value="pending">Pending</MenuItem><MenuItem value="in-progress">In Progress</MenuItem><MenuItem value="completed">Completed</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem></Select></FormControl>
              </Grid>

              {/* Currency */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth><InputLabel>Currency</InputLabel><Select value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} label="Currency"><MenuItem value="USD">USD</MenuItem><MenuItem value="EUR">EUR</MenuItem><MenuItem value="GBP">GBP</MenuItem><MenuItem value="INR">INR</MenuItem><MenuItem value="JPY">JPY</MenuItem><MenuItem value="AUD">AUD</MenuItem></Select></FormControl>
              </Grid>

              {/* Products / Items */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>Products</Typography>
                  <Button variant="outlined" onClick={handleProductAdd} startIcon={<i className="ri-add-line" />} size="small">Add Product</Button>
                </Box>

                {formData.products.map((product, index) => (
                  <Box key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Product {index + 1}</Typography>
                      <IconButton onClick={() => handleProductRemove(index)} size="small" color="error"><i className="ri-delete-bin-line" /></IconButton>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required><InputLabel>Product</InputLabel><Select value={product.productId} onChange={(e) => handleProductChange(index, 'productId', e.target.value)} label="Product">{products.map(prod => <MenuItem key={prod._id} value={prod._id}>{prod.name} - {formData.currency}{prod.price}</MenuItem>)}</Select></FormControl>
                      </Grid>

                      <Grid item xs={12} sm={2}><TextField fullWidth label="Quantity" type="number" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)} inputProps={{ min: 1 }} required /></Grid>
                      <Grid item xs={12} sm={2}><TextField fullWidth label="Unit Price" type="number" value={product.unitPrice} onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} inputProps={{ min: 0, step: 0.01 }} required /></Grid>
                      <Grid item xs={12} sm={2}><TextField fullWidth label="Total" type="number" value={product.totalPrice} InputProps={{ readOnly: true }} sx={{ backgroundColor: '#f5f5f5' }} /></Grid>
                    </Grid>
                  </Box>
                ))}

                {formData.products.length === 0 && <Box sx={{ textAlign: 'center', py: 3 }}><Typography>No products added yet. Click "Add Product" to get started.</Typography></Box>}
                {formData.products.length > 0 && <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}><Typography variant="h6" fontWeight={600}>Total Amount: {formData.currency} {calculateTotalAmount().toLocaleString()}</Typography></Box>}
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" multiline rows={3} value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Add any additional notes about this sale..." />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || formData.products.length === 0} sx={{ backgroundColor: '#007bff' }}>{loading ? <CircularProgress size={20} /> : 'Create Sale'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateSaleForm;
