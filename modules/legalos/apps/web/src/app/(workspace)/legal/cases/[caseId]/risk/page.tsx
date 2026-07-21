"use client";

import { use, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseEnterpriseNav } from "@/features/legal/components/CaseEnterpriseNav";
import { mockRiskFindings } from "@/features/legal/utils/enterprise-mock";

function severityVariant(severity: string): "destructive" | "warning" | "outline" {
  if (severity === "High") return "destructive";
  if (severity === "Medium") return "warning";
  return "outline";
}

export default function RiskAnalyzerPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [ran, setRan] = useState(false);
  const [findings, setFindings] = useState(mockRiskFindings);

  const runAnalyzer = () => {
    setRan(true);
    setFindings([...mockRiskFindings]);
  };

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseId} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">AI Risk Analyzer</h1>
          <p className="text-sm text-muted-foreground">Exposure scan for matter {caseId}</p>
        </div>
        <Button onClick={runAnalyzer}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Run Analyzer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Findings
            {ran && (
              <span className="text-xs font-normal text-muted-foreground">
                · last run just now
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {findings.map((finding, i) => (
            <div
              key={`${finding.severity}-${i}`}
              className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
            >
              <p className="text-sm">{finding.text}</p>
              <Badge variant={severityVariant(finding.severity)}>{finding.severity}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
