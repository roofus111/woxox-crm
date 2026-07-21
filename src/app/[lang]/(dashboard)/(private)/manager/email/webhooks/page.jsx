'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormGroup, FormControlLabel, Checkbox, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const EVENTS = ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'spam', 'unsubscribed'];

const defaultForm = () => ({ name: '', url: '', events: ['sent', 'opened'], isActive: true });

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm());

  const fetchWebhooks = async () => {
    try {
      const res = await emailApi.getWebhooks();
      setWebhooks(res.data?.data || []);
    } catch {
      toast.error('Failed to load webhooks');
    }
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const toggleEvent = (event) => {
    const events = form.events.includes(event) ? form.events.filter((e) => e !== event) : [...form.events, event];
    setForm({ ...form, events });
  };

  const handleCreate = async () => {
    try {
      await emailApi.createWebhook(form);
      toast.success('Webhook created');
      setOpen(false);
      setForm(defaultForm());
      fetchWebhooks();
    } catch {
      toast.error('Failed to create webhook');
    }
  };

  const openEdit = (wh) => {
    setEditingId(wh._id);
    setForm({ name: wh.name, url: wh.url, events: wh.events || [], isActive: wh.isActive !== false });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await emailApi.updateWebhook(editingId, form);
      toast.success('Webhook updated');
      setEditOpen(false);
      fetchWebhooks();
    } catch {
      toast.error('Failed to update webhook');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await emailApi.deleteWebhook(id);
      toast.success('Webhook deleted');
      fetchWebhooks();
    } catch {
      toast.error('Failed to delete webhook');
    }
  };

  const WebhookForm = () => (
    <>
      <TextField fullWidth label="Name" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <TextField fullWidth label="URL" sx={{ mb: 2 }} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      <FormGroup>
        {EVENTS.map((e) => (
          <FormControlLabel key={e} control={<Checkbox checked={form.events.includes(e)} onChange={() => toggleEvent(e)} />} label={e} />
        ))}
      </FormGroup>
      <FormControlLabel
        control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
        label="Active"
        sx={{ mt: 1 }}
      />
    </>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Webhooks</Typography>
        <Button variant="contained" onClick={() => { setForm(defaultForm()); setOpen(true); }}>Add Webhook</Button>
      </Box>
      <Grid container spacing={2}>
        {webhooks.map((wh) => (
          <Grid item xs={12} md={6} key={wh._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{wh.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{wh.url}</Typography>
                <Box sx={{ mt: 1 }}>{wh.events?.map((e) => <Chip key={e} label={e} size="small" sx={{ mr: 0.5 }} />)}</Box>
                <Chip label={wh.isActive ? 'Active' : 'Inactive'} size="small" color={wh.isActive ? 'success' : 'default'} sx={{ mt: 1 }} />
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => openEdit(wh)}>Edit</Button>
                <IconButton size="small" color="error" onClick={() => handleDelete(wh._id)} title="Delete">
                  <i className="ri-delete-bin-line" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Webhook</DialogTitle>
        <DialogContent><WebhookForm /></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Webhook</DialogTitle>
        <DialogContent><WebhookForm /></DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
