'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, MenuItem, Chip } from '@mui/material';
import { useParams } from 'next/navigation';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function EditTemplatePage() {
  const params = useParams();
  const id = params.id;
  const [template, setTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      emailApi.getTemplate(id)
        .then((res) => setTemplate(res.data.data))
        .catch(() => toast.error('Failed to load template'));
    }
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await emailApi.updateTemplate(id, template);
      toast.success('Template saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await emailApi.updateTemplate(id, { ...template, status: 'published' });
      toast.success('Template published');
      setTemplate({ ...template, status: 'published' });
    } catch {
      toast.error('Failed to publish');
    }
  };

  if (!template) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{template.name}</Typography>
          <Chip label={template.status} size="small" sx={{ mt: 1 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handlePublish}>Publish</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
        </Box>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Name" value={template.name} onChange={(e) => setTemplate({ ...template, name: e.target.value })} /></Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Category" value={template.category} onChange={(e) => setTemplate({ ...template, category: e.target.value })}>
              {['Welcome', 'Study Abroad', 'Newsletter', 'Custom'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}><TextField fullWidth label="Subject" value={template.subject} onChange={(e) => setTemplate({ ...template, subject: e.target.value })} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Preheader" value={template.preheader || ''} onChange={(e) => setTemplate({ ...template, preheader: e.target.value })} /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline rows={16} label="HTML Content" value={template.htmlContent} onChange={(e) => setTemplate({ ...template, htmlContent: e.target.value })} /></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
