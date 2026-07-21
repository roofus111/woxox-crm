"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHearings } from "@/features/legal/api/hooks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, Gavel, MapPin, Search } from "lucide-react";
import type { Hearing } from "@/features/legal/types";

type ViewMode = "day" | "week" | "month";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function getRange(view: ViewMode, anchor: Date) {
  const start = startOfDay(anchor);
  const end = endOfDay(anchor);

  if (view === "week") {
    start.setDate(start.getDate() - start.getDay());
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (view === "month") {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  }

  return { from: start.toISOString(), to: end.toISOString() };
}

function groupByDate(hearings: Hearing[]) {
  return hearings.reduce<Record<string, Hearing[]>>((acc, h) => {
    const key = formatDate(h.dateTime);
    acc[key] = acc[key] ?? [];
    acc[key].push(h);
    return acc;
  }, {});
}

function HearingCard({ hearing }: { hearing: Hearing }) {
  return (
    <div className="rounded-md border border-border p-3 transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          {hearing.caseId ? (
            <Link
              href={`/legal/cases/${hearing.caseId}`}
              className="font-medium text-accent hover:underline"
            >
              {hearing.caseNumber}
            </Link>
          ) : (
            <p className="font-medium">{hearing.caseNumber}</p>
          )}
          <p className="text-sm text-muted-foreground">{hearing.title}</p>
        </div>
        <Badge variant="outline">{hearing.type}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(hearing.dateTime)}
        </span>
        <span className="flex items-center gap-1">
          <Gavel className="h-3 w-3" />
          {hearing.court}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {hearing.bench}
        </span>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [search, setSearch] = useState("");

  const range = useMemo(() => getRange(view, anchor), [view, anchor]);
  const { data: rawHearings = [], isLoading } = useHearings({
    from: range.from,
    to: range.to,
  });

  const hearings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawHearings;
    return rawHearings.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.caseNumber.toLowerCase().includes(q) ||
        h.court.toLowerCase().includes(q) ||
        h.bench.toLowerCase().includes(q)
    );
  }, [rawHearings, search]);

  const grouped = useMemo(
    () =>
      Object.entries(groupByDate(hearings)).sort(
        ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
      ),
    [hearings]
  );

  const shiftAnchor = (delta: number) => {
    setAnchor((d) => {
      const next = new Date(d);
      if (view === "day") next.setDate(next.getDate() + delta);
      else if (view === "week") next.setDate(next.getDate() + delta * 7);
      else next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  const rangeLabel =
    view === "day"
      ? formatDate(anchor, { weekday: "long" })
      : view === "week"
        ? `${formatDate(range.from)} — ${formatDate(range.to)}`
        : formatDate(anchor, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Court Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Live hearings from API — day, week, and month views
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search case, court, bench…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="week" value={view} onValueChange={(v) => setView(v as ViewMode)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftAnchor(-1)}
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
            >
              Prev
            </button>
            <span className="min-w-[10rem] text-center text-sm font-medium">{rangeLabel}</span>
            <button
              type="button"
              onClick={() => shiftAnchor(1)}
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setAnchor(new Date())}
              className="rounded-md border border-border px-3 py-1 text-sm text-accent hover:bg-muted"
            >
              Today
            </button>
          </div>
        </div>

        {(["day", "week", "month"] as const).map((mode) => (
          <TabsContent key={mode} value={mode}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {hearings.length} hearing{hearings.length !== 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading hearings…</p>
                ) : hearings.length === 0 ? (
                  <EmptyState
                    title="No hearings in this period"
                    description="Try a different date range or search term."
                  />
                ) : mode === "day" ? (
                  <div className="space-y-3">
                    {hearings
                      .sort(
                        (a, b) =>
                          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
                      )
                      .map((h) => (
                        <HearingCard key={h.id} hearing={h} />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {grouped.map(([date, items]) => (
                      <div key={date}>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {date}
                        </p>
                        <div className="space-y-3">
                          {items
                            .sort(
                              (a, b) =>
                                new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
                            )
                            .map((h) => (
                              <HearingCard key={h.id} hearing={h} />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
