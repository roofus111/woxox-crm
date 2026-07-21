"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Select,
  Grid,
  Alert,
  CircularProgress,
  Button
} from "@mui/material";
import { financeApi, formatINR } from "@/libs/financeApi";

export default function LedgerViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [month, setMonth] = useState("All");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ledger, setLedger] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    financeApi
      .getLedger(id)
      .then(res => {
        setLedger(res.data?.ledger);
        setTransactions(res.data?.transactions || []);
        setError("");
      })
      .catch(e => setError(e.message || "Failed to load ledger"))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const y = String(d.getFullYear());
      const m = String(d.getMonth() + 1);
      if (year !== "All" && y !== year) return false;
      if (month !== "All" && m !== month) return false;
      return true;
    });
  }, [transactions, month, year]);

  const totalDebit = filteredTx.reduce((a, t) => a + (Number(t.debit) || 0), 0);
  const totalCredit = filteredTx.reduce((a, t) => a + (Number(t.credit) || 0), 0);

  if (loading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Ledger: {ledger?.name || "—"}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {ledger?.type} · {ledger?.code || "No code"} · Balance {formatINR(ledger?.balance)}
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Select fullWidth value={year} onChange={e => setYear(e.target.value)}>
            <MenuItem value="All">All Years</MenuItem>
            {[0, 1, 2].map(i => {
              const y = new Date().getFullYear() - i;
              return (
                <MenuItem key={y} value={String(y)}>
                  {y}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select fullWidth value={month} onChange={e => setMonth(e.target.value)}>
            <MenuItem value="All">All Months</MenuItem>
            {[...Array(12)].map((_, i) => (
              <MenuItem key={i} value={String(i + 1)}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTx.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No journal lines for this ledger yet</TableCell>
                </TableRow>
              ) : (
                filteredTx.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>{tx.entryNumber}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell align="right">{tx.debit ? formatINR(tx.debit) : "—"}</TableCell>
                    <TableCell align="right">{tx.credit ? formatINR(tx.credit) : "—"}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow sx={{ fontWeight: 700 }}>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell align="right">{formatINR(totalDebit)}</TableCell>
                <TableCell align="right">{formatINR(totalCredit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button sx={{ mt: 2 }} variant="outlined" onClick={() => router.push(`/${params?.lang || "en"}/manager/finance/ledger`)}>
        Back to Ledgers
      </Button>
    </Box>
  );
}
