'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem,
} from '@mui/material';
import { toast } from 'react-toastify';
import whatsappApi from '@/utils/whatsappApi';

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', body: '', category: 'UTILITY', language: 'en' });

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await whatsappApi.getTemplates();
      setTemplates(res.data?.data || []);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await whatsappApi.syncTemplates();
      toast.success('Templates synced from Meta');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async () => {
    try {
      await whatsappApi.createTemplate(form);
      toast.success('Template created');
      setDialogOpen(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create template');
    }
  };

  const statusColor = (s) => {
    const map = { approved: 'success', rejected: 'error', submitted: 'info', draft: 'default', disabled: 'warning' };
    return map[s] || 'default';
  };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">WhatsApp Templates</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync from Meta'}
          </Button>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>Create Template</Button>
        </Box>
      </Box>

      <Card variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Preview</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No templates yet</TableCell></TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.language}</TableCell>
                  <TableCell><Chip label={t.status} size="small" color={statusColor(t.status)} /></TableCell>
                  <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{t.body}</Typography></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <MenuItem value="MARKETING">Marketing</MenuItem>
                <MenuItem value="UTILITY">Utility</MenuItem>
                <MenuItem value="AUTHENTICATION">Authentication</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Body (use {{1}} for variables)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
