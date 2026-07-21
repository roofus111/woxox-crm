import { Suspense } from "react";
import CrmSsoClient from "./CrmSsoClient";

export default function CrmSsoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Connecting WOXOX CRM → LegalOS…
        </div>
      }
    >
      <CrmSsoClient />
    </Suspense>
  );
}
