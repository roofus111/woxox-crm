'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Box, Typography, List, ListItem, ListItemText, IconButton, Skeleton, Button,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function DraftsPage() {
  const params = useParams();
  const locale = params.lang;
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    try {
      const res = await emailApi.getDrafts({});
      setDrafts(res.data?.data || []);
    } catch {
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrafts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft?')) return;
    try {
      await emailApi.deleteDraft(id);
      toast.success('Draft deleted');
      fetchDrafts();
    } catch {
      toast.error('Failed to delete draft');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Drafts</Typography>
        <Button variant="contained" component={Link} href={`/${locale}/manager/email/compose`}>Compose</Button>
      </Box>
      <List>
        {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={60} sx={{ mb: 1 }} />) :
          drafts.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No drafts saved</Typography>
          ) : drafts.map((d) => (
            <ListItem
              key={d._id}
              divider
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {d.lastAutosavedAt ? new Date(d.lastAutosavedAt).toLocaleString() : ''}
                  </Typography>
                  <Button size="small" component={Link} href={`/${locale}/manager/email/compose?draftId=${d._id}`}>Edit</Button>
                  <IconButton size="small" color="error" onClick={() => handleDelete(d._id)} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={d.subject || '(No subject)'} secondary={d.to?.map((t) => t.email).join(', ') || 'No recipients'} />
            </ListItem>
          ))}
      </List>
    </Box>
  );
}
