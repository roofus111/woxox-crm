'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Switch, FormControlLabel, TextField, Button, Divider,
  Tabs, Tab, Chip, Alert,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const EMPTY_CREDENTIALS = {
  google: { enabled: false, clientId: '', clientSecret: '' },
  microsoft: { enabled: false, clientId: '', clientSecret: '', tenantId: 'common' },
  smtp: { enabled: false, host: '', port: 587, secure: false, username: '', password: '', fromEmail: '', fromName: '' },
  sendgrid: { enabled: false, apiKey: '' },
  mailgun: { enabled: false, apiKey: '', domain: '', region: 'us' },
  amazonSes: { enabled: false, accessKey: '', secretKey: '', region: 'us-east-1' },
  brevo: { enabled: false, apiKey: '' },
  postmark: { enabled: false, apiKey: '' },
  s3: { enabled: false, accessKey: '', secretKey: '', bucket: '', region: 'us-east-1' },
};

function CredentialSection({ title, enabled, onToggle, children, configured }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: enabled ? 2 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
          {configured && <Chip label="Configured" size="small" color="success" />}
        </Box>
        <FormControlLabel control={<Switch checked={enabled} onChange={(e) => onToggle(e.target.checked)} />} label="Enabled" />
      </Box>
      {enabled && children}
    </Paper>
  );
}

