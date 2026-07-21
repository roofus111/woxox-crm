"use client";

import { use } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseEnterpriseNav } from "@/features/legal/components/CaseEnterpriseNav";
import { mockTimeline } from "@/features/legal/utils/enterprise-mock";

export default function CaseTimelinePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseId} />

      <div>
        <h1 className="font-serif text-2xl font-semibold">Case Timeline Intelligence</h1>
        <p className="text-sm text-muted-foreground">Chronology for matter {caseId}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-0 border-l border-border ml-3">
            {mockTimeline.map((event, index) => (
              <li key={`${event.date}-${event.label}`} className="relative pb-8 pl-6 last:pb-0">
                <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-foreground" />
                <div className="flex flex-wrap items-center gap-2">
                  <time className="text-xs tabular-nums text-muted-foreground">{event.date}</time>
                  <Badge variant="outline">{event.kind}</Badge>
                  {index === mockTimeline.length - 1 && (
                    <Badge variant="warning">Upcoming</Badge>
                  )}
                </div>
                <p className="mt-1 font-medium">{event.label}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
