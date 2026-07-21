'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, MenuItem } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function NewTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Custom');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('<h1>{{FirstName | default:"Student"}}</h1><p>Your personalized content here...</p>');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) return toast.error('Name is required');
    try {
      setSaving(true);
      const res = await emailApi.createTemplate({ name, category, subject, htmlContent, status: 'draft' });
      toast.success('Template created');
      router.push(`/${params.lang}/manager/email/templates/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>New Template</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Template Name" value={name} onChange={(e) => setName(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Welcome', 'Study Abroad', 'Offer Letter', 'Newsletter', 'Promotion', 'Custom'].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}><TextField fullWidth label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} helperText="Use merge tags like {{FirstName}}" /></Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={12} label="HTML Content" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>Create Template</Button>
            <Button sx={{ ml: 1 }} onClick={() => router.back()}>Cancel</Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
