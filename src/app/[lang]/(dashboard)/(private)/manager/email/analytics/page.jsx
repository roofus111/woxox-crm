'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    emailApi.getAnalytics({})
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    { label: 'Sent', value: data?.sent || 0, color: '#6366f1' },
    { label: 'Delivered', value: data?.delivered || 0, color: '#22c55e' },
    { label: 'Opened', value: data?.opened || 0, color: '#3b82f6' },
    { label: 'Clicked', value: data?.clicked || 0, color: '#8b5cf6' },
    { label: 'Bounced', value: data?.bounced || 0, color: '#f59e0b' },
    { label: 'Unsubscribed', value: data?.unsubscribed || 0, color: '#ef4444' },
  ];

  const chartOptions = {
    labels: metrics.map((m) => m.label),
    colors: metrics.map((m) => m.color),
    legend: { position: 'bottom' },
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Analytics</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((m) => (
          <Grid item xs={6} md={2} key={m.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {loading ? <Skeleton height={40} /> : (
                  <>
                    <Typography variant="h4" fontWeight={700} sx={{ color: m.color }}>{m.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Performance Overview</Typography>
          {loading ? <Skeleton height={300} /> : (
            <Chart options={chartOptions} series={metrics.map((m) => m.value)} type="donut" height={350} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
