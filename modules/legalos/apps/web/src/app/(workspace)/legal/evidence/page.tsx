"use client";

import { useState } from "react";
import { EvidenceTimeline } from "@/features/legal/components/EvidenceTimeline";
import { RegisterEvidenceDialog } from "@/features/legal/components/RegisterEvidenceDialog";
import { useEvidence } from "@/features/legal/api/hooks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EvidencePage() {
  const { data, isLoading } = useEvidence();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Evidence Management</h1>
          <p className="text-sm text-muted-foreground">
            Chain of custody, hash verification, version history, sealed originals
          </p>
        </div>
        <Button variant="gold" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Register Evidence
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading evidence vault…</p>
      ) : (
        <EvidenceTimeline items={data ?? []} />
      )}
      <RegisterEvidenceDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
