"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { EvidenceItem } from "../types";
import { statusLabels, statusVariant } from "../utils/constants";
import { useSealEvidence } from "../api/hooks";
import { FileAudio, FileImage, FileText, FileVideo, Fingerprint, Lock, Package } from "lucide-react";

const typeIcons = {
  document: FileText,
  photo: FileImage,
  video: FileVideo,
  audio: FileAudio,
  physical: Package,
};

interface EvidenceTimelineProps {
  items: EvidenceItem[];
}

export function EvidenceTimeline({ items }: EvidenceTimelineProps) {
  const sealEvidence = useSealEvidence();
  const sorted = [...items].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evidence Chain of Custody</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0 border-l border-border pl-8">
          {sorted.map((item, i) => {
            const Icon = typeIcons[item.type];
            const isSealed = item.sealed || item.status === "verified";

            return (
              <li key={item.id} className="relative pb-8 last:pb-0">
                <span className="absolute -left-[1.35rem] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                </span>
                <div className="rounded-md border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.caseNumber} · {formatDate(item.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSealed && (
                        <Badge variant="success" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Sealed
                        </Badge>
                      )}
                      <Badge variant={statusVariant(item.status)}>
                        {statusLabels[item.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Fingerprint className="h-3 w-3" />
                      {item.hash}
                    </span>
                    <span>{item.size}</span>
                    <span>By {item.uploadedBy}</span>
                    {!isSealed && (
                      <Button
                        variant="gold"
                        size="sm"
                        className="ml-auto h-7 text-xs"
                        onClick={() => sealEvidence.mutate({ id: item.id })}
                        disabled={sealEvidence.isPending}
                      >
                        <Lock className="h-3 w-3" />
                        {sealEvidence.isPending ? "Sealing…" : "Seal Evidence"}
                      </Button>
                    )}
                  </div>
                </div>
                {i < sorted.length - 1 && (
                  <div className="absolute -left-[0.65rem] top-7 h-[calc(100%-1.75rem)] w-px bg-border" />
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
