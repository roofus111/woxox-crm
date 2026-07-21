"use client";

import { use, useState } from "react";
import { Scale, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseEnterpriseNav } from "@/features/legal/components/CaseEnterpriseNav";
import { mockHearingPrep } from "@/features/legal/utils/enterprise-mock";

export default function HearingPrepPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [generated, setGenerated] = useState(false);
  const [prep, setPrep] = useState(mockHearingPrep);

  const generate = () => {
    setGenerated(true);
    setPrep({ ...mockHearingPrep });
  };

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseId} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">AI Hearing Preparation</h1>
          <p className="text-sm text-muted-foreground">Brief pack for matter {caseId}</p>
        </div>
        <Button onClick={generate}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </div>

      {generated && (
        <p className="text-sm text-muted-foreground">Prep pack regenerated locally.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{prep.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prep.timeline.map((event) => (
              <div key={`${event.date}-${event.label}`} className="flex items-center gap-2 text-sm">
                <span className="tabular-nums text-muted-foreground">{event.date}</span>
                <Badge variant="outline">{event.kind}</Badge>
                <span>{event.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Laws</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {prep.laws.map((law) => (
                <li key={law}>{law}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {prep.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Arguments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {prep.arguments.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {prep.weaknesses.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {prep.missingDocs.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
