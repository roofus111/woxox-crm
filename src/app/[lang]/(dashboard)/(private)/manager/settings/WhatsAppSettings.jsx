'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Switch, FormControlLabel,
  Grid, Card, CardContent, Chip, CircularProgress, Alert, MenuItem,
  Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import whatsappApi from '@/utils/whatsappApi';

const WhatsAppSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    metaAppId: '',
    metaAppSecret: '',
    businessAccountId: '',
    phoneNumberId: '',
    accessToken: '',
    verifyToken: '',
    webhookUrl: '',
    defaultCountryCode: '91',
    autoLeadCreation: true,
    autoAssignment: false,
    assignmentMode: 'manual',
    defaultAgent: '',
  });
  const [status, setStatus] = useState({ webhookStatus: 'pending', apiConnectionStatus: 'unknown' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await whatsappApi.getSettings();
      if (res.data?.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
        setStatus({
          webhookStatus: res.data.data.webhookStatus || 'pending',
          apiConnectionStatus: res.data.data.apiConnectionStatus || 'unknown',
        });
      }
    } catch (err) {
      toast.error('Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/webhook`;
      const res = await whatsappApi.updateSettings({ ...settings, webhookUrl });
      toast.success('WhatsApp settings saved');
      if (res.data?.data) {
        setStatus({
          webhookStatus: res.data.data.webhookStatus,
          apiConnectionStatus: res.data.data.apiConnectionStatus,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      await whatsappApi.testConnection();
      toast.success('API connection successful');
      setStatus((prev) => ({ ...prev, apiConnectionStatus: 'connected' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection test failed');
      setStatus((prev) => ({ ...prev, apiConnectionStatus: 'error' }));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  const statusColor = (s) => {
    if (s === 'connected' || s === 'verified') return 'success';
    if (s === 'error' || s === 'failed') return 'error';
    return 'warning';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>WhatsApp Business Settings</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Configure Meta WhatsApp Business Cloud API credentials and automation preferences.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Webhook Status</Typography>
              <Chip label={status.webhookStatus} color={statusColor(status.webhookStatus)} size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">API Connection</Typography>
              <Chip label={status.apiConnectionStatus} color={statusColor(status.apiConnectionStatus)} size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        Webhook URL: <strong>{process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/webhook</strong>
        <br />
        Register this URL in Meta Developer Console with your Verify Token.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Meta App ID" value={settings.metaAppId || ''} onChange={handleChange('metaAppId')} margin="normal" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="App Secret" type="password" value={settings.metaAppSecret || ''} onChange={handleChange('metaAppSecret')} margin="normal" helperText="Leave blank to keep existing" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Business Account ID" value={settings.businessAccountId || ''} onChange={handleChange('businessAccountId')} margin="normal" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Phone Number ID" value={settings.phoneNumberId || ''} onChange={handleChange('phoneNumberId')} margin="normal" />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Access Token" type="password" value={settings.accessToken || ''} onChange={handleChange('accessToken')} margin="normal" helperText="Permanent or long-lived token from Meta" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Verify Token" value={settings.verifyToken || ''} onChange={handleChange('verifyToken')} margin="normal" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Default Country Code" value={settings.defaultCountryCode || '91'} onChange={handleChange('defaultCountryCode')} margin="normal" />
        </Grid>

        <Grid item xs={12}><Divider /></Grid>

        <Grid item xs={12} md={4}>
          <FormControlLabel control={<Switch checked={settings.autoLeadCreation} onChange={handleChange('autoLeadCreation')} />} label="Auto Lead Creation" />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControlLabel control={<Switch checked={settings.autoAssignment} onChange={handleChange('autoAssignment')} />} label="Auto Assignment" />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth select label="Assignment Mode" value={settings.assignmentMode || 'manual'} onChange={handleChange('assignmentMode')} margin="normal">
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="round_robin">Round Robin</MenuItem>
            <MenuItem value="department">Department</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outlined" onClick={handleTest} disabled={testing}>
          {testing ? 'Testing...' : 'Test API Connection'}
        </Button>
      </Box>
    </Box>
  );
};

export default WhatsAppSettings;
