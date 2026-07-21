"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useFir, useUpdateFir } from "@/features/legal/api/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { statusLabels, statusVariant } from "@/features/legal/utils/constants";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Shield } from "lucide-react";
import type { BailStatus, FirStatus } from "@/features/legal/types";

const FIR_STATUSES: FirStatus[] = ["registered", "investigation", "chargesheet", "closed"];
const BAIL_STATUSES: BailStatus[] = [
  "not_applicable",
  "applied",
  "granted",
  "rejected",
  "expired",
];

export default function FirDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: fir, isLoading } = useFir(id);
  const updateFir = useUpdateFir();
  const [chargeSheet, setChargeSheet] = useState({
    referenceNumber: "",
    filedAt: "",
    notes: "",
  });

  useEffect(() => {
    if (!fir) return;
    setChargeSheet({
      referenceNumber: fir.chargeSheet?.referenceNumber ?? "",
      filedAt: fir.chargeSheet?.filedAt ? fir.chargeSheet.filedAt.slice(0, 10) : "",
      notes: fir.chargeSheet?.notes ?? "",
    });
  }, [fir]);

  if (isLoading) return <p className="text-muted-foreground">Loading FIR…</p>;
  if (!fir) return <p className="text-muted-foreground">FIR not found.</p>;

  const saveChargeSheet = () => {
    updateFir.mutate({
      id: fir.id,
      chargeSheet: {
        referenceNumber: chargeSheet.referenceNumber.trim() || undefined,
        filedAt: chargeSheet.filedAt
          ? new Date(chargeSheet.filedAt).toISOString()
          : undefined,
        notes: chargeSheet.notes.trim() || undefined,
      },
      status: fir.status === "registered" || fir.status === "investigation" ? "chargesheet" : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/legal/firs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to FIR Register
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            <h1 className="font-serif text-2xl font-semibold">{fir.firNumber}</h1>
            <Badge variant={statusVariant(fir.status)}>{statusLabels[fir.status]}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {fir.policeStation}
            {fir.district ? ` · ${fir.district}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">FIR Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Sections</span>
              <span className="font-medium text-right">{(fir.sections ?? []).join(", ")}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Complainant</span>
              <span>{fir.complainant}</span>
            </div>
            {fir.accused && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Accused</span>
                <span>{fir.accused}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Investigating Officer</span>
              <span>{fir.investigatingOfficer}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Registered</span>
              <span>{formatDate(fir.registeredAt)}</span>
            </div>
            {fir.linkedComplaintId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Linked Complaint</span>
                <Link href={`/legal/complaints/${fir.linkedComplaintId}`} className="text-accent">
                  View complaint
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status & Bail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">FIR Status</label>
              <Select
                value={fir.status}
                onChange={(e) =>
                  updateFir.mutate({ id: fir.id, status: e.target.value })
                }
                disabled={updateFir.isPending}
                className="mt-1"
              >
                {FIR_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s] ?? s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bail Status</label>
              <Select
                value={fir.bailStatus ?? "not_applicable"}
                onChange={(e) =>
                  updateFir.mutate({ id: fir.id, bailStatus: e.target.value })
                }
                disabled={updateFir.isPending}
                className="mt-1"
              >
                {BAIL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s] ?? s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
              <p className="text-sm font-medium">Charge Sheet</p>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Reference number</label>
                <Input
                  className="mt-1"
                  value={chargeSheet.referenceNumber}
                  onChange={(e) =>
                    setChargeSheet((s) => ({ ...s, referenceNumber: e.target.value }))
                  }
                  placeholder="CS/2026/…"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Filed on</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={chargeSheet.filedAt}
                  onChange={(e) => setChargeSheet((s) => ({ ...s, filedAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <textarea
                  rows={3}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={chargeSheet.notes}
                  onChange={(e) => setChargeSheet((s) => ({ ...s, notes: e.target.value }))}
                  placeholder="Sections pressed, court of filing…"
                />
              </div>
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={saveChargeSheet}
                disabled={updateFir.isPending}
              >
                {updateFir.isPending ? "Saving…" : "Save charge sheet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{fir.summary}</p>
        </CardContent>
      </Card>
    </div>
  );
}
