"use client";

import { useState } from "react";
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
import { useScheduleHearing } from "../api/hooks";
import type { Case } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData: Case;
};

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleHearingDialog({ open, onOpenChange, caseData }: Props) {
  const schedule = useScheduleHearing();
  const [error, setError] = useState<string | null>(null);
  const defaultWhen = new Date();
  defaultWhen.setDate(defaultWhen.getDate() + 1);
  defaultWhen.setHours(10, 30, 0, 0);

  const [form, setForm] = useState({
    title: `${caseData.caseNumber} — Hearing`,
    scheduledAt: toLocalInputValue(defaultWhen),
    purpose: "Arguments",
    courtName: caseData.court,
    judgeName: caseData.bench ?? "",
    courtNumber: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await schedule.mutateAsync({
        caseId: caseData.id,
        title: form.title.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        purpose: form.purpose.trim() || undefined,
        court: {
          name: form.courtName.trim() || undefined,
          judgeName: form.judgeName.trim() || undefined,
          courtNumber: form.courtNumber.trim() || undefined,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule hearing");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Schedule Hearing</DialogTitle>
            <DialogDescription>
              Add a listing for {caseData.caseNumber}. Reminders use the workspace notification service.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Title</span>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Date & time</span>
              <Input
                required
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Purpose</span>
              <Input
                value={form.purpose}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                placeholder="Arguments / Evidence / Mention"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Court</span>
              <Input
                value={form.courtName}
                onChange={(e) => setForm((f) => ({ ...f, courtName: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Court number</span>
              <Input
                value={form.courtNumber}
                onChange={(e) => setForm((f) => ({ ...f, courtNumber: e.target.value }))}
                placeholder="Court 12"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Judge / Bench</span>
              <Input
                value={form.judgeName}
                onChange={(e) => setForm((f) => ({ ...f, judgeName: e.target.value }))}
              />
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={schedule.isPending}>
              {schedule.isPending ? "Scheduling…" : "Schedule hearing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
