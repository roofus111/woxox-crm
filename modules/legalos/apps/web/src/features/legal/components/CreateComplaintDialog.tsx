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
import { useCreateComplaint } from "../api/hooks";

const CATEGORIES = [
  "THEFT",
  "ASSAULT",
  "FRAUD",
  "DOMESTIC_VIOLENCE",
  "CYBER",
  "PROPERTY_DISPUTE",
  "HARASSMENT",
  "OTHER",
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateComplaintDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const createComplaint = useCreateComplaint();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    complaintNumber: "",
    category: "FRAUD",
    policeStation: "",
    location: "",
    description: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const year = new Date().getFullYear();
      const created = await createComplaint.mutateAsync({
        complaintNumber:
          form.complaintNumber.trim() ||
          `CMP/${year}/${String(Math.floor(Math.random() * 90000) + 10000)}`,
        category: form.category,
        policeStation: form.policeStation.trim() || undefined,
        location: form.location.trim() || undefined,
        description: form.description.trim() || undefined,
        status: "REGISTERED",
      });
      onOpenChange(false);
      setForm({
        complaintNumber: "",
        category: "FRAUD",
        policeStation: "",
        location: "",
        description: "",
      });
      router.push(`/legal/complaints/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register complaint");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Register Complaint</DialogTitle>
            <DialogDescription>
              Independent Complaint Register — tracks matters before FIR registration.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Complaint number (optional)
              </span>
              <Input
                value={form.complaintNumber}
                onChange={(e) => setForm((f) => ({ ...f, complaintNumber: e.target.value }))}
                placeholder="Auto-generated if blank"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <Select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Police station</span>
              <Input
                value={form.policeStation}
                onChange={(e) => setForm((f) => ({ ...f, policeStation: e.target.value }))}
                placeholder="Connaught Place"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Location</span>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Incident location"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Description</span>
              <Input
                required
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief statement of facts"
              />
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={createComplaint.isPending}>
              {createComplaint.isPending ? "Saving…" : "Register complaint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
