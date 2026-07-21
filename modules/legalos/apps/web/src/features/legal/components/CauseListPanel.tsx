"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CauseListItem } from "../types";
import { statusLabels, statusVariant } from "../utils/constants";
import { ListOrdered } from "lucide-react";

interface CauseListPanelProps {
  items: CauseListItem[];
}

export function CauseListPanel({ items }: CauseListPanelProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListOrdered className="h-4 w-4 text-accent" />
          Cause List
        </CardTitle>
        <span className="text-xs text-muted-foreground">Live from eCourts</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-navy font-mono text-sm font-bold text-gold dark:bg-secondary">
                {item.itemNumber}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.caseNumber}</span>
                  <Badge variant={statusVariant(item.status)}>{statusLabels[item.status]}</Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.purpose} · {item.bench} · {item.advocate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
