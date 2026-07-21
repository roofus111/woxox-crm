"use client";

import { useState } from "react";
import { MatterTable } from "@/features/legal/components/MatterTable";
import { CreateMatterDialog } from "@/features/legal/components/CreateMatterDialog";
import { useCases } from "@/features/legal/api/hooks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CasesPage() {
  const { data, isLoading } = useCases();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Matter Management</h1>
          <p className="text-sm text-muted-foreground">
            Civil, criminal, writs, bail, NCLT, consumer and all practice areas
          </p>
        </div>
        <Button variant="gold" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Matter
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading matters…</p>
      ) : (
        <MatterTable cases={data?.data ?? []} />
      )}
      <CreateMatterDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
