'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function DomainsPage() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState('');

  const fetchDomains = async () => {
    try {
      const res = await emailApi.getDomains();
      setDomains(res.data?.data || []);
    } catch {
      toast.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDomains(); }, []);

  const handleAdd = async () => {
    try {
      await emailApi.addDomain(domain);
      toast.success('Domain added');
      setOpen(false);
      setDomain('');
      fetchDomains();
    } catch {
      toast.error('Failed to add domain');
    }
  };

  const handleVerify = async (id) => {
    try {
      await emailApi.verifyDomain(id);
      toast.success('Domain verified');
      fetchDomains();
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this domain?')) return;
    try {
      await emailApi.deleteDomain(id);
      toast.success('Domain deleted');
      fetchDomains();
    } catch {
      toast.error('Failed to delete domain');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Sender Domains</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} startIcon={<i className="ri-add-line" />}>Add Domain</Button>
      </Box>
      <Grid container spacing={2}>
        {loading ? Array.from({ length: 2 }).map((_, i) => <Grid item xs={12} key={i}><Skeleton height={200} /></Grid>) :
          domains.map((d) => (
            <Grid item xs={12} md={6} key={d._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{d.domain}</Typography>
                    <Chip label={d.status} size="small" color={d.status === 'verified' ? 'success' : 'warning'} />
                  </Box>
                  <Typography variant="body2" gutterBottom>Health Score</Typography>
                  <LinearProgress variant="determinate" value={d.healthScore || 0} sx={{ mb: 2, height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" display="block">SPF: {d.spf?.status || 'pending'} · DKIM: {d.dkim?.status || 'pending'} · DMARC: {d.dmarc?.status || 'pending'}</Typography>
                  {d.spf?.record && <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'monospace', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>{d.spf.record}</Typography>}
                </CardContent>
                <CardActions>
                  {d.status !== 'verified' && <Button size="small" onClick={() => handleVerify(d._id)}>Verify Domain</Button>}
                  <IconButton size="small" color="error" onClick={() => handleDelete(d._id)} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Sender Domain</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Domain" placeholder="yourdomain.com" sx={{ mt: 1 }} value={domain} onChange={(e) => setDomain(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
