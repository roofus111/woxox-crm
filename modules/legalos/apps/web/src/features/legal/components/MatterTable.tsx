"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import type { Case } from "../types";
import { statusLabels, statusVariant } from "../utils/constants";
import { useRouter } from "next/navigation";

interface MatterTableProps {
  cases: Case[];
  title?: string;
  compact?: boolean;
}

export function MatterTable({ cases, compact }: MatterTableProps) {
  const router = useRouter();

  const columns: Column<Case>[] = [
    {
      key: "caseNumber",
      header: "Case No.",
      cell: (row) => <span className="font-medium">{row.caseNumber}</span>,
    },
    {
      key: "title",
      header: "Title",
      cell: (row) => (
        <div>
          <p className={compact ? "truncate max-w-[200px]" : ""}>{row.title}</p>
          {!compact && <p className="text-xs text-muted-foreground">{row.clientName}</p>}
        </div>
      ),
    },
    {
      key: "court",
      header: "Court",
      cell: (row) => <span className="text-muted-foreground">{row.court}</span>,
      className: compact ? "hidden md:table-cell" : undefined,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <Badge variant={statusVariant(row.status)}>{statusLabels[row.status]}</Badge>,
    },
    {
      key: "nextHearing",
      header: "Next Hearing",
      cell: (row) =>
        row.nextHearing ? (
          <span className="text-sm">{formatDate(row.nextHearing)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      className: compact ? "hidden lg:table-cell" : undefined,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={cases}
      keyExtractor={(r) => r.id}
      onRowClick={(row) => router.push(`/legal/cases/${row.id}`)}
    />
  );
}