function SecretField({ label, value, onChange, configured, placeholder }) {
  return (
    <TextField
      fullWidth
      size="small"
      type="password"
      label={label}
      value={value}
      onChange={onChange}
      placeholder={configured ? 'Leave blank to keep existing' : placeholder || 'Enter secret'}
      helperText={configured ? 'Secret is saved. Enter a new value only to replace it.' : ''}
      sx={{ mb: 2 }}
    />
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    emailApi.getSettings()
      .then((res) => {
        const data = res.data.data;
        setSettings({
          ...data,
          credentials: { ...EMPTY_CREDENTIALS, ...(data.credentials || {}) },
        });
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await emailApi.updateSettings(settings);
      const data = res.data.data;
      setSettings({
        ...data,
        credentials: { ...EMPTY_CREDENTIALS, ...(data.credentials || {}) },
      });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setSettings({ ...settings, [key]: value });
  const updateNotification = (key, value) => setSettings({ ...settings, notifications: { ...settings.notifications, [key]: value } });
  const updateCred = (provider, key, value) => setSettings({
    ...settings,
    credentials: {
      ...settings.credentials,
      [provider]: { ...settings.credentials[provider], [key]: value },
    },
  });
  const toggleCred = (provider, enabled) => updateCred(provider, 'enabled', enabled);

  if (loading || !settings) return null;

  const cred = settings.credentials || EMPTY_CREDENTIALS;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Email Settings</Typography>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="General" />
        <Tab label="Provider Credentials" />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Defaults</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField fullWidth label="Default From Name" value={settings.defaultFromName || ''} onChange={(e) => update('defaultFromName', e.target.value)} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Default From Email" value={settings.defaultFromEmail || ''} onChange={(e) => update('defaultFromEmail', e.target.value)} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Default Reply To" value={settings.defaultReplyTo || ''} onChange={(e) => update('defaultReplyTo', e.target.value)} /></Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Tracking</Typography>
          <FormControlLabel control={<Switch checked={!!settings.trackingEnabled} onChange={(e) => update('trackingEnabled', e.target.checked)} />} label="Enable Tracking" />
          <FormControlLabel control={<Switch checked={!!settings.openTracking} onChange={(e) => update('openTracking', e.target.checked)} />} label="Open Tracking" />
          <FormControlLabel control={<Switch checked={!!settings.clickTracking} onChange={(e) => update('clickTracking', e.target.checked)} />} label="Click Tracking" />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Workflow</Typography>
          <FormControlLabel control={<Switch checked={!!settings.approvalRequired} onChange={(e) => update('approvalRequired', e.target.checked)} />} label="Require Approval Before Send" />
          <TextField fullWidth type="number" label="Rate Limit Per Hour" sx={{ mt: 2, maxWidth: 300 }} value={settings.rateLimitPerHour || 500} onChange={(e) => update('rateLimitPerHour', parseInt(e.target.value, 10))} />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Notifications</Typography>
          {Object.keys(settings.notifications || {}).map((key) => (
            <FormControlLabel key={key} control={<Switch checked={!!settings.notifications[key]} onChange={(e) => updateNotification(key, e.target.checked)} />} label={key.replace(/([A-Z])/g, ' $1')} />
          ))}
        </Paper>
      )}

      {tab === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Credentials are stored encrypted per company in the database. Leave secret fields blank to keep existing values.
          </Alert>

          <CredentialSection title="Google OAuth (Gmail)" enabled={!!cred.google?.enabled} onToggle={(v) => toggleCred('google', v)} configured={cred.google?.clientSecretConfigured}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Client ID" value={cred.google?.clientId || ''} onChange={(e) => updateCred('google', 'clientId', e.target.value)} /></Grid>
              <Grid item xs={12} md={6}>
                <SecretField label="Client Secret" value={cred.google?.clientSecret || ''} onChange={(e) => updateCred('google', 'clientSecret', e.target.value)} configured={cred.google?.clientSecretConfigured} />
              </Grid>
            </Grid>
          </CredentialSection>

          <CredentialSection title="Microsoft 365 OAuth" enabled={!!cred.microsoft?.enabled} onToggle={(v) => toggleCred('microsoft', v)} configured={cred.microsoft?.clientSecretConfigured}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Client ID" value={cred.microsoft?.clientId || ''} onChange={(e) => updateCred('microsoft', 'clientId', e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Tenant ID" value={cred.microsoft?.tenantId || 'common'} onChange={(e) => updateCred('microsoft', 'tenantId', e.target.value)} helperText="Use common for multi-tenant" /></Grid>
              <Grid item xs={12} md={4}>
                <SecretField label="Client Secret" value={cred.microsoft?.clientSecret || ''} onChange={(e) => updateCred('microsoft', 'clientSecret', e.target.value)} configured={cred.microsoft?.clientSecretConfigured} />
              </Grid>
            </Grid>
          </CredentialSection>

          <CredentialSection title="Default SMTP" enabled={!!cred.smtp?.enabled} onToggle={(v) => toggleCred('smtp', v)} configured={cred.smtp?.passwordConfigured}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Host" value={cred.smtp?.host || ''} onChange={(e) => updateCred('smtp', 'host', e.target.value)} /></Grid>
              <Grid item xs={6} md={2}><TextField fullWidth size="small" type="number" label="Port" value={cred.smtp?.port || 587} onChange={(e) => updateCred('smtp', 'port', parseInt(e.target.value, 10))} /></Grid>
              <Grid item xs={6} md={2}><FormControlLabel control={<Switch checked={!!cred.smtp?.secure} onChange={(e) => updateCred('smtp', 'secure', e.target.checked)} />} label="SSL/TLS" /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Username" value={cred.smtp?.username || ''} onChange={(e) => updateCred('smtp', 'username', e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><SecretField label="Password" value={cred.smtp?.password || ''} onChange={(e) => updateCred('smtp', 'password', e.target.value)} configured={cred.smtp?.passwordConfigured} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="From Email" value={cred.smtp?.fromEmail || ''} onChange={(e) => updateCred('smtp', 'fromEmail', e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="From Name" value={cred.smtp?.fromName || ''} onChange={(e) => updateCred('smtp', 'fromName', e.target.value)} /></Grid>
            </Grid>
          </CredentialSection>

          <CredentialSection title="SendGrid" enabled={!!cred.sendgrid?.enabled} onToggle={(v) => toggleCred('sendgrid', v)} configured={cred.sendgrid?.apiKeyConfigured}>
            <SecretField label="API Key" value={cred.sendgrid?.apiKey || ''} onChange={(e) => updateCred('sendgrid', 'apiKey', e.target.value)} configured={cred.sendgrid?.apiKeyConfigured} />
          </CredentialSection>

          <CredentialSection title="Mailgun" enabled={!!cred.mailgun?.enabled} onToggle={(v) => toggleCred('mailgun', v)} configured={cred.mailgun?.apiKeyConfigured}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><SecretField label="API Key" value={cred.mailgun?.apiKey || ''} onChange={(e) => updateCred('mailgun', 'apiKey', e.target.value)} configured={cred.mailgun?.apiKeyConfigured} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Domain" value={cred.mailgun?.domain || ''} onChange={(e) => updateCred('mailgun', 'domain', e.target.value)} sx={{ mb: 2 }} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Region" value={cred.mailgun?.region || 'us'} onChange={(e) => updateCred('mailgun', 'region', e.target.value)} sx={{ mb: 2 }} /></Grid>
            </Grid>
          </CredentialSection>

          <CredentialSection title="Amazon SES" enabled={!!cred.amazonSes?.enabled} onToggle={(v) => toggleCred('amazonSes', v)} configured={cred.amazonSes?.accessKeyConfigured}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><SecretField label="Access Key" value={cred.amazonSes?.accessKey || ''} onChange={(e) => updateCred('amazonSes', 'accessKey', e.target.value)} configured={cred.amazonSes?.accessKeyConfigured} /></Grid>
              <Grid item xs={12} md={4}><SecretField label="Secret Key" value={cred.amazonSes?.secretKey || ''} onChange={(e) => updateCred('amazonSes', 'secretKey', e.target.value)} configured={cred.amazonSes?.secretKeyConfigured} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Region" value={cred.amazonSes?.region || 'us-east-1'} onChange={(e) => updateCred('amazonSes', 'region', e.target.value)} /></Grid>
            </Grid>
          </CredentialSection>

          <CredentialSection title="AWS S3 (Attachments)" enabled={!!cred.s3?.enabled} onToggle={(v) => toggleCred('s3', v)} configured={cred.s3?.accessKeyConfigured}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><SecretField label="Access Key" value={cred.s3?.accessKey || ''} onChange={(e) => updateCred('s3', 'accessKey', e.target.value)} configured={cred.s3?.accessKeyConfigured} /></Grid>
              <Grid item xs={12} md={3}><SecretField label="Secret Key" value={cred.s3?.secretKey || ''} onChange={(e) => updateCred('s3', 'secretKey', e.target.value)} configured={cred.s3?.secretKeyConfigured} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Bucket" value={cred.s3?.bucket || ''} onChange={(e) => updateCred('s3', 'bucket', e.target.value)} sx={{ mb: 2 }} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Region" value={cred.s3?.region || 'us-east-1'} onChange={(e) => updateCred('s3', 'region', e.target.value)} sx={{ mb: 2 }} /></Grid>
            </Grid>
          </CredentialSection>

          {settings.credentialsConfiguredAt && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(settings.credentialsConfiguredAt).toLocaleString()}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
