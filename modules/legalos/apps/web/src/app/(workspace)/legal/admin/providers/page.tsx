"use client";

import { ProviderStatusCard } from "@/features/legal/components/ProviderStatusCard";
import { useProviderCapabilities } from "@/features/legal/api/hooks";
import type { ProviderConfig } from "@/features/legal/types";

export default function ProvidersAdminPage() {
  const { data: providers, isLoading } = useProviderCapabilities();

  const cards: ProviderConfig[] = (providers ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    enabled: p.enabled,
    description: p.capabilities.length
      ? `${p.description} Capabilities: ${p.capabilities.join(", ")}.`
      : p.description,
    lastSync: p.lastSync,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Provider Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Credentials, scopes and sync status. Adapters stay disabled without official access.
        </p>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading provider capabilities…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((provider) => (
            <ProviderStatusCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
