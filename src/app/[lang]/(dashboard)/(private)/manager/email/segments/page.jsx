'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const SEGMENT_FIELDS = [
  { value: 'leadStatus', label: 'Lead Status' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'university', label: 'University' },
  { value: 'intake', label: 'Intake' },
  { value: 'leadSource', label: 'Lead Source' },
  { value: 'visaStatus', label: 'Visa Status' },
];

const defaultRules = () => [{ field: 'leadStatus', operator: 'equals', value: 'New' }];

export default function SegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [rules, setRules] = useState(defaultRules());
  const [preview, setPreview] = useState(null);

  const fetchSegments = async () => {
    try {
      const res = await emailApi.getSegments({});
      setSegments(res.data?.data || []);
    } catch {
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSegments(); }, []);

  const resetForm = () => {
    setName('');
    setRules(defaultRules());
    setPreview(null);
    setEditingId(null);
  };

  const handlePreview = async () => {
    try {
      const res = await emailApi.previewSegment(rules);
      setPreview(res.data.data);
    } catch {
      toast.error('Preview failed');
    }
  };

  const handleCreate = async () => {
    try {
      await emailApi.createSegment({ name, rules });
      toast.success('Segment created');
      setOpen(false);
      resetForm();
      fetchSegments();
    } catch {
      toast.error('Failed to create segment');
    }
  };

  const openEdit = (segment) => {
    setEditingId(segment._id);
    setName(segment.name || '');
    setRules(segment.rules?.length ? segment.rules : defaultRules());
    setPreview(null);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await emailApi.updateSegment(editingId, { name, rules });
      toast.success('Segment updated');
      setEditOpen(false);
      resetForm();
      fetchSegments();
    } catch {
      toast.error('Failed to update segment');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this segment?')) return;
    try {
      await emailApi.deleteSegment(id);
      toast.success('Segment deleted');
      fetchSegments();
    } catch {
      toast.error('Failed to delete segment');
    }
  };

  const RulesEditor = () => (
    <>
      {rules.map((rule, i) => (
        <Grid container spacing={1} key={i} sx={{ mb: 1 }}>
          <Grid item xs={4}>
            <TextField fullWidth select size="small" value={rule.field} onChange={(e) => {
              const updated = [...rules]; updated[i].field = e.target.value; setRules(updated);
            }}>
              {SEGMENT_FIELDS.map((f) => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth select size="small" value={rule.operator} onChange={(e) => {
              const updated = [...rules]; updated[i].operator = e.target.value; setRules(updated);
            }}>
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="in">In</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={5}>
            <TextField fullWidth size="small" value={rule.value} onChange={(e) => {
              const updated = [...rules]; updated[i].value = e.target.value; setRules(updated);
            }} />
          </Grid>
        </Grid>
      ))}
      <Button size="small" onClick={handlePreview}>Preview Count</Button>
      {preview && <Typography variant="body2" sx={{ mt: 1 }}>{preview.count} contacts match</Typography>}
    </>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Segments</Typography>
        <Button variant="contained" onClick={() => { resetForm(); setOpen(true); }} startIcon={<i className="ri-add-line" />}>New Segment</Button>
      </Box>
      <Grid container spacing={2}>
        {loading ? Array.from({ length: 3 }).map((_, i) => <Grid item xs={12} md={4} key={i}><Skeleton height={100} /></Grid>) :
          segments.map((s) => (
            <Grid item xs={12} md={4} key={s._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.estimatedCount || 0} estimated contacts</Typography>
                  <Box sx={{ mt: 1 }}>{s.rules?.map((r, i) => <Chip key={i} label={`${r.field} ${r.operator} ${r.value}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}</Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => openEdit(s)}>Edit</Button>
                  <IconButton size="small" color="error" onClick={() => handleDelete(s._id)} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Segment</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" sx={{ mt: 1, mb: 2 }} value={name} onChange={(e) => setName(e.target.value)} />
          <RulesEditor />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Segment</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" sx={{ mt: 1, mb: 2 }} value={name} onChange={(e) => setName(e.target.value)} />
          <RulesEditor />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
