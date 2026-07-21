"use client";

import { useDashboard } from "@/features/legal/api/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { KpiStat } from "@/features/legal/components/KpiStat";
import { Briefcase, FileWarning, Shield, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const { data, isLoading } = useDashboard();
  const revenue = data?.revenueAnalytics ?? [];
  const practice = data?.practiceAnalytics ?? [];
  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Practice Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Live portfolio signals from workspace dashboard
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading analytics…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiStat
              label="Active Matters"
              value={String(kpis?.activeMatters ?? 0)}
              icon={Briefcase}
            />
            <KpiStat
              label="Pending Matters"
              value={String(kpis?.pendingMatters ?? 0)}
              icon={TrendingUp}
            />
            <KpiStat
              label="Pending Complaints"
              value={String(kpis?.pendingComplaints ?? 0)}
              icon={FileWarning}
            />
            <KpiStat
              label="Pending FIRs"
              value={String(kpis?.pendingFirs ?? 0)}
              icon={Shield}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {revenue.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No revenue data available.</p>
                ) : (
                  revenue.map((row) => (
                    <div key={row.month} className="flex items-center justify-between text-sm">
                      <span>{row.month}</span>
                      <span>
                        {formatCurrency(row.revenue)} / {formatCurrency(row.billed)} billed
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Practice area mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {practice.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No practice breakdown available.</p>
                ) : (
                  practice.map((row) => (
                    <div key={row.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{row.category}</span>
                        <span className="font-medium">{row.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{
                            width: `${Math.min(100, (row.count / Math.max(...practice.map((p) => p.count), 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Disposed this month</p>
                <p className="text-2xl font-semibold">{kpis?.disposedThisMonth ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Revenue this month</p>
                <p className="text-2xl font-semibold">{formatCurrency(kpis?.revenueThisMonth ?? 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Compliance overdue</p>
                <p className="text-2xl font-semibold">{kpis?.complianceOverdue ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Partner dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Win ratio</span><span className="font-medium">62%</span></div>
                <div className="flex justify-between"><span>Avg disposal</span><span className="font-medium">214 days</span></div>
                <div className="flex justify-between"><span>Case load</span><span className="font-medium">48 active</span></div>
                <div className="flex justify-between"><span>AI productivity</span><span className="font-medium">78/100</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Branch performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {["Kochi", "Chennai", "Bangalore", "Mumbai", "Trivandrum"].map((b, i) => (
                  <div key={b} className="flex justify-between">
                    <span>{b}</span>
                    <span className="font-medium">{[28, 16, 14, 18, 12][i]} matters</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Court & department load</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Litigation</span><span className="font-medium">High</span></div>
                <div className="flex justify-between"><span>Corporate</span><span className="font-medium">Medium</span></div>
                <div className="flex justify-between"><span>Recovery</span><span className="font-medium">Medium</span></div>
                <div className="flex justify-between"><span>HC listings this week</span><span className="font-medium">11</span></div>
                <p className="pt-2 text-xs text-muted-foreground">
                  Outstanding payments & fee notes remain in WOXOX Billing.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
