"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFirs } from "@/features/legal/api/hooks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { statusLabels, statusVariant } from "@/features/legal/utils/constants";
import { Search, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export default function FirsPage() {
  const { data, isLoading } = useFirs();
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (f) =>
        f.firNumber.toLowerCase().includes(q) ||
        f.policeStation.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.investigatingOfficer.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">FIR Register</h1>
          <p className="text-sm text-muted-foreground">
            Police station, sections, charge sheet, bail, court transfer, complaint lineage
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FIRs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading FIRs…</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((fir) => (
            <Link key={fir.id} href={`/legal/firs/${fir.id}`}>
              <Card
                className={cn(
                  "transition-shadow hover:shadow-card",
                  highlight === fir.id && "ring-2 ring-accent"
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted text-navy dark:text-gold">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-serif text-lg">{fir.firNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {fir.policeStation}
                        {fir.district ? ` · ${fir.district}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={statusVariant(fir.status)}>{statusLabels[fir.status] ?? fir.status}</Badge>
                    {fir.bailStatus && (
                      <Badge variant={statusVariant(fir.bailStatus)}>
                        Bail: {statusLabels[fir.bailStatus] ?? fir.bailStatus}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Sections:</span> {(fir.sections ?? []).join(", ")}
                  </p>
                  <p>
                    <span className="text-muted-foreground">IO:</span> {fir.investigatingOfficer}
                  </p>
                  {fir.chargeSheet?.referenceNumber && (
                    <p className="text-accent">Charge sheet: {fir.chargeSheet.referenceNumber}</p>
                  )}
                  <p className="text-muted-foreground">Registered {formatDate(fir.registeredAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
