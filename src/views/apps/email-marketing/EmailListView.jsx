'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, List, ListItemButton, ListItemText,
  InputAdornment, Skeleton, Chip, Paper, Divider, CircularProgress, Button, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function EmailListView({ folder, title, emptyIcon = 'ri-mail-line', emptyText = 'No emails found' }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const params = { search: search || undefined, limit: 50 };
      if (folder === 'scheduled') params.status = 'scheduled';
      else params.folder = folder;
      const res = await emailApi.getEmails(params);
      setEmails(res.data?.data || []);
    } catch {
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, [folder, search]);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const openEmail = async (id) => {
    setSelected(id);
    setLoadingDetail(true);
    try {
      const res = await emailApi.getEmail(id);
      setDetail(res.data.data);
      if (!res.data.data.isRead) await emailApi.updateEmailFlags(id, { isRead: true });
    } catch {
      toast.error('Failed to load email');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleArchive = async () => {
    if (!selected) return;
    try {
      await emailApi.updateEmailFlags(selected, { folder: 'archive' });
      toast.success('Email archived');
      setSelected(null);
      setDetail(null);
      fetchEmails();
    } catch {
      toast.error('Failed to archive email');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm('Move this email to trash?')) return;
    try {
      await emailApi.deleteEmail(selected);
      toast.success('Email moved to trash');
      setSelected(null);
      setDetail(null);
      fetchEmails();
    } catch {
      toast.error('Failed to delete email');
    }
  };

  return (
    <Box>
      {title && <Typography variant="h4" fontWeight={700} gutterBottom>{title}</Typography>}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 220px)', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ width: 380, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth size="small" placeholder="Search emails..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEmails()}
              InputProps={{ startAdornment: <InputAdornment position="start"><i className="ri-search-line" /></InputAdornment> }}
            />
          </Box>
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <ListItemButton key={i}><Skeleton width="100%" height={60} /></ListItemButton>
            )) : emails.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <i className={emptyIcon} style={{ fontSize: 48, color: '#ccc' }} />
                <Typography color="text.secondary" sx={{ mt: 1 }}>{emptyText}</Typography>
              </Box>
            ) : emails.map((email) => (
              <ListItemButton key={email._id} selected={selected === email._id} onClick={() => openEmail(email._id)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <ListItemText
                  primary={<Typography variant="subtitle2" noWrap fontWeight={email.isRead ? 400 : 700}>{email.subject || '(No subject)'}</Typography>}
                  secondary={`${email.contactEmail || email.to?.[0]?.email} · ${new Date(email.createdAt).toLocaleDateString()}`}
                />
                <Chip label={email.status} size="small" />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {!selected ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <i className="ri-mail-open-line" style={{ fontSize: 64, color: '#ccc' }} />
              <Typography color="text.secondary" sx={{ mt: 2 }}>Select an email to read</Typography>
            </Box>
          ) : loadingDetail ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : detail && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5">{detail.subject}</Typography>
                <Box>
                  {folder !== 'archive' && (
                    <Button size="small" onClick={handleArchive} startIcon={<i className="ri-archive-line" />}>Archive</Button>
                  )}
                  <IconButton size="small" color="error" onClick={handleDelete} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">From: {detail.from?.email}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>To: {detail.to?.map((t) => t.email).join(', ')}</Typography>
              <Divider sx={{ my: 2 }} />
              <Box dangerouslySetInnerHTML={{ __html: detail.htmlContent || '' }} />
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
