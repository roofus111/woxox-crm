"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, ArrowRightLeft, FileWarning, Search, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useComplaints, useConvertComplaintToFir } from "../api/hooks";
import type { Complaint } from "../types";
import { statusLabels, statusVariant } from "../utils/constants";
import { useLegalUiStore } from "../stores/legal-ui.store";
import { CreateComplaintDialog } from "./CreateComplaintDialog";

export function ComplaintRegister() {
  const router = useRouter();
  const { data, isLoading } = useComplaints();
  const convertMutation = useConvertComplaintToFir();
  const filter = useLegalUiStore((s) => s.activeComplaintFilter);
  const setFilter = useLegalUiStore((s) => s.setActiveComplaintFilter);
  const [search, setSearch] = useState("");
  const [convertTarget, setConvertTarget] = useState<Complaint | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const complaints = useMemo(() => data?.data ?? [], [data?.data]);

  const filtered = useMemo(() => {
    let list = complaints;
    if (filter !== "all") list = list.filter((c) => c.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.complaintNumber.toLowerCase().includes(q) ||
          c.complainant.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q)
      );
    }
    return list;
  }, [complaints, filter, search]);

  const handleConvert = async () => {
    if (!convertTarget) return;
    const fir = await convertMutation.mutateAsync({
      id: convertTarget.id,
      policeStation: convertTarget.policeStation,
    });
    setConvertTarget(null);
    router.push(`/legal/firs?highlight=${fir.id}`);
  };

  const columns: Column<Complaint>[] = [
    {
      key: "number",
      header: "Complaint No.",
      cell: (row) => (
        <Link href={`/legal/complaints/${row.id}`} className="font-medium hover:text-accent">
          {row.complaintNumber}
        </Link>
      ),
    },
    {
      key: "complainant",
      header: "Complainant",
      cell: (row) => row.complainant,
    },
    {
      key: "subject",
      header: "Subject",
      cell: (row) => <span className="max-w-xs truncate block">{row.subject}</span>,
    },
    {
      key: "station",
      header: "Police Station",
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.policeStation}, {row.district}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <Badge variant={statusVariant(row.status)}>{statusLabels[row.status]}</Badge>,
    },
    {
      key: "registered",
      header: "Registered",
      cell: (row) => formatDate(row.registeredAt),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) =>
        row.status !== "converted_to_fir" && row.status !== "closed" ? (
          <Button
            variant="gold"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setConvertTarget(row);
            }}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Convert to FIR
          </Button>
        ) : row.firId ? (
          <Link href={`/legal/firs?highlight=${row.firId}`}>
            <Badge variant="success">FIR Linked</Badge>
          </Link>
        ) : null,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-accent" />
                Complaint Register
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Track complaints from registration through FIR conversion — a WOXOX LegalOS exclusive workflow.
              </p>
            </div>
            <Button variant="gold" onClick={() => setCreateOpen(true)}>
              <FileWarning className="h-4 w-4" />
              New Complaint
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by number, complainant, subject…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-48">
              <option value="all">All statuses</option>
              <option value="registered">Registered</option>
              <option value="under_inquiry">Under Inquiry</option>
              <option value="converted_to_fir">Converted to FIR</option>
              <option value="closed">Closed</option>
            </Select>
          </div>

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">All Complaints</TabsTrigger>
              <TabsTrigger value="pending">Pending FIR ({complaints.filter((c) => c.status === "registered" || c.status === "under_inquiry").length})</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading complaints…</p>
              ) : (
                <DataTable
                  columns={columns}
                  data={filtered}
                  keyExtractor={(r) => r.id}
                  onRowClick={(row) => router.push(`/legal/complaints/${row.id}`)}
                />
              )}
            </TabsContent>
            <TabsContent value="pending">
              <DataTable
                columns={columns}
                data={filtered.filter((c) => c.status === "registered" || c.status === "under_inquiry")}
                keyExtractor={(r) => r.id}
                onRowClick={(row) => router.push(`/legal/complaints/${row.id}`)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!convertTarget} onOpenChange={(open) => !open && setConvertTarget(null)}>
        <DialogContent onClose={() => setConvertTarget(null)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Convert Complaint to FIR
            </DialogTitle>
            <DialogDescription>
              This action will register an FIR with the police station linked to this complaint. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {convertTarget && (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <p><strong>Complaint:</strong> {convertTarget.complaintNumber}</p>
              <p><strong>Complainant:</strong> {convertTarget.complainant}</p>
              <p><strong>Police Station:</strong> {convertTarget.policeStation}, {convertTarget.district}</p>
              <p><strong>Subject:</strong> {convertTarget.subject}</p>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Confirm that inquiry is complete and grounds exist under CrPC for FIR registration. Assigned IO will be notified.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertTarget(null)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleConvert} disabled={convertMutation.isPending}>
              {convertMutation.isPending ? "Converting…" : "Confirm — Register FIR"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateComplaintDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
