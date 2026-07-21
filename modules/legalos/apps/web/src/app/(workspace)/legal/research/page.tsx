"use client";

import { ProviderStatusCard } from "@/features/legal/components/ProviderStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProviderConfig } from "@/features/legal/types";

const providers: ProviderConfig[] = [
  {
    id: "scc",
    name: "SCC Online",
    status: "not_configured",
    enabled: false,
    description: "Licensed judgments, citations, acts — enable with API credentials",
  },
  {
    id: "manupatra",
    name: "Manupatra",
    status: "not_configured",
    enabled: false,
    description: "Licensed case law & citation network — enable with API credentials",
  },
];

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Legal Research</h1>
        <p className="text-sm text-muted-foreground">
          Licensed SCC Online & Manupatra search — enabled only with customer credentials
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <ProviderStatusCard key={provider.id} provider={provider} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Research query</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Citation, topic, judge, or bare act…" className="flex-1" />
          <Button disabled title="Requires licensed provider credentials">
            Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
