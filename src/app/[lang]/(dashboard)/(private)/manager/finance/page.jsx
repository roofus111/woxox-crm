"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { financeApi, formatINR } from "@/libs/financeApi";

const COLORS = ["#1976d2", "#43a047", "#ef5350", "#ffb300", "#7b1fa2", "#00897b"];

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.lang || "en";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      await financeApi.seedHistory().catch(() => null);
      const res = await financeApi.getDashboard();
      setData(res.data);
    } catch (e) {
      setError(e.message || "Failed to load finance dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={load}>
          Retry
        </Button>
      </Box>
    );
  }

  const kpis = data?.kpis || {};
  const monthly = data?.monthly || [];
  const expenseBreakdown = data?.expenseBreakdown?.length
    ? data.expenseBreakdown
    : [{ name: "No expenses", value: 0 }];
  const recentTransactions = data?.recentTransactions || [];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Finance Dashboard
        </Typography>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { title: "Total Revenue", value: formatINR(kpis.totalRevenue), color: "#1976d2", icon: "ri-wallet-3-line" },
          { title: "Total Expenses", value: formatINR(kpis.totalExpenses), color: "#ef5350", icon: "ri-bank-card-line" },
          { title: "Profit", value: formatINR(kpis.profit), color: "#43a047", icon: "ri-line-chart-line" },
          { title: "Cash & Assets", value: formatINR(kpis.cashAssets), color: "#ffb300", icon: "ri-safe-2-line" }
        ].map(k => (
          <Grid item xs={12} sm={6} md={3} key={k.title}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: `${k.color}22`,
                      display: "grid",
                      placeItems: "center",
                      color: k.color
                    }}
                  >
                    <i className={k.icon} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" fontSize={13}>
                      {k.title}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {k.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              Revenue vs Expenses
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={v => formatINR(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef5350" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              Expense Breakdown
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" outerRadius={90} label>
                    {expenseBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatINR(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 2 }}>
                Recent Transactions
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No transactions yet</TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map(tx => (
                      <TableRow key={`${tx.id}-${tx.type}`}>
                        <TableCell>{new Date(tx.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell align="right">{formatINR(tx.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => router.push(`/${locale}/manager/finance/add`)}>
              Add Entry
            </Button>
            <Button variant="outlined" onClick={() => router.push(`/${locale}/manager/finance/ledger`)}>
              Ledger
            </Button>
            <Button variant="outlined" onClick={() => router.push(`/${locale}/manager/finance/balance-sheet`)}>
              Balance Sheet
            </Button>
            <Button variant="outlined" onClick={() => router.push(`/${locale}/manager/expense`)}>
              Expenses
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
