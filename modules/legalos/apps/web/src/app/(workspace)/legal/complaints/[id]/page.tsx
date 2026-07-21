"use client";

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
import { useComplaint, useConvertComplaintToFir, useUpdateComplaint } from "@/features/legal/api/hooks";
import { statusLabels, statusVariant } from "@/features/legal/utils/constants";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, ArrowRightLeft, CalendarClock, Shield, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: complaint, isLoading } = useComplaint(id);
  const convertMutation = useConvertComplaintToFir();
  const updateMutation = useUpdateComplaint();
  const [showConvert, setShowConvert] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  const handleConvert = async () => {
    if (!complaint) return;
    const fir = await convertMutation.mutateAsync({
      id,
      policeStation: complaint.policeStation,
    });
    setShowConvert(false);
    router.push(`/legal/firs?highlight=${fir.id}`);
  };

  const handleFollowUp = async () => {
    if (!followUpDate) return;
    await updateMutation.mutateAsync({
      id,
      nextFollowUpAt: new Date(followUpDate).toISOString(),
    });
  };

  const handleEscalate = async () => {
    await updateMutation.mutateAsync({ id, escalation: true });
  };

  if (isLoading) return <p className="text-muted-foreground">Loading complaint…</p>;
  if (!complaint) return <p className="text-muted-foreground">Complaint not found.</p>;

  const canConvert = complaint.status !== "converted_to_fir" && complaint.status !== "closed";

  return (
    <div className="space-y-6">
      <Link href="/legal/complaints" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Register
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold">{complaint.complaintNumber}</h1>
            <Badge variant={statusVariant(complaint.status)}>{statusLabels[complaint.status]}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{complaint.subject}</p>
        </div>
        {canConvert && (
          <Button variant="gold" size="lg" onClick={() => setShowConvert(true)}>
            <ArrowRightLeft className="h-5 w-5" />
            Convert to FIR
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Complainant</span>
              <span className="font-medium">{complaint.complainant}</span>
            </div>
            {complaint.respondent && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Respondent</span>
                <span>{complaint.respondent}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Category</span>
              <span>{complaint.category}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Registered</span>
              <span>{formatDate(complaint.registeredAt)}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Police Station</span>
              <span>{complaint.policeStation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">District</span>
              <span>{complaint.district}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{complaint.description}</p>
            {complaint.assignedOfficer && (
              <p className="mt-4 text-sm text-muted-foreground">
                Assigned Officer: {complaint.assignedOfficer}
              </p>
            )}
            {complaint.firId && (
              <Link href={`/legal/firs/${complaint.firId}`}>
                <Badge variant="success" className="mt-4 cursor-pointer">
                  View Linked FIR
                </Badge>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Follow-up & Escalation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complaint.nextFollowUpAt && (
            <p className="text-sm text-muted-foreground">
              Next follow-up: {formatDate(complaint.nextFollowUpAt)}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Set follow-up date</label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleFollowUp}
              disabled={!followUpDate || updateMutation.isPending}
            >
              <CalendarClock className="h-4 w-4" />
              {updateMutation.isPending ? "Saving…" : "Set Follow-up"}
            </Button>
            <Button
              variant="gold"
              onClick={handleEscalate}
              disabled={updateMutation.isPending || complaint.status === "converted_to_fir"}
            >
              <TrendingUp className="h-4 w-4" />
              Escalate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConvert} onOpenChange={setShowConvert}>
        <DialogContent onClose={() => setShowConvert(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Convert Complaint to FIR
            </DialogTitle>
            <DialogDescription>
              Register FIR {complaint.complaintNumber} at {complaint.policeStation}. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Ensure inquiry is complete and cognizable offence is established under CrPC before proceeding.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvert(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleConvert} disabled={convertMutation.isPending}>
              {convertMutation.isPending ? "Registering…" : "Confirm — Register FIR"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
