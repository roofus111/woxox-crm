"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Button
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { financeApi, formatINR } from "@/libs/financeApi";

const COLORS = ["#1976d2", "#43a047", "#ffb300", "#ef5350", "#7b1fa2", "#00897b"];

export default function BalanceSheetPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      await financeApi.seedHistory().catch(() => null);
      const res = await financeApi.getBalanceSheet();
      setSheet(res.data);
    } catch (e) {
      setError(e.message || "Failed to load balance sheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assets = sheet?.assets || [];
  const liabilities = sheet?.liabilities || [];
  const equity = sheet?.equity || [];
  const totals = sheet?.totals || {};

  const pieAssets = useMemo(
    () => assets.filter(a => Math.abs(a.value) > 0.01).map(a => ({ name: a.name, value: Math.abs(a.value) })),
    [assets]
  );

  if (loading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Balance Sheet
        </Typography>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "4px solid #1976d2" }}>
            <CardContent>
              <Typography color="text.secondary">Total Assets</Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatINR(totals.assets)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "4px solid #ef5350" }}>
            <CardContent>
              <Typography color="text.secondary">Liabilities + Equity</Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatINR(totals.liabilitiesAndEquity)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "4px solid #43a047" }}>
            <CardContent>
              <Typography color="text.secondary">Retained Earnings (YTD)</Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatINR(totals.retainedEarnings)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              Asset Mix
            </Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieAssets.length ? pieAssets : [{ name: "No assets", value: 1 }]} dataKey="value" nameKey="name" outerRadius={90} label>
                    {(pieAssets.length ? pieAssets : [{ name: "No assets", value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatINR(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Assets
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Account</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map(a => (
                    <TableRow key={a.id || a.name}>
                      <TableCell>
                        {a.code ? `${a.code} · ` : ""}
                        {a.name}
                      </TableCell>
                      <TableCell align="right">{formatINR(a.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Liabilities
              </Typography>
              <Table size="small">
                <TableBody>
                  {liabilities.map(l => (
                    <TableRow key={l.id || l.name}>
                      <TableCell>
                        {l.code ? `${l.code} · ` : ""}
                        {l.name}
                      </TableCell>
                      <TableCell align="right">{formatINR(l.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Equity
              </Typography>
              <Table size="small">
                <TableBody>
                  {equity.map(e => (
                    <TableRow key={e.id || e.name}>
                      <TableCell>
                        {e.code ? `${e.code} · ` : ""}
                        {e.name}
                      </TableCell>
                      <TableCell align="right">{formatINR(e.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
