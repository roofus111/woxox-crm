"use client";

import { useMemo, useState } from "react";
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
import { useCases, useRegisterEvidence } from "../api/hooks";

const MEDIA_TYPES = [
  "DOCUMENT",
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "CCTV",
  "CALL_RECORD",
  "EMAIL",
  "WHATSAPP_EXPORT",
  "OTHER",
] as const;

const MIME_BY_MEDIA: Record<(typeof MEDIA_TYPES)[number], string> = {
  DOCUMENT: "application/pdf",
  IMAGE: "image/jpeg",
  VIDEO: "video/mp4",
  AUDIO: "audio/mpeg",
  CCTV: "video/mp4",
  CALL_RECORD: "audio/mpeg",
  EMAIL: "text/plain",
  WHATSAPP_EXPORT: "text/plain",
  OTHER: "application/pdf",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCaseId?: string;
};

export function RegisterEvidenceDialog({ open, onOpenChange, defaultCaseId }: Props) {
  const { data: cases } = useCases();
  const register = useRegisterEvidence();
  const [error, setError] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const caseOptions = useMemo(() => cases?.data ?? [], [cases]);

  const [form, setForm] = useState({
    title: "",
    caseId: defaultCaseId ?? "",
    mediaType: "DOCUMENT" as (typeof MEDIA_TYPES)[number],
    filename: "evidence.pdf",
    sizeKb: "250",
    description: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploadUrl(null);
    if (!form.caseId) {
      setError("Select a matter to attach evidence.");
      return;
    }
    try {
      const sizeBytes = Math.max(1, Math.round(Number(form.sizeKb || "1") * 1024));
      const result = await register.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        mediaType: form.mediaType,
        mimeType: MIME_BY_MEDIA[form.mediaType],
        sizeBytes,
        filename: form.filename.trim() || "evidence.bin",
        caseId: form.caseId,
      });
      setUploadUrl(result.upload.uploadUrl);
      setForm((f) => ({ ...f, title: "", description: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register evidence");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Register Evidence</DialogTitle>
            <DialogDescription>
              Creates a private upload intent and custody event. Binary upload uses the host S3 signer.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Title</span>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="CCTV clip — incident night"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Matter</span>
              <Select
                required
                value={form.caseId}
                onChange={(e) => setForm((f) => ({ ...f, caseId: e.target.value }))}
              >
                <option value="">Select matter…</option>
                {caseOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Media type</span>
              <Select
                value={form.mediaType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mediaType: e.target.value as (typeof MEDIA_TYPES)[number],
                  }))
                }
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Size (KB)</span>
              <Input
                type="number"
                min={1}
                value={form.sizeKb}
                onChange={(e) => setForm((f) => ({ ...f, sizeKb: e.target.value }))}
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Filename</span>
              <Input
                value={form.filename}
                onChange={(e) => setForm((f) => ({ ...f, filename: e.target.value }))}
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Notes</span>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Source / how obtained"
              />
            </label>
          </div>

          {uploadUrl && (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-xs break-all">
              <p className="font-medium text-foreground">Upload intent ready</p>
              <p className="mt-1 text-muted-foreground">{uploadUrl}</p>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {uploadUrl ? "Close" : "Cancel"}
            </Button>
            <Button type="submit" variant="gold" disabled={register.isPending}>
              {register.isPending ? "Registering…" : "Create upload intent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
