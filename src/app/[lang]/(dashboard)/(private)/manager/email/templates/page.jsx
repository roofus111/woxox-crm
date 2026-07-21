'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Skeleton, TextField,
  InputAdornment, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const CATEGORIES = ['Welcome', 'Study Abroad', 'Offer Letter', 'Visa Approved', 'Newsletter', 'Promotion', 'Birthday', 'Custom'];

export default function TemplatesPage() {
  const params = useParams();
  const locale = params.lang;
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [seedDialog, setSeedDialog] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await emailApi.getTemplates({ search: search || undefined, category: category || undefined });
      setTemplates(res.data?.data || []);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, [search, category]);

  const handleSeed = async () => {
    try {
      const res = await emailApi.seedTemplates();
      toast.success(`Seeded ${res.data.data.seeded} templates`);
      setSeedDialog(false);
      fetchTemplates();
    } catch {
      toast.error('Failed to seed templates');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await emailApi.duplicateTemplate(id);
      toast.success('Template duplicated');
      fetchTemplates();
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await emailApi.deleteTemplate(id);
      toast.success('Template deleted');
      fetchTemplates();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Email Templates</Typography>
          <Typography color="text.secondary">Prebuilt and custom templates for your campaigns</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setSeedDialog(true)}>Load Library</Button>
          <Button variant="contained" component={Link} href={`/${locale}/manager/email/templates/new`} startIcon={<i className="ri-add-line" />}>
            New Template
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField size="small" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><i className="ri-search-line" /></InputAdornment> }}
        />
        <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">All Categories</MenuItem>
          {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Box>

      <Grid container spacing={2}>
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}><Skeleton variant="rounded" height={200} /></Grid>
        )) : templates.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={t.category} size="small" />
                  <Chip label={t.status} size="small" variant="outlined" />
                </Box>
                <Typography variant="h6" gutterBottom noWrap>{t.name}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{t.subject}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} href={`/${locale}/manager/email/templates/${t._id}`}>Edit</Button>
                <IconButton size="small" onClick={() => handleDuplicate(t._id)}><i className="ri-file-copy-line" /></IconButton>
                <IconButton size="small" onClick={() => handleDelete(t._id)}><i className="ri-delete-bin-line" /></IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={seedDialog} onClose={() => setSeedDialog(false)}>
        <DialogTitle>Load Template Library</DialogTitle>
        <DialogContent>
          <Typography>This will add prebuilt templates for Welcome, Study Abroad, Offer Letter, Visa Approved, and more.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeedDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSeed}>Load Templates</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
