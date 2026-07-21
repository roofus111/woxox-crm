'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const TRIGGERS = [
  'lead_created', 'lead_updated', 'application_submitted', 'visa_approved',
  'birthday', 'payment_pending', 'payment_received', 'lead_assigned', 'lead_lost',
];

export default function AutomationPage() {
  const params = useParams();
  const locale = params.lang;
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', trigger: 'lead_created' });

  const fetchAutomations = async () => {
    try {
      const res = await emailApi.getAutomations({});
      setAutomations(res.data?.data || []);
    } catch {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAutomations(); }, []);

  const handleCreate = async () => {
    try {
      const res = await emailApi.createAutomation({
        name: form.name,
        trigger: { type: form.trigger },
        steps: [{ type: 'send_email', config: { subject: 'Automated Email', htmlContent: '<p>Hello {{FirstName}}</p>' } }],
        flowData: { nodes: [], edges: [] },
      });
      toast.success('Automation created');
      setOpen(false);
      fetchAutomations();
      if (res.data?.data?._id) {
        window.location.href = `/${locale}/manager/email/automation/${res.data.data._id}`;
      }
    } catch {
      toast.error('Failed to create');
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await emailApi.updateAutomationStatus(id, status);
      toast.success(`Automation ${status}`);
      fetchAutomations();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this automation workflow?')) return;
    try {
      await emailApi.deleteAutomation(id);
      toast.success('Automation deleted');
      fetchAutomations();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Automation Workflows</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} startIcon={<i className="ri-add-line" />}>New Workflow</Button>
      </Box>
      <Grid container spacing={2}>
        {loading ? Array.from({ length: 3 }).map((_, i) => <Grid item xs={12} md={4} key={i}><Skeleton height={140} /></Grid>) :
          automations.map((a) => (
            <Grid item xs={12} md={4} key={a._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={a.trigger?.type?.replace(/_/g, ' ')} size="small" />
                    <Chip label={a.status} size="small" color={a.status === 'active' ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="h6">{a.name}</Typography>
                  <Typography variant="caption">Triggered: {a.stats?.triggered || 0} · Completed: {a.stats?.completed || 0}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} href={`/${locale}/manager/email/automation/${a._id}`}>Open Builder</Button>
                  {a.status !== 'active' && <Button size="small" onClick={() => toggleStatus(a._id, 'active')}>Activate</Button>}
                  {a.status === 'active' && <Button size="small" onClick={() => toggleStatus(a._id, 'paused')}>Pause</Button>}
                  <IconButton size="small" color="error" onClick={() => handleDelete(a._id)} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Automation</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth select label="Trigger" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
            {TRIGGERS.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
