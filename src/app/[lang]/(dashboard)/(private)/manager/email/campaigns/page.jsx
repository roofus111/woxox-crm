'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Paper, IconButton,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function CampaignsPage() {
  const params = useParams();
  const locale = params.lang;
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'regular', subject: '', htmlContent: '<p>Campaign content</p>' });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await emailApi.getCampaigns({});
      setCampaigns(res.data?.data || []);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = async () => {
    try {
      await emailApi.createCampaign(form);
      toast.success('Campaign created');
      setCreateOpen(false);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleLaunch = async (id) => {
    if (!confirm('Launch this campaign?')) return;
    try {
      const res = await emailApi.launchCampaign(id);
      toast.success(res.data.data.abTest
        ? `A/B test started with ${res.data.data.recipientCount} test recipients`
        : `Campaign launched to ${res.data.data.recipientCount} recipients`);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to launch');
    }
  };

  const handleEvaluateWinner = async (id) => {
    try {
      const res = await emailApi.evaluateAbWinner(id);
      toast.success(`Winner variant ${res.data.data.winnerIndex + 1} selected. Sent to ${res.data.data.holdbackSent} remaining recipients.`);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to evaluate winner');
    }
  };

  const handleViewHeatmap = async (id) => {
    try {
      const res = await emailApi.getCampaignHeatmap(id);
      setHeatmapData({ campaignId: id, ...res.data.data });
      setHeatmapOpen(true);
    } catch {
      toast.error('Failed to load heatmap');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await emailApi.updateCampaignStatus(id, status);
      toast.success(`Campaign ${status}`);
      fetchCampaigns();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openEdit = (campaign) => {
    setEditingId(campaign._id);
    setForm({
      name: campaign.name || '',
      type: campaign.type || 'regular',
      subject: campaign.subject || '',
      htmlContent: campaign.htmlContent || '<p>Campaign content</p>',
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await emailApi.updateCampaign(editingId, form);
      toast.success('Campaign updated');
      setEditOpen(false);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await emailApi.deleteCampaign(id);
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const canEdit = (c) => ['draft', 'scheduled', 'paused'].includes(c.status);

  const statusColor = { draft: 'default', scheduled: 'info', sending: 'primary', completed: 'success', paused: 'warning', cancelled: 'error' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Campaigns</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)} startIcon={<i className="ri-add-line" />}>New Campaign</Button>
      </Box>

      <Grid container spacing={2}>
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} md={6} key={i}><Skeleton height={160} /></Grid>
        )) : campaigns.map((c) => (
          <Grid item xs={12} md={6} key={c._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={c.type} size="small" />
                  <Chip label={c.status} size="small" color={statusColor[c.status] || 'default'} />
                </Box>
                <Typography variant="h6">{c.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{c.subject}</Typography>
                <Typography variant="caption">Sent: {c.stats?.sent || 0} · Opened: {c.stats?.opened || 0} · Clicked: {c.stats?.clicked || 0}</Typography>
                {c.abTest?.enabled && (
                  <Typography variant="caption" display="block" color="primary">
                    A/B Phase: {c.abTest.phase || 'testing'}
                    {c.abTest.winnerVariantIndex != null && ` · Winner: Variant ${c.abTest.winnerVariantIndex + 1}`}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                {canEdit(c) && <Button size="small" onClick={() => openEdit(c)}>Edit</Button>}
                {c.status === 'draft' && <Button size="small" onClick={() => handleLaunch(c._id)}>Launch</Button>}
                {c.abTest?.enabled && c.abTest?.phase === 'testing' && (
                  <Button size="small" onClick={() => handleEvaluateWinner(c._id)}>Pick Winner</Button>
                )}
                {c.status === 'sending' && <Button size="small" onClick={() => handleStatus(c._id, 'paused')}>Pause</Button>}
                {c.status === 'paused' && <Button size="small" onClick={() => handleStatus(c._id, 'sending')}>Resume</Button>}
                <Button size="small" onClick={() => handleViewHeatmap(c._id)}>Heatmap</Button>
                <Button size="small" component={Link} href={`/${locale}/manager/email/analytics?campaign=${c._id}`}>Analytics</Button>
                {c.status !== 'sending' && (
                  <IconButton size="small" color="error" onClick={() => handleDelete(c._id)} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Campaign</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth select label="Type" sx={{ mb: 2 }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['regular', 'drip', 'newsletter', 'transactional', 'ab_test', 'recurring'].map((t) => (
              <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Subject" sx={{ mb: 2 }} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <TextField fullWidth multiline rows={4} label="HTML Content" value={form.htmlContent} onChange={(e) => setForm({ ...form, htmlContent: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Campaign</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth select label="Type" sx={{ mb: 2 }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['regular', 'drip', 'newsletter', 'transactional', 'ab_test', 'recurring'].map((t) => (
              <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Subject" sx={{ mb: 2 }} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <TextField fullWidth multiline rows={4} label="HTML Content" value={form.htmlContent} onChange={(e) => setForm({ ...form, htmlContent: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={heatmapOpen} onClose={() => setHeatmapOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Campaign Click Heatmap</DialogTitle>
        <DialogContent>
          {heatmapData && (
            <>
              <Typography variant="body2" gutterBottom>Total clicks: {heatmapData.totalClicks}</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {(heatmapData.zoneStats || []).map((z) => (
                  <Grid item xs={4} key={z._id}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: z._id === 'top' ? '#fee2e2' : z._id === 'middle' ? '#fef3c7' : '#dcfce7' }}>
                      <Typography variant="h5">{z.clicks}</Typography>
                      <Typography variant="caption">{z._id} zone</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {(heatmapData.linkStats || []).map((link) => (
                <Box key={link._id} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" noWrap>{link._id}</Typography>
                  <Typography variant="caption">{link.clicks} clicks</Typography>
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setHeatmapOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
