'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function SuppressionPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('manual');

  const fetchItems = async () => {
    try {
      const res = await emailApi.getSuppression();
      setItems(res.data?.data || []);
    } catch {
      toast.error('Failed to load suppression list');
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    try {
      await emailApi.addSuppression({ email, reason });
      toast.success('Added to suppression list');
      setOpen(false);
      setEmail('');
      fetchItems();
    } catch {
      toast.error('Failed to add');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this email from the suppression list?')) return;
    try {
      await emailApi.deleteSuppression(id);
      toast.success('Removed from suppression list');
      fetchItems();
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Suppression List</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Add Email</Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Added</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.email}</TableCell>
                <TableCell><Chip label={item.reason} size="small" /></TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleDelete(item._id)} title="Remove">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center">No suppressed emails</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add to Suppression List</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Email" sx={{ mt: 1, mb: 2 }} value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="unsubscribe">Unsubscribe</MenuItem>
            <MenuItem value="bounce">Bounce</MenuItem>
            <MenuItem value="spam">Spam</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
