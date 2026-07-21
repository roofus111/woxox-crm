"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";
import type { ProviderConfig } from "../types";
import { statusLabels, statusVariant } from "../utils/constants";
import { Plug, RefreshCw, Settings } from "lucide-react";

interface ProviderStatusCardProps {
  provider: ProviderConfig;
}

export function ProviderStatusCard({ provider }: ProviderStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted text-navy dark:text-gold">
              <Plug className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{provider.name}</CardTitle>
              <CardDescription>{provider.description}</CardDescription>
            </div>
          </div>
          <Badge variant={statusVariant(provider.status)}>{statusLabels[provider.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {provider.lastSync ? (
              <>Last sync: {formatDate(provider.lastSync)} {formatTime(provider.lastSync)}</>
            ) : (
              <>Not yet configured</>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!provider.enabled}>
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
