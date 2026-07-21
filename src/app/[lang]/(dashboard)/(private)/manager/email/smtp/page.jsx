'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Switch, FormControlLabel, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';

const PROVIDERS = [
  { value: 'smtp', label: 'Custom SMTP' },
  { value: 'gmail_oauth', label: 'Gmail OAuth' },
  { value: 'office365', label: 'Microsoft 365' },
  { value: 'amazon_ses', label: 'Amazon SES' },
  { value: 'mailgun', label: 'Mailgun' },
  { value: 'sendgrid', label: 'SendGrid' },
  { value: 'brevo', label: 'Brevo' },
  { value: 'postmark', label: 'Postmark' },
];

export default function SmtpPage() {
  const params = useParams();
  const locale = params.lang;
  const [accounts, setAccounts] = useState([]);
  const [imapStatus, setImapStatus] = useState([]);
  const [oauthUrls, setOauthUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const defaultForm = { name: '', provider: 'smtp', fromEmail: '', fromName: '', host: 'smtp.gmail.com', port: 587, username: '', password: '', isDefault: true, dailyLimit: 1000 };
  const [form, setForm] = useState(defaultForm);

  const fetchAccounts = async () => {
    try {
      const [accRes, imapRes, oauthRes] = await Promise.all([
        emailApi.getSmtpAccounts(),
        emailApi.getImapStatus().catch(() => ({ data: { data: [] } })),
        emailApi.getOAuthUrls().catch(() => ({ data: { data: {} } })),
      ]);
      setAccounts(accRes.data?.data || []);
      setImapStatus(imapRes.data?.data || []);
      setOauthUrls(oauthRes.data?.data || {});
    } catch {
      toast.error('Failed to load SMTP accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'success') toast.success('OAuth account connected successfully');
    if (params.get('oauth') === 'error') toast.error(params.get('message') || 'OAuth connection failed');
  }, []);

  const handleSync = async (accountId) => {
    try {
      setSyncing(accountId);
      const res = await emailApi.syncImap(accountId);
      toast.success(res.data?.message || 'Inbox sync completed');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleEnableImap = async (accountId) => {
    try {
      await emailApi.configureImap(accountId, { enabled: true });
      toast.success('IMAP sync enabled');
      fetchAccounts();
    } catch {
      toast.error('Failed to enable IMAP');
    }
  };

  const handleCreate = async () => {
    try {
      await emailApi.createSmtpAccount(form);
      toast.success('SMTP account added');
      setOpen(false);
      setForm(defaultForm);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add account');
    }
  };

  const openEdit = (acc) => {
    setEditingId(acc._id);
    setForm({
      name: acc.name || '',
      provider: acc.provider || 'smtp',
      fromEmail: acc.fromEmail || '',
      fromName: acc.fromName || '',
      host: acc.host || 'smtp.gmail.com',
      port: acc.port || 587,
      username: '',
      password: '',
      isDefault: acc.isDefault || false,
      dailyLimit: acc.dailyLimit || 1000,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.username) delete payload.username;
      await emailApi.updateSmtpAccount(editingId, payload);
      toast.success('SMTP account updated');
      setEditOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update account');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this SMTP account?')) return;
    try {
      await emailApi.deleteSmtpAccount(id);
      toast.success('SMTP account removed');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove account');
    }
  };

  const handleTest = async (id) => {
    try {
      await emailApi.testSmtpAccount(id);
      toast.success('Connection successful');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>SMTP Settings</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {oauthUrls.google && (
            <Button variant="outlined" href={oauthUrls.google} startIcon={<i className="ri-google-fill" style={{ color: '#EA4335' }} />}>
              Connect Gmail
            </Button>
          )}
          {oauthUrls.microsoft && (
            <Button variant="outlined" href={oauthUrls.microsoft} startIcon={<i className="ri-microsoft-fill" style={{ color: '#0078D4' }} />}>
              Connect Microsoft 365
            </Button>
          )}
          {!oauthUrls.googleConfigured && !oauthUrls.microsoftConfigured && (
            <Button variant="text" href={`/${locale}/manager/email/settings`}>
              Configure OAuth in Settings
            </Button>
          )}
          <Button variant="contained" onClick={() => setOpen(true)} startIcon={<i className="ri-add-line" />}>Add Account</Button>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {loading ? Array.from({ length: 2 }).map((_, i) => <Grid item xs={12} md={6} key={i}><Skeleton height={160} /></Grid>) :
          accounts.map((acc) => (
            <Grid item xs={12} md={6} key={acc._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{acc.name}</Typography>
                    {acc.isDefault && <Chip label="Default" size="small" color="primary" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary">{PROVIDERS.find((p) => p.value === acc.provider)?.label || acc.provider}</Typography>
                  <Typography variant="body2">{acc.fromEmail}</Typography>
                  <Typography variant="caption">Sent today: {acc.sentToday}/{acc.dailyLimit}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={acc.lastTestStatus || 'pending'} size="small" color={acc.lastTestStatus === 'success' ? 'success' : 'default'} />
                    {acc.imap?.enabled && <Chip label="IMAP On" size="small" color="info" sx={{ ml: 0.5 }} />}
                  </Box>
                  {imapStatus.find((s) => s._id === acc._id) && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Last sync: {imapStatus.find((s) => s._id === acc._id)?.lastSyncAt
                        ? new Date(imapStatus.find((s) => s._id === acc._id).lastSyncAt).toLocaleString()
                        : 'Never'}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleTest(acc._id)}>Test Connection</Button>
                  <Button size="small" onClick={() => openEdit(acc)}>Edit</Button>
                  {!acc.imap?.enabled ? (
                    <Button size="small" onClick={() => handleEnableImap(acc._id)}>Enable IMAP</Button>
                  ) : (
                    <Button size="small" onClick={() => handleSync(acc._id)} disabled={syncing === acc._id}>
                      {syncing === acc._id ? 'Syncing...' : 'Sync Inbox'}
                    </Button>
                  )}
                  <IconButton size="small" color="error" onClick={() => handleDelete(acc._id)} title="Remove">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add SMTP Account</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Account Name" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth select label="Provider" sx={{ mb: 2 }} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
            {PROVIDERS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="From Email" sx={{ mb: 2 }} value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} />
          <TextField fullWidth label="From Name" sx={{ mb: 2 }} value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
          {form.provider === 'smtp' && (
            <>
              <TextField fullWidth label="Host" sx={{ mb: 2 }} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
              <TextField fullWidth label="Port" type="number" sx={{ mb: 2 }} value={form.port} onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) })} />
              <TextField fullWidth label="Username" sx={{ mb: 2 }} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              <TextField fullWidth label="Password" type="password" sx={{ mb: 2 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </>
          )}
          {['sendgrid', 'mailgun', 'brevo', 'postmark', 'amazon_ses'].includes(form.provider) && (
            <TextField fullWidth label="API Key" type="password" sx={{ mb: 2 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value, apiKey: e.target.value })} />
          )}
          <TextField fullWidth label="Daily Limit" type="number" sx={{ mb: 2 }} value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: parseInt(e.target.value) })} />
          <FormControlLabel control={<Switch checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />} label="Set as default" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Add Account</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit SMTP Account</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Account Name" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth label="From Email" sx={{ mb: 2 }} value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} />
          <TextField fullWidth label="From Name" sx={{ mb: 2 }} value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
          {form.provider === 'smtp' && (
            <>
              <TextField fullWidth label="Host" sx={{ mb: 2 }} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
              <TextField fullWidth label="Port" type="number" sx={{ mb: 2 }} value={form.port} onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) })} />
              <TextField fullWidth label="Username" sx={{ mb: 2 }} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Leave blank to keep current" />
              <TextField fullWidth label="Password" type="password" sx={{ mb: 2 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current" />
            </>
          )}
          {['sendgrid', 'mailgun', 'brevo', 'postmark', 'amazon_ses'].includes(form.provider) && (
            <TextField fullWidth label="API Key" type="password" sx={{ mb: 2 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current" />
          )}
          <TextField fullWidth label="Daily Limit" type="number" sx={{ mb: 2 }} value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: parseInt(e.target.value) })} />
          <FormControlLabel control={<Switch checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />} label="Set as default" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
