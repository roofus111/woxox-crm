'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem,
} from '@mui/material';
import { toast } from 'react-toastify';
import whatsappApi from '@/utils/whatsappApi';

export default function WhatsAppBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', messageType: 'text', message: '', sendNow: false });
  const [previewCount, setPreviewCount] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, tRes] = await Promise.all([
        whatsappApi.getBroadcasts(),
        whatsappApi.getTemplates(),
      ]);
      setBroadcasts(bRes.data?.data || []);
      setTemplates(tRes.data?.data || []);
    } catch {
      toast.error('Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const res = await whatsappApi.previewBroadcast({});
      setPreviewCount(res.data?.data?.count);
    } catch {
      toast.error('Preview failed');
    }
  };

  const handleCreate = async () => {
    try {
      await whatsappApi.createBroadcast(form);
      toast.success('Broadcast created');
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create broadcast');
    }
  };

  const statusColor = (s) => {
    const map = { completed: 'success', processing: 'info', failed: 'error', scheduled: 'warning' };
    return map[s] || 'default';
  };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">WhatsApp Broadcasts</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)} startIcon={<i className="ri-megaphone-line" />}>
          New Broadcast
        </Button>
      </Box>

      <Card variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent</TableCell>
              <TableCell>Delivered</TableCell>
              <TableCell>Read</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {broadcasts.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No broadcasts yet</TableCell></TableRow>
            ) : (
              broadcasts.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>{b.recipientCount}</TableCell>
                  <TableCell><Chip label={b.status} size="small" color={statusColor(b.status)} /></TableCell>
                  <TableCell>{b.stats?.sent ?? 0}</TableCell>
                  <TableCell>{b.stats?.delivered ?? 0}</TableCell>
                  <TableCell>{b.stats?.read ?? 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Broadcast</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Broadcast Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Message Type" value={form.messageType} onChange={(e) => setForm({ ...form, messageType: e.target.value })}>
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="template">Template</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </Grid>
            {previewCount !== null && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">{previewCount} recipients match filters</Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreview}>Preview Recipients</Button>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Send Now</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
