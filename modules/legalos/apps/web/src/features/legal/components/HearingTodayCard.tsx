"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";
import type { Hearing } from "../types";
import { Clock, Gavel, MapPin } from "lucide-react";
import Link from "next/link";

interface HearingTodayCardProps {
  hearings: Hearing[];
}

export function HearingTodayCard({ hearings }: HearingTodayCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gavel className="h-4 w-4 text-accent" />
          Today&apos;s Hearings
        </CardTitle>
        <Badge variant="gold">{hearings.length} listed</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {hearings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hearings scheduled for today.</p>
        ) : (
          hearings.map((h) => (
            <Link
              key={h.id}
              href={`/legal/cases/${h.caseId}`}
              className="block rounded-md border border-border p-3 transition-colors hover:border-accent/40 hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{h.caseNumber}</p>
                  <p className="text-sm text-muted-foreground">{h.title}</p>
                </div>
                <Badge variant={h.type === "urgent" ? "destructive" : h.type === "final" ? "gold" : "outline"}>
                  {h.type}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(h.dateTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {h.court}
                </span>
                {h.itemNumber && <span>Item #{h.itemNumber}</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{h.bench} · {h.advocate}</p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingHearingsList({ hearings }: { hearings: Hearing[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Hearings</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {hearings.map((h) => (
            <li key={h.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
              <div>
                <Link href={`/legal/cases/${h.caseId}`} className="font-medium hover:text-accent">
                  {h.caseNumber}
                </Link>
                <p className="text-xs text-muted-foreground">{h.court}</p>
              </div>
              <div className="text-right text-sm">
                <p>{formatDate(h.dateTime)}</p>
                <p className="text-xs text-muted-foreground">{formatTime(h.dateTime)}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
