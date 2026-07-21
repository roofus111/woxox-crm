"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material";
import { financeApi, formatINR } from "@/libs/financeApi";

const TYPES = ["Asset", "Liability", "Equity", "Income", "Expense"];

export default function LedgerManager() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.lang || "en";
  const [open, setOpen] = useState(false);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newLedger, setNewLedger] = useState({ name: "", type: "Asset", openingBalance: 0, code: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      await financeApi.seedHistory().catch(() => null);
      const res = await financeApi.listLedgers();
      setLedgers(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load ledgers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddLedger = async () => {
    try {
      await financeApi.createLedger({
        name: newLedger.name,
        type: newLedger.type,
        code: newLedger.code,
        openingBalance: Number(newLedger.openingBalance) || 0
      });
      setOpen(false);
      setNewLedger({ name: "", type: "Asset", openingBalance: 0, code: "" });
      load();
    } catch (e) {
      setError(e.message || "Failed to create ledger");
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Ledger Manager
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Ledger
        </Button>
        <Button variant="outlined" onClick={() => router.push(`/${locale}/manager/finance/ledger/transaction`)}>
          All Transactions
        </Button>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Ledger Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledgers.map(ledger => (
                  <TableRow
                    key={ledger._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => router.push(`/${locale}/manager/finance/ledger/${ledger._id}`)}
                  >
                    <TableCell>{ledger.code || "—"}</TableCell>
                    <TableCell>{ledger.name}</TableCell>
                    <TableCell>{ledger.type}</TableCell>
                    <TableCell align="right">{formatINR(ledger.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Ledger</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, pb: 3 }}>
          <TextField
            label="Ledger Name"
            value={newLedger.name}
            onChange={e => setNewLedger({ ...newLedger, name: e.target.value })}
          />
          <TextField
            select
            label="Type"
            value={newLedger.type}
            onChange={e => setNewLedger({ ...newLedger, type: e.target.value })}
          >
            {TYPES.map(t => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Code"
            value={newLedger.code}
            onChange={e => setNewLedger({ ...newLedger, code: e.target.value })}
          />
          <TextField
            label="Opening Balance"
            type="number"
            value={newLedger.openingBalance}
            onChange={e => setNewLedger({ ...newLedger, openingBalance: e.target.value })}
          />
          <Button variant="contained" onClick={handleAddLedger} disabled={!newLedger.name}>
            Save Ledger
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
