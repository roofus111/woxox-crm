"use client";

import { useMemo, useState } from "react";
import {
  mockAppearances,
  type Appearance,
} from "@/features/legal/utils/enterprise-mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Car, Clock, Gavel, Plus, Scale, User } from "lucide-react";

const STATUSES: Appearance["status"][] = [
  "Scheduled",
  "In Court",
  "Completed",
  "Adjourned",
];

function statusVariant(
  status: Appearance["status"]
): "default" | "success" | "warning" | "gold" | "outline" {
  switch (status) {
    case "Scheduled":
      return "gold";
    case "In Court":
      return "warning";
    case "Completed":
      return "success";
    case "Adjourned":
      return "outline";
    default:
      return "default";
  }
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

const emptyForm = () => ({
  matter: "",
  lawyer: "",
  junior: "",
  court: "",
  bench: "",
  judge: "",
  time: "",
  travelMins: "30",
  status: "Scheduled" as Appearance["status"],
  notes: "",
});

export default function CourtAppearanceManagerPage() {
  const [items, setItems] = useState<Appearance[]>(mockAppearances);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((a) => a.status === statusFilter);
  }, [items, statusFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Appearance = {
      id: `a${Date.now()}`,
      matter: form.matter.trim(),
      lawyer: form.lawyer.trim(),
      junior: form.junior.trim() || undefined,
      court: form.court.trim(),
      bench: form.bench.trim(),
      judge: form.judge.trim(),
      time: form.time || new Date().toISOString(),
      travelMins: Number(form.travelMins) || 0,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };
    console.log("New appearance", next);
    setItems((prev) => [next, ...prev]);
    setForm(emptyForm());
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Court Appearance Manager</h1>
          <p className="text-sm text-muted-foreground">
            Hearings, counsel, travel, and courtroom status
          </p>
        </div>
        <Button variant="gold" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Appearance
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No appearances"
          description="Adjust the status filter or schedule a new appearance."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-base">{a.matter}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{a.court}</p>
                </div>
                <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {a.lawyer}
                  {a.junior ? ` · Jr: ${a.junior}` : ""}
                </p>
                <p className="flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5" />
                  {a.bench} · {a.judge}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatWhen(a.time)}
                </p>
                <p className="flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  Travel {a.travelMins} min
                </p>
                {a.notes && (
                  <p className="flex items-start gap-1.5">
                    <Gavel className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {a.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Appearance</DialogTitle>
            <DialogDescription>Schedule a court appearance (local only).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              placeholder="Matter"
              value={form.matter}
              onChange={(e) => setForm((f) => ({ ...f, matter: e.target.value }))}
              required
            />
            <Input
              placeholder="Lawyer"
              value={form.lawyer}
              onChange={(e) => setForm((f) => ({ ...f, lawyer: e.target.value }))}
              required
            />
            <Input
              placeholder="Junior (optional)"
              value={form.junior}
              onChange={(e) => setForm((f) => ({ ...f, junior: e.target.value }))}
            />
            <Input
              placeholder="Court"
              value={form.court}
              onChange={(e) => setForm((f) => ({ ...f, court: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Bench"
                value={form.bench}
                onChange={(e) => setForm((f) => ({ ...f, bench: e.target.value }))}
                required
              />
              <Input
                placeholder="Judge"
                value={form.judge}
                onChange={(e) => setForm((f) => ({ ...f, judge: e.target.value }))}
                required
              />
            </div>
            <Input
              type="datetime-local"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                placeholder="Travel mins"
                value={form.travelMins}
                onChange={(e) => setForm((f) => ({ ...f, travelMins: e.target.value }))}
              />
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as Appearance["status"],
                  }))
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
