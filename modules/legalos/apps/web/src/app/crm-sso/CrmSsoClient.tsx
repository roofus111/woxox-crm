"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/legal/stores/auth.store";

function safeLegalPath(raw: string | null): string {
  if (!raw) return "/legal/dashboard";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (!path.startsWith("/legal")) return "/legal/dashboard";
  return path;
}

/**
 * CRM SSO landing — restores full LegalOS session WITH LegalOS theme/layout/features.
 */
export default function CrmSsoClient() {
  const router = useRouter();
  const params = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    const workspaceId = params.get("workspaceId") || "000000000000000000000001";
    const email = params.get("email") || "crm-user@woxox.local";
    const name = params.get("name") || "CRM User";
    const id = params.get("userId") || "crm-user";
    const next = safeLegalPath(params.get("next"));

    if (!token) {
      setError("Missing SSO token from CRM");
      return;
    }

    setSession({
      token,
      workspaceId,
      user: {
        id,
        email,
        name,
        roles: ["advocate"],
        workspaceIds: [workspaceId],
      },
      // Keep full LegalOS chrome (sidebar, header, dark/gold theme)
      embeddedInCrm: false,
    });

    router.replace(next);
  }, [params, router, setSession]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <h1 className="font-serif text-xl font-semibold">SSO failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Connecting WOXOX CRM → LegalOS…
    </div>
  );
}
