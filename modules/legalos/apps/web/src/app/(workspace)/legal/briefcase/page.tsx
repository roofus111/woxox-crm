"use client";

import { mockBriefcase } from "@/features/legal/utils/enterprise-mock";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BookOpen,
  Briefcase,
  FileText,
  Gavel,
  Phone,
  Scale,
  WifiOff,
} from "lucide-react";

const SECTIONS: {
  key: keyof typeof mockBriefcase;
  title: string;
  icon: typeof Scale;
}[] = [
  { key: "today", title: "Today's matters", icon: Scale },
  { key: "evidence", title: "Evidence", icon: FileText },
  { key: "research", title: "Research", icon: BookOpen },
  { key: "orders", title: "Orders", icon: Gavel },
  { key: "contacts", title: "Contacts", icon: Phone },
];

export default function DigitalBriefcasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Digital Briefcase</h1>
        <p className="text-sm text-muted-foreground">
          Day pack for court — matters, evidence, research, and contacts
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-navy px-4 py-3 text-gold">
        <WifiOff className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Offline sync ready</p>
          <p className="text-xs text-gold/80">
            Pack syncs when you reconnect — UI only for now
          </p>
        </div>
        <Badge variant="gold">Ready</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map(({ key, title, icon: Icon }) => {
          const items = mockBriefcase[key];
          return (
            <Card key={key}>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-gold">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <EmptyState
                    className="py-6"
                    title="Empty"
                    icon={<Briefcase className="h-5 w-5" />}
                  />
                ) : (
                  <ul className="space-y-2 text-sm">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-border/60 px-3 py-2 text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
