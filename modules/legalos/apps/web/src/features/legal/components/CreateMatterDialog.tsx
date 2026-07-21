"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateCase } from "../api/hooks";

const PRACTICE_AREAS = [
  "Civil",
  "Criminal",
  "Family",
  "Property",
  "Consumer",
  "Labour",
  "Company",
  "Arbitration",
  "Tax",
  "NCLT",
  "DRT",
  "NI_ACT",
  "MotorAccident",
  "CyberCrime",
  "IPR",
  "Constitutional",
  "Writ",
  "Appeal",
  "Revision",
  "TransferPetition",
  "SLP",
  "Bail",
  "AnticipatoryBail",
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateMatterDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const createCase = useCreateCase();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    caseNumber: "",
    practiceArea: "Writ",
    courtName: "Delhi High Court",
    judgeName: "",
    summary: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const created = await createCase.mutateAsync({
        title: form.title.trim(),
        caseNumber: form.caseNumber.trim() || undefined,
        practiceArea: form.practiceArea,
        status: "ACTIVE",
        court: {
          name: form.courtName.trim() || undefined,
          judgeName: form.judgeName.trim() || undefined,
        },
        summary: form.summary.trim() || undefined,
      });
      onOpenChange(false);
      setForm({
        title: "",
        caseNumber: "",
        practiceArea: "Writ",
        courtName: "Delhi High Court",
        judgeName: "",
        summary: "",
      });
      router.push(`/legal/cases/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create matter");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Matter</DialogTitle>
            <DialogDescription>
              Register a court matter in the workspace case file.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Title</span>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Sharma vs State of Delhi"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Case number</span>
              <Input
                value={form.caseNumber}
                onChange={(e) => setForm((f) => ({ ...f, caseNumber: e.target.value }))}
                placeholder="WP(C) 482/2024"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Practice area</span>
              <Select
                value={form.practiceArea}
                onChange={(e) => setForm((f) => ({ ...f, practiceArea: e.target.value }))}
              >
                {PRACTICE_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Court</span>
              <Input
                value={form.courtName}
                onChange={(e) => setForm((f) => ({ ...f, courtName: e.target.value }))}
                placeholder="Delhi High Court"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Judge / Bench</span>
              <Input
                value={form.judgeName}
                onChange={(e) => setForm((f) => ({ ...f, judgeName: e.target.value }))}
                placeholder="Hon'ble Justice A. Mehta"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Summary</span>
              <Input
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                placeholder="Brief facts / stage note"
              />
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={createCase.isPending}>
              {createCase.isPending ? "Saving…" : "Create matter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
