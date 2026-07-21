'use client';

import { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Skeleton, Chip, List, ListItem, ListItemText, Divider,
} from '@mui/material';
import dynamic from 'next/dynamic';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const STAT_CARDS = [
  { key: 'emailsSentToday', label: 'Sent Today', icon: 'ri-send-plane-fill', color: '#6366f1' },
  { key: 'emailsDelivered', label: 'Delivered', icon: 'ri-check-double-line', color: '#22c55e' },
  { key: 'openRate', label: 'Open Rate', icon: 'ri-eye-line', color: '#3b82f6', suffix: '%' },
  { key: 'clickRate', label: 'Click Rate', icon: 'ri-cursor-line', color: '#8b5cf6', suffix: '%' },
  { key: 'bounceRate', label: 'Bounce Rate', icon: 'ri-arrow-go-back-line', color: '#f59e0b', suffix: '%' },
  { key: 'spamRate', label: 'Spam Rate', icon: 'ri-spam-2-line', color: '#ef4444', suffix: '%' },
  { key: 'scheduledEmails', label: 'Scheduled', icon: 'ri-time-line', color: '#06b6d4' },
  { key: 'draftEmails', label: 'Drafts', icon: 'ri-draft-line', color: '#64748b' },
  { key: 'activeCampaigns', label: 'Active Campaigns', icon: 'ri-megaphone-line', color: '#ec4899' },
  { key: 'failedEmails', label: 'Failed', icon: 'ri-error-warning-line', color: '#dc2626' },
];

function StatCard({ stat, loading }) {
  if (loading) return <Card><CardContent><Skeleton height={60} /></CardContent></Card>;
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            <Typography variant="h5" fontWeight={700}>
              {stat.value}{stat.suffix || ''}
            </Typography>
          </Box>
          <Box sx={{ bgcolor: `${stat.color}20`, color: stat.color, p: 1, borderRadius: 2 }}>
            <i className={stat.icon} style={{ fontSize: 22 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function EmailDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    emailApi.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const cards = STAT_CARDS.map((c) => ({
    ...c,
    value: data?.cards?.[c.key] ?? 0,
  }));

  const dailyChart = {
    options: {
      chart: { toolbar: { show: false }, fontFamily: 'inherit' },
      xaxis: { categories: (data?.charts?.dailySending || []).map((d) => new Date(d.date).toLocaleDateString()) },
      stroke: { curve: 'smooth' },
      colors: ['#6366f1', '#22c55e'],
    },
    series: [
      { name: 'Sent', data: (data?.charts?.dailySending || []).map((d) => d.sent || 0) },
      { name: 'Delivered', data: (data?.charts?.dailySending || []).map((d) => d.delivered || 0) },
    ],
  };

  const deviceChart = {
    options: {
      labels: (data?.charts?.deviceStats || []).map((d) => d._id || 'unknown'),
      legend: { position: 'bottom' },
      colors: ['#6366f1', '#22c55e', '#f59e0b'],
    },
    series: (data?.charts?.deviceStats || []).map((d) => d.count),
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Email Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Monitor your email marketing performance at a glance</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((stat) => (
          <Grid item xs={6} sm={4} md={2.4} lg={2.4} key={stat.key} sx={{ flexBasis: { md: '20%' }, maxWidth: { md: '20%' } }}>
            <StatCard stat={stat} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Daily Sending</Typography>
              {loading ? <Skeleton height={300} /> : (
                <Chart options={dailyChart.options} series={dailyChart.series} type="area" height={300} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Device Statistics</Typography>
              {loading ? <Skeleton height={300} /> : deviceChart.series.length > 0 ? (
                <Chart options={deviceChart.options} series={deviceChart.series} type="donut" height={280} />
              ) : (
                <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>No data yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Sent</Typography>
              <List dense>
                {(data?.recentActivity?.lastSent || []).map((email) => (
                  <ListItem key={email._id} divider>
                    <ListItemText
                      primary={email.subject}
                      secondary={`${email.contactEmail} · ${email.sentAt ? new Date(email.sentAt).toLocaleString() : ''}`}
                    />
                    <Chip label={email.status} size="small" />
                  </ListItem>
                ))}
                {!loading && !(data?.recentActivity?.lastSent?.length) && (
                  <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>No emails sent yet</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Campaign Performance</Typography>
              <List dense>
                {(data?.recentActivity?.campaignPerformance || []).map((c) => (
                  <ListItem key={c._id} divider>
                    <ListItemText
                      primary={c.name}
                      secondary={`Sent: ${c.stats?.sent || 0} · Opened: ${c.stats?.opened || 0} · Clicked: ${c.stats?.clicked || 0}`}
                    />
                    <Chip label={c.status} size="small" color={c.status === 'completed' ? 'success' : 'primary'} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
