"use client";

import { useEffect, useState } from "react";
import { useAdvanceWorkflow, useWorkflows, type WorkflowRow } from "@/features/legal/api";
import { mockWorkflows } from "@/features/legal/utils/enterprise-mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Check, ChevronRight, FileCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";

function withHistory(w: (typeof mockWorkflows)[number]): WorkflowRow {
  const idx = w.steps.indexOf(w.step);
  return {
    ...w,
    history: w.steps.slice(0, Math.max(idx, 0) + 1).map((step, i) => ({
      at: `2026-07-${String(10 + i).padStart(2, "0")}`,
      step,
      note: i === idx ? "Current step" : "Approved",
    })),
  };
}

export default function DocumentApprovalWorkflowPage() {
  const { data: workflowsData } = useWorkflows();
  const advanceMutation = useAdvanceWorkflow();

  const [workflows, setWorkflows] = useState<WorkflowRow[]>(() =>
    mockWorkflows.map(withHistory)
  );
  const [historyId, setHistoryId] = useState<string | null>(null);

  useEffect(() => {
    if (workflowsData) setWorkflows(workflowsData);
  }, [workflowsData]);

  const historyItem = workflows.find((w) => w.id === historyId);

  const advance = async (id: string) => {
    try {
      const updated = await advanceMutation.mutateAsync({ id, approve: true });
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          return {
            ...updated,
            history: [
              ...(w.history ?? []),
              ...(updated.history?.length
                ? [updated.history[updated.history.length - 1]]
                : [
                    {
                      at: new Date().toISOString().slice(0, 10),
                      step: updated.step,
                      note: "Advanced",
                    },
                  ]),
            ],
          };
        })
      );
    } catch {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          const idx = w.steps.indexOf(w.step);
          if (idx < 0 || idx >= w.steps.length - 1) return w;
          const nextStep = w.steps[idx + 1];
          return {
            ...w,
            step: nextStep,
            history: [
              ...w.history,
              {
                at: new Date().toISOString().slice(0, 10),
                step: nextStep,
                note: "Advanced locally",
              },
            ],
          };
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Document Approval Workflow</h1>
        <p className="text-sm text-muted-foreground">
          Draft review chain from intern to court filing
        </p>
      </div>

      {workflows.length === 0 ? (
        <EmptyState title="No workflows" description="No approval chains in progress." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {workflows.map((w) => {
            const currentIdx = w.steps.indexOf(w.step);
            const canAdvance = currentIdx >= 0 && currentIdx < w.steps.length - 1;
            return (
              <Card key={w.id}>
                <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                  <div className="flex items-start gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-gold">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{w.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{w.matter}</p>
                    </div>
                  </div>
                  <Badge variant="gold">{w.step}</Badge>
                </CardHeader>
                <CardContent>
                  <ol className="flex flex-wrap items-center gap-1.5">
                    {w.steps.map((step, i) => {
                      const done = i < currentIdx;
                      const current = i === currentIdx;
                      return (
                        <li key={step} className="flex items-center gap-1.5">
                          {i > 0 && (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                              current && "bg-navy font-medium text-gold",
                              done && "bg-muted text-muted-foreground",
                              !done && !current && "border border-border text-muted-foreground"
                            )}
                          >
                            {done && <Check className="h-3 w-3" />}
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={!canAdvance || advanceMutation.isPending}
                    onClick={() => advance(w.id)}
                  >
                    Advance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryId(w.id)}
                  >
                    <History className="h-3.5 w-3.5" />
                    View history
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!historyId} onOpenChange={(o) => !o && setHistoryId(null)}>
        <DialogContent onClose={() => setHistoryId(null)}>
          <DialogHeader>
            <DialogTitle>Workflow history</DialogTitle>
            <DialogDescription>
              {historyItem?.title ?? "Approval trail"} · {historyItem?.matter}
            </DialogDescription>
          </DialogHeader>
          {historyItem && (
            <ul className="space-y-2 text-sm">
              {historyItem.history.map((h, i) => (
                <li
                  key={`${h.step}-${i}`}
                  className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{h.step}</p>
                    <p className="text-muted-foreground">{h.note}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{h.at}</span>
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
