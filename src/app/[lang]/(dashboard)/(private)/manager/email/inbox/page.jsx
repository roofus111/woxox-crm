'use client';

import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import EmailListView from '@/views/apps/email-marketing/EmailListView';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function InboxPage() {
  const [syncing, setSyncing] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    emailApi.getImapStatus().then((res) => setAccounts(res.data?.data?.filter((a) => a.imapEnabled) || [])).catch(() => {});
  }, []);

  const syncAll = async () => {
    if (accounts.length === 0) return toast.info('Enable IMAP on an SMTP account first');
    try {
      setSyncing(true);
      await Promise.all(accounts.map((a) => emailApi.syncImap(a._id)));
      toast.success('Inbox sync completed');
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Inbox</Typography>
        <Button variant="outlined" onClick={syncAll} disabled={syncing} startIcon={<i className="ri-refresh-line" />}>
          {syncing ? 'Syncing...' : 'Sync from IMAP'}
        </Button>
      </Box>
      <EmailListView folder="inbox" title="" emptyIcon="ri-inbox-line" emptyText="Your inbox is empty. Enable IMAP sync in SMTP Settings to import replies." />
    </Box>
  );
}
