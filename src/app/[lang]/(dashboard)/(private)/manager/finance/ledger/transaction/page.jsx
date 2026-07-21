"use client";

import { useEffect, useMemo, useState } from "react";
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
  Grid,
  TextField,
  MenuItem,
  Select,
  Button,
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";
import dayjs from "dayjs";
import { financeApi, formatINR } from "@/libs/financeApi";

export default function TransactionsPage() {
  const [ledgerFilter, setLedgerFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ledgers, setLedgers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([financeApi.listLedgers(), financeApi.listJournals({})])
      .then(([lRes, jRes]) => {
        setLedgers(lRes.data || []);
        setJournals(jRes.data || []);
        setError("");
      })
      .catch(e => setError(e.message || "Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const flat = [];
    for (const entry of journals) {
      for (const line of entry.lines || []) {
        const ledger = line.ledger;
        flat.push({
          id: `${entry._id}-${line._id}`,
          date: entry.date,
          ledgerId: ledger?._id || line.ledger,
          ledger: ledger?.name || "Ledger",
          description: line.description || entry.description,
          sourceType: entry.sourceType,
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
          entryNumber: entry.entryNumber
        });
      }
    }
    return flat.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [journals]);

  const filteredTx = rows.filter(tx => {
    const matchesLedger = ledgerFilter === "All" || String(tx.ledgerId) === String(ledgerFilter);
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Debit" && tx.debit > 0) ||
      (typeFilter === "Credit" && tx.credit > 0);
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchesDate =
      (!dateFrom || dayjs(tx.date).isAfter(dayjs(dateFrom).subtract(1, "day"))) &&
      (!dateTo || dayjs(tx.date).isBefore(dayjs(dateTo).add(1, "day")));
    return matchesLedger && matchesType && matchesSearch && matchesDate;
  });

  const totalDebit = filteredTx.reduce((a, t) => a + t.debit, 0);
  const totalCredit = filteredTx.reduce((a, t) => a + t.credit, 0);

  if (loading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Journal Transactions
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Select fullWidth value={ledgerFilter} onChange={e => setLedgerFilter(e.target.value)}>
                <MenuItem value="All">All Ledgers</MenuItem>
                {ledgers.map(l => (
                  <MenuItem key={l._id} value={l._id}>
                    {l.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Select fullWidth value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Debit">Debit</MenuItem>
                <MenuItem value="Credit">Credit</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Search Description"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #43a047" }}>
            <CardContent>
              <Typography color="text.secondary">Total Credit</Typography>
              <Typography variant="h6" fontWeight={700} color="#43a047">
                {formatINR(totalCredit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #ef5350" }}>
            <CardContent>
              <Typography color="text.secondary">Total Debit</Typography>
              <Typography variant="h6" fontWeight={700} color="#ef5350">
                {formatINR(totalDebit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} sx={{ mb: 2 }}>
            Transaction Records
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell>Ledger</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Source</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTx.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTx.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>{tx.entryNumber}</TableCell>
                    <TableCell>{tx.ledger}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.sourceType}</TableCell>
                    <TableCell align="right">{tx.debit ? formatINR(tx.debit) : "—"}</TableCell>
                    <TableCell align="right">{tx.credit ? formatINR(tx.credit) : "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
