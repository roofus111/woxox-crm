'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import whatsappApi from '@/utils/whatsappApi';

export default function WhatsAppReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ metrics: {}, chartData: [], agentPerformance: [] });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await whatsappApi.getReports({ days: 30, period: 'daily' });
      setData(res.data?.data || {});
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  }

  const { metrics = {}, agentPerformance = [] } = data;

  const statCards = [
    { label: 'Sent', value: metrics.messagesSent, icon: 'ri-send-plane-line', color: '#25D366' },
    { label: 'Received', value: metrics.messagesReceived, icon: 'ri-inbox-line', color: '#128C7E' },
    { label: 'Delivered', value: metrics.delivered, icon: 'ri-check-double-line', color: '#34B7F1' },
    { label: 'Read', value: metrics.read, icon: 'ri-eye-line', color: '#075E54' },
    { label: 'Failed', value: metrics.failed, icon: 'ri-error-warning-line', color: '#E53935' },
    { label: 'Conversations', value: metrics.conversationCount, icon: 'ri-chat-3-line', color: '#54656F' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">WhatsApp Reports</Typography>
        <Button variant="outlined" onClick={fetchReports}>Refresh</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={6} sm={4} md={2} key={stat.label}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <i className={stat.icon} style={{ fontSize: 28, color: stat.color }} />
                <Typography variant="h5" sx={{ mt: 1 }}>{stat.value ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Delivery Rate</Typography>
              <Typography variant="h4">{metrics.deliveryRate ?? 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Read Rate</Typography>
              <Typography variant="h4">{metrics.readRate ?? 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Agent Performance</Typography>
      <Card variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell align="right">Sent</TableCell>
              <TableCell align="right">Delivered</TableCell>
              <TableCell align="right">Read</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agentPerformance.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No data</TableCell></TableRow>
            ) : (
              agentPerformance.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell>{agent.agentName}</TableCell>
                  <TableCell align="right">{agent.messagesSent}</TableCell>
                  <TableCell align="right">{agent.delivered}</TableCell>
                  <TableCell align="right">{agent.read}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
