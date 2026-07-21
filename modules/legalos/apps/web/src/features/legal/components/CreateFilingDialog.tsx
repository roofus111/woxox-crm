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
import { Select } from "@/components/ui/select";
import { useCases, useCreateFiling } from "../api/hooks";

const FILING_TYPES = [
  { value: "petition", label: "Petition" },
  { value: "application", label: "Application" },
  { value: "reply", label: "Reply" },
  { value: "affidavit", label: "Affidavit" },
  { value: "vakalatnama", label: "Vakalatnama" },
  { value: "written_statement", label: "Written Statement" },
  { value: "interim_application", label: "Interim Application" },
  { value: "other", label: "Other" },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateFilingDialog({ open, onOpenChange }: Props) {
  const { data: casesData } = useCases();
  const createFiling = useCreateFiling();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    caseId: "",
    title: "",
    filingType: "petition",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.caseId) {
      setError("Select a matter");
      return;
    }
    try {
      await createFiling.mutateAsync({
        caseId: form.caseId,
        title: form.title.trim(),
        filingType: form.filingType,
      });
      onOpenChange(false);
      setForm({ caseId: "", title: "", filingType: "petition" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create filing");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Court Filing</DialogTitle>
            <DialogDescription>Register a filing against an active matter.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Matter</label>
              <Select
                value={form.caseId}
                onChange={(e) => setForm((f) => ({ ...f, caseId: e.target.value }))}
                required
              >
                <option value="">Select matter…</option>
                {(casesData?.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Written submissions — Final arguments"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Filing type</label>
              <Select
                value={form.filingType}
                onChange={(e) => setForm((f) => ({ ...f, filingType: e.target.value }))}
              >
                {FILING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={createFiling.isPending}>
              {createFiling.isPending ? "Creating…" : "Create Filing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
