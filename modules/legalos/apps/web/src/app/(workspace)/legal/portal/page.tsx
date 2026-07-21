"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAppearances, mockBriefcase, mockTimeline } from "@/features/legal/utils/enterprise-mock";
import { Bell, CalendarDays, FileText, MessageSquare, Shield } from "lucide-react";

export default function ClientPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">
            Secure client view preview — case status, hearings, documents, messages (payments/invoices via
            WOXOX Billing)
          </p>
        </div>
        <Badge variant="outline">Advocate preview mode</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Case status", value: "Active — Hearing listed", icon: Shield },
          { label: "Next hearing", value: "20 Jul 2026 · 10:30", icon: CalendarDays },
          { label: "Documents", value: String(mockBriefcase.evidence.length + mockBriefcase.orders.length), icon: FileText },
          { label: "Unread messages", value: "2", icon: MessageSquare },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold">
                <k.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-sm font-medium">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hearing schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAppearances.map((a) => (
              <div key={a.id} className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">{a.matter}</p>
                <p className="text-muted-foreground">
                  {a.court} · {a.bench} · {new Date(a.time).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plain-language AI summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Your matter is progressing. The next court date is listed above. Key documents and evidence
              shared by your counsel appear in the Documents section. For fee notes and payments, use WOXOX
              Billing.
            </p>
            <Button variant="gold" size="sm">
              <Bell className="h-4 w-4" />
              Notify client (preview)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matter timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTimeline.map((t) => (
            <div key={t.date + t.label} className="flex gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted-foreground">{t.date}</span>
              <Badge variant="outline">{t.kind}</Badge>
              <span>{t.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
