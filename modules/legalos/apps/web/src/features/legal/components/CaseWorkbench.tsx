"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  ExternalLink,
  FileText,
  Gavel,
  Hash,
  User,
} from "lucide-react";
import type { Case } from "../types";
import { statusLabels, statusVariant } from "../utils/constants";
import { useLegalUiStore } from "../stores/legal-ui.store";
import { ScheduleHearingDialog } from "./ScheduleHearingDialog";
import { RegisterEvidenceDialog } from "./RegisterEvidenceDialog";
import { CaseEnterpriseNav } from "./CaseEnterpriseNav";
import { useState } from "react";

interface CaseWorkbenchProps {
  caseData: Case;
}

export function CaseWorkbench({ caseData }: CaseWorkbenchProps) {
  const setAiOpen = useLegalUiStore((s) => s.setAiDrawerOpen);
  const [hearingOpen, setHearingOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseData.id} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold">{caseData.caseNumber}</h1>
            <Badge variant={statusVariant(caseData.status)}>{statusLabels[caseData.status]}</Badge>
            <Badge variant="outline">{caseData.stage}</Badge>
            {caseData.priority === "high" && <Badge variant="destructive">High Priority</Badge>}
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{caseData.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setHearingOpen(true)}>
            <Calendar className="h-4 w-4" />
            Schedule Hearing
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEvidenceOpen(true)}>
            <FileText className="h-4 w-4" />
            Add Evidence
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
            eCourts
          </Button>
          <Button variant="gold" size="sm" onClick={() => setAiOpen(true)}>
            AI Case Brief
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Gavel className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Court</p>
              <p className="text-sm font-medium">{caseData.court}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <User className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="text-sm font-medium">{caseData.clientName}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Next Hearing</p>
              <p className="text-sm font-medium">
                {caseData.nextHearing ? formatDate(caseData.nextHearing) : "Not listed"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Hash className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">CNR</p>
              <p className="text-sm font-medium">{caseData.cnrs ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="filings">Filings</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Matter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Category</span>
                  <span>{caseData.category}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Filing Date</span>
                  <span>{formatDate(caseData.filingDate)}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Advocate</span>
                  <span>{caseData.advocate}</span>
                </div>
                {caseData.bench && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bench</span>
                    <span>{caseData.bench}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Latest Order</CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.lastOrder ? (
                  <p className="text-sm">{caseData.lastOrder}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No orders on record.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
              Orders synced from eCourts will appear here.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filings">
          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <p className="text-sm text-muted-foreground">Manage e-filings and vakalatnama for this matter.</p>
              <Button variant="gold" size="sm">New Filing</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="py-6">
              <ol className="relative border-l border-border pl-6">
                <li className="mb-6">
                  <span className="absolute -left-1.5 flex h-3 w-3 rounded-full bg-accent" />
                  <p className="text-sm font-medium">Case filed</p>
                  <p className="text-xs text-muted-foreground">{formatDate(caseData.filingDate)}</p>
                </li>
                {caseData.lastOrder && (
                  <li className="mb-6">
                    <span className="absolute -left-1.5 flex h-3 w-3 rounded-full bg-muted-foreground" />
                    <p className="text-sm font-medium">Latest order</p>
                    <p className="text-xs text-muted-foreground">{caseData.lastOrder}</p>
                  </li>
                )}
                {caseData.nextHearing && (
                  <li>
                    <span className="absolute -left-1.5 flex h-3 w-3 rounded-full border-2 border-accent bg-background" />
                    <p className="text-sm font-medium">Upcoming hearing</p>
                    <p className="text-xs text-muted-foreground">{formatDate(caseData.nextHearing)}</p>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ScheduleHearingDialog
        open={hearingOpen}
        onOpenChange={setHearingOpen}
        caseData={caseData}
      />
      <RegisterEvidenceDialog
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
        defaultCaseId={caseData.id}
      />
    </div>
  );
}
