"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AlertCircle,
  Bell,
  Briefcase,
  CalendarDays,
  DollarSign,
  FileText,
  Newspaper,
  Scale,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useDashboard } from "../api/hooks";
import { CauseListPanel } from "./CauseListPanel";
import { HearingTodayCard, UpcomingHearingsList } from "./HearingTodayCard";
import { KpiStat } from "./KpiStat";
import { MatterTable } from "./MatterTable";
import { useLegalUiStore } from "../stores/legal-ui.store";

export function LegalDashboard() {
  const { data, isLoading } = useDashboard();
  const setAiOpen = useLegalUiStore((s) => s.setAiDrawerOpen);

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  const { kpis } = data;
  const maxRevenue = Math.max(...data.revenueAnalytics.map((r) => r.billed));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Legal Practice Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(new Date(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Button variant="gold" onClick={() => setAiOpen(true)}>
          <Sparkles className="h-4 w-4" />
          AI Insights
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KpiStat label="Active Matters" value={kpis.activeMatters} icon={Briefcase} trend={{ value: 8, label: "vs last month" }} />
        <KpiStat label="Pending" value={kpis.pendingMatters} icon={Scale} />
        <KpiStat label="Disposed" value={kpis.disposedThisMonth} icon={FileText} trend={{ value: 12, label: "this month" }} />
        <KpiStat label="New Clients" value={kpis.newClientsThisMonth} icon={Users} trend={{ value: 50, label: "this month" }} />
        <KpiStat label="Complaints" value={kpis.pendingComplaints} icon={AlertCircle} />
        <KpiStat label="FIR Pending" value={kpis.pendingFirs} icon={Shield} />
        <KpiStat label="Revenue" value={formatCurrency(kpis.revenueThisMonth)} icon={DollarSign} trend={{ value: 15, label: "MoM" }} />
        <KpiStat label="Compliance" value={kpis.complianceOverdue} icon={Bell} />
      </div>

      {/* Hearings & Cause List */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HearingTodayCard hearings={data.todaysHearings} />
        <CauseListPanel items={data.causeList} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingHearingsList hearings={data.upcomingHearings} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Court Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.calendarEvents.map((ev) => (
                <li key={ev.id} className="flex items-center gap-3 rounded-md border border-border p-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ev.date)} {ev.court && `· ${ev.court}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/legal/calendar">
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Full Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Matters */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Pending Matters</CardTitle>
            <Link href="/legal/cases" className="text-xs text-accent hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <MatterTable cases={data.pendingMatters.slice(0, 4)} compact />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Disposed</CardTitle>
          </CardHeader>
          <CardContent>
            <MatterTable cases={data.disposedMatters} compact />
          </CardContent>
        </Card>
      </div>

      {/* Clients, Alerts, Notices */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.newClients.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.city} · {c.type}</p>
                  </div>
                  <Badge variant="outline">{c.activeMatters} matters</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.caseAlerts.map((a) => (
                <li key={a.id} className="rounded-md border border-border p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "warning" : "outline"}>
                      {a.caseNumber}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{a.message}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Court Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.courtNotices.map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.court} · {formatDate(n.issuedAt)}
                    {n.deadline && ` · Due ${formatDate(n.deadline)}`}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Orders & Judgments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="flex justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium">{o.caseNumber}</span>
                    <p className="text-muted-foreground">{o.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(o.date)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest Judgments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.latestJudgments.map((j) => (
                <li key={j.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="gold">{j.court}</Badge>
                    <span className="text-xs text-muted-foreground">{j.citation}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{j.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{j.summary}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* News & Updates */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Newspaper className="h-4 w-4" />
              Legal News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.legalNews.map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.source} · {formatDate(n.publishedAt)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">HC / SC Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.hcScUpdates.map((u) => (
                <li key={u.id} className="text-sm">
                  <p className="font-medium">{u.title}</p>
                  <p className="text-xs text-muted-foreground">{u.source} · {formatDate(u.publishedAt)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-accent" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.aiInsights.map((ins) => (
                <li key={ins.id} className="rounded-md bg-muted/40 p-3 text-sm">
                  <Badge variant={ins.priority === "high" ? "destructive" : ins.priority === "medium" ? "warning" : "outline"}>
                    {ins.type}
                  </Badge>
                  <p className="mt-1 font-medium">{ins.title}</p>
                  <p className="text-xs text-muted-foreground">{ins.summary}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Compliance, Complaints, FIRs */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Pending Compliance</CardTitle>
            <Link href="/legal/analytics" className="text-xs text-accent hover:underline">Details</Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.pendingCompliance.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.title}</span>
                  <Badge variant={c.status === "overdue" ? "destructive" : "warning"}>
                    {formatDate(c.dueDate)}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Complaints</CardTitle>
            <Link href="/legal/complaints" className="text-xs text-accent hover:underline">Register</Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.complaints.slice(0, 3).map((c) => (
                <li key={c.id} className="text-sm">
                  <p className="font-medium">{c.complaintNumber}</p>
                  <p className="text-xs text-muted-foreground">{c.complainant} · {c.subject}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">FIR Pending</CardTitle>
            <Link href="/legal/firs" className="text-xs text-accent hover:underline">View FIRs</Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.pendingFirs.slice(0, 3).map((f) => (
                <li key={f.id} className="text-sm">
                  <p className="font-medium">FIR {f.firNumber}</p>
                  <p className="text-xs text-muted-foreground">{f.sections.join(", ")} · {f.policeStation}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {data.revenueAnalytics.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-col gap-0.5">
                    <div
                      className="w-full rounded-t bg-accent/80"
                      style={{ height: `${(r.revenue / maxRevenue) * 120}px` }}
                    />
                    <div
                      className="w-full rounded-t bg-muted-foreground/20"
                      style={{ height: `${((r.billed - r.revenue) / maxRevenue) * 120}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{r.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Collected</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Billed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Practice Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.practiceAnalytics.map((p) => (
                <div key={p.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{p.category}</span>
                    <span className="text-muted-foreground">{p.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-navy dark:bg-accent"
                      style={{ width: `${(p.count / 8) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
