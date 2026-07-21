"use client";

import { useEffect, useMemo, useState } from "react";
import { useCreateTimeEntry, useTimeEntries } from "@/features/legal/api";
import { mockTimeEntries } from "@/features/legal/utils/enterprise-mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Clock, Plus } from "lucide-react";

const ACTIVITIES = [
  "Research",
  "Drafting",
  "Court",
  "Travel",
  "Meeting",
  "Phone",
  "Video",
] as const;

type TimeEntry = (typeof mockTimeEntries)[number];

export default function TimeRecordingPage() {
  const { data: timeData } = useTimeEntries();
  const createTime = useCreateTimeEntry();

  const [entries, setEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    matter: "",
    activity: ACTIVITIES[0] as string,
    minutes: "60",
    billable: true,
  });

  useEffect(() => {
    if (timeData) setEntries(timeData);
  }, [timeData]);

  const billableMinutes = useMemo(
    () => entries.filter((e) => e.billable).reduce((sum, e) => sum + e.minutes, 0),
    [entries]
  );

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = Number(form.minutes) || 0;
    const matter = form.matter.trim();
    const occurredAt = new Date().toISOString();
    try {
      const created = await createTime.mutateAsync({
        activity: form.activity,
        minutes,
        billable: form.billable,
        occurredAt,
        notes: matter,
      });
      setEntries((prev) => [
        {
          ...created,
          matter: matter || created.matter,
        },
        ...prev,
      ]);
    } catch {
      const next: TimeEntry = {
        id: `t${Date.now()}`,
        matter,
        activity: form.activity,
        minutes,
        billable: form.billable,
        when: occurredAt.slice(0, 10),
        by: "You",
      };
      setEntries((prev) => [next, ...prev]);
    }
    setForm({ matter: "", activity: ACTIVITIES[0], minutes: "60", billable: true });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Time Recording</h1>
          <p className="text-sm text-muted-foreground">
            Track matter time · Invoicing stays in WOXOX Billing
          </p>
        </div>
        <Button variant="gold" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Log time
        </Button>
      </div>

      <Card className="border-border bg-navy text-gold">
        <CardContent className="flex items-center gap-3 p-5">
          <Clock className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Billable total</p>
            <p className="font-serif text-2xl font-semibold">
              {billableMinutes} min
              <span className="ml-2 text-sm font-normal text-gold/80">
                ({(billableMinutes / 60).toFixed(1)} hrs)
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <EmptyState title="No time entries" description="Log your first matter time entry." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Matter</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium">By</th>
                  <th className="px-4 py-3 font-medium text-right">Minutes</th>
                  <th className="px-4 py-3 font-medium">Billable</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{row.when}</td>
                    <td className="px-4 py-3 font-medium">{row.matter}</td>
                    <td className="px-4 py-3">{row.activity}</td>
                    <td className="px-4 py-3">{row.by}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.minutes}</td>
                    <td className="px-4 py-3">
                      <Badge variant={row.billable ? "gold" : "outline"}>
                        {row.billable ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Log time</DialogTitle>
            <DialogDescription>
              Record time against a matter. Billing invoices live in WOXOX Billing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLog} className="space-y-3">
            <Input
              placeholder="Matter"
              value={form.matter}
              onChange={(e) => setForm((f) => ({ ...f, matter: e.target.value }))}
              required
            />
            <Select
              value={form.activity}
              onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))}
            >
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min={1}
              placeholder="Minutes"
              value={form.minutes}
              onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))}
              required
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--accent))]"
                checked={form.billable}
                onChange={(e) => setForm((f) => ({ ...f, billable: e.target.checked }))}
              />
              Billable
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={createTime.isPending}>
                Log time
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
