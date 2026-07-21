"use client";

import { useParams } from "next/navigation";
import { CaseWorkbench } from "@/features/legal/components/CaseWorkbench";
import { useCase } from "@/features/legal/api/hooks";
import { Button } from "@/components/ui/button";

export default function CaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const { data, isLoading, isError, error, refetch } = useCase(params.caseId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading case file…</p>;
  }

  if (isError) {
    const status = (error as { status?: number } | undefined)?.status;
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-3 py-12">
        <h2 className="font-serif text-xl font-semibold">
          {status === 403 ? "Access denied" : "Unable to load matter"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {status === 403
            ? "You do not have permission to view this case file."
            : error instanceof Error
              ? error.message
              : "Something went wrong."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Matter not found.</p>;
  }

  return <CaseWorkbench caseData={data} />;
}
