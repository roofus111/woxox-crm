'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    emailApi.getLogs({ limit: 100 })
      .then((res) => setLogs(res.data?.data || []))
      .catch(() => toast.error('Failed to load logs'));
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Activity Logs</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.entityType}</TableCell>
                <TableCell>{log.performedBy?.name || 'System'}</TableCell>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && <TableRow><TableCell colSpan={4} align="center">No activity logs yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
