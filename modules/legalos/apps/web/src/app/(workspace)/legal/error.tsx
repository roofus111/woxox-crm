"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LegalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
      <h2 className="font-serif text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred in LegalOS."}
      </p>
      <Button variant="gold" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
