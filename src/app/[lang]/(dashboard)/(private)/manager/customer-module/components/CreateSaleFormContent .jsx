// CreateSaleFormContent.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Grid, DialogContent, TextField, MenuItem, Typography, IconButton, DialogActions
} from '@mui/material';

// NOTE: no Leads import here — we use the `leads` prop you pass in

const CreateSaleFormContent = ({ customerId, availableProducts = [], loadingProducts = false, onCreateSale, onClose, leads = [] }) => {
  const [formData, setFormData] = useState({
    leadId: "",
    products: [],
    notes: '',
    status: 'pending',
    accepted: false,
    currency: 'USD'
  });

  useEffect(() => {
    if (!formData.leadId && leads?.length > 0) {
      setFormData(prev => ({ ...prev, leadId: leads[0]._id }));
    }
    // if a new customerId arrives, we don't clear user products
  }, [leads]);

  useEffect(() => {
    console.log('Available Products:', availableProducts);
  }, [availableProducts]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductAdd = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { productId: '', quantity: 1, unitPrice: 0, totalPrice: 0, selectedPackage: '' }
      ]
    }));
  };

  const handleProductRemove = (index) => {
    setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

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
        const selectedProduct = availableProducts.find(p => p._id === value);
        if (selectedProduct) {
          const basePrice = selectedProduct.price ?? (selectedProduct.packages?.[0]?.price ?? 0);
          newProducts[index].unitPrice = basePrice;
          newProducts[index].totalPrice = newProducts[index].quantity * basePrice;
        }
      }

      if (field === 'selectedPackage' && value) {
        const selectedProduct = availableProducts.find(p => p._id === newProducts[index].productId);
        if (selectedProduct?.packages) {
          const selectedPackage = selectedProduct.packages.find(pkg => pkg.name === value);
          if (selectedPackage) {
            newProducts[index].unitPrice = selectedPackage.price;
            newProducts[index].totalPrice = newProducts[index].quantity * selectedPackage.price;
          }
        }
      }

      return { ...prev, products: newProducts };
    });
  };

  const calculateTotalAmount = () => formData.products.reduce((t, p) => t + (Number(p.totalPrice) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const items = formData.products.map(p => ({
      product: p.productId || null,
      itemName: p.itemName || '',
      quantity: Number(p.quantity) || 1,
      unitPrice: Number(p.unitPrice) || 0,
      description: p.description || '',
      total: Number(p.totalPrice) || (Number(p.quantity || 0) * Number(p.unitPrice || 0))
    }));

    const salePayload = {
      customerId,
      items,
      notes: formData.notes,
      status: formData.status,
      accepted: formData.accepted,
      currency: formData.currency,
      totalAmountPaid: 0,
    };

    if (formData.leadId) {
      salePayload.leadId = formData.leadId;
    }

    onCreateSale(salePayload);
  };

  const getProductDisplayPrice = (product) => {
    if (!product) return 0;
    if (product.price) return product.price;
    if (product.packages && product.packages.length > 0) return product.packages[0].price;
    return 0;
  };

  const getSelectedProduct = (productId) => availableProducts.find(p => p._id === productId);

  return (
    <>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Status */}
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Status" value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>

            {/* Currency */}
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Currency" value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="JPY">JPY</MenuItem>
                <MenuItem value="AUD">AUD</MenuItem>
              </TextField>
            </Grid>

            {/* Products */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Products</Typography>
                <Button variant="outlined" onClick={handleProductAdd} startIcon={<i className="ri-add-line" />} size="small" disabled={loadingProducts || !availableProducts || availableProducts.length === 0}>
                  Add Product
                </Button>
              </Box>

              {loadingProducts && <Box sx={{ textAlign: 'center', py: 2 }}><Typography>Loading products...</Typography></Box>}
              {!loadingProducts && (!availableProducts || availableProducts.length === 0) && <Box sx={{ textAlign: 'center', py: 2 }}><Typography>No products available</Typography></Box>}

              {formData.products.map((product, index) => {
                const selectedProduct = getSelectedProduct(product.productId);
                return (
                  <Box key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Product {index + 1}</Typography>
                      <IconButton onClick={() => handleProductRemove(index)} size="small" sx={{ color: '#dc3545' }}>
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField select fullWidth label="Product" value={product.productId} onChange={(e) => handleProductChange(index, 'productId', e.target.value)} required disabled={loadingProducts}>
                          {availableProducts && availableProducts.length > 0 ? (
                            availableProducts.map((prod) => (<MenuItem key={prod._id} value={prod._id}>{prod.name} - {formData.currency} {getProductDisplayPrice(prod)}</MenuItem>))
                          ) : <MenuItem disabled>No products available</MenuItem>}
                        </TextField>
                      </Grid>

                      {selectedProduct?.packages?.length > 0 && (
                        <Grid item xs={12} sm={6}>
                          <TextField select fullWidth label="Package" value={product.selectedPackage || ''} onChange={(e) => handleProductChange(index, 'selectedPackage', e.target.value)}>
                            {selectedProduct.packages.map((pkg) => <MenuItem key={pkg.name} value={pkg.name}>{pkg.name} - {formData.currency} {pkg.price}</MenuItem>)}
                          </TextField>
                        </Grid>
                      )}

                      <Grid item xs={12} sm={2}>
                        <TextField fullWidth label="Quantity" type="number" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)} inputProps={{ min: 1 }} required />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <TextField fullWidth label="Unit Price" type="number" value={product.unitPrice} onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} inputProps={{ min: 0, step: 0.01 }} required />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <TextField fullWidth label="Total" type="number" value={product.totalPrice} InputProps={{ readOnly: true }} sx={{ backgroundColor: '#f5f5f5' }} />
                      </Grid>
                    </Grid>

                    {selectedProduct && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f8ff', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}><strong>Description:</strong> {selectedProduct.description || 'No description available'}</Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}><strong>Type:</strong> {selectedProduct.type || 'Unknown'}</Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}

              {formData.products.length === 0 && !loadingProducts && <Box sx={{ textAlign: 'center', py: 3 }}><Typography>No products added yet. Click "Add Product" to get started.</Typography></Box>}

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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={formData.products.length === 0 || loadingProducts} sx={{ backgroundColor: '#007bff' }}>
          Create Sale
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateSaleFormContent;
