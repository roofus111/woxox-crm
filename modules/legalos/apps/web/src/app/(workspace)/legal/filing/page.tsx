"use client";

import { useState } from "react";
import Link from "next/link";
import { useFilings, useUpdateFiling } from "@/features/legal/api/hooks";
import { CreateFilingDialog } from "@/features/legal/components/CreateFilingDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { statusLabels, statusVariant } from "@/features/legal/utils/constants";
import { formatDate } from "@/lib/utils";
import { FileStack, Plus } from "lucide-react";
import type { FilingStatus } from "@/features/legal/types";

const STATUS_OPTIONS: FilingStatus[] = [
  "draft",
  "checklist",
  "filed",
  "defect",
  "refiled",
  "registered",
];

export default function FilingPage() {
  const { data, isLoading } = useFilings();
  const updateFiling = useUpdateFiling();
  const [open, setOpen] = useState(false);
  const filings = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Court Filing</h1>
          <p className="text-sm text-muted-foreground">
            Track petitions, applications, and registry status
          </p>
        </div>
        <Button variant="gold" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Filing
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading filings…</p>
      ) : filings.length === 0 ? (
        <EmptyState
          title="No filings yet"
          description="Create your first court filing against an active matter."
          action={
            <Button variant="gold" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              New Filing
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filings.map((filing) => (
            <Card key={filing.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-gold">
                    <FileStack className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-lg">{filing.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {filing.caseNumber ?? filing.caseId} · {filing.filingType.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <Badge variant={statusVariant(filing.status)}>
                  {statusLabels[filing.status] ?? filing.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {filing.diaryNumber && (
                    <p>
                      Diary: <span className="text-foreground">{filing.diaryNumber}</span>
                    </p>
                  )}
                  <p>Created {formatDate(filing.createdAt)}</p>
                  {filing.courtFees != null && (
                    <p>Court fees: ₹{filing.courtFees.toLocaleString("en-IN")}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={filing.status}
                    onChange={(e) =>
                      updateFiling.mutate({ id: filing.id, status: e.target.value })
                    }
                    disabled={updateFiling.isPending}
                    className="w-36"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s] ?? s}
                      </option>
                    ))}
                  </Select>
                  <Link href={`/legal/cases/${filing.caseId}`}>
                    <Button variant="outline" size="sm">
                      View Matter
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFilingDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
