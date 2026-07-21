import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface KpiStatProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function KpiStat({ label, value, icon: Icon, trend, className }: KpiStatProps) {
  const up = trend && trend.value >= 0;

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 shadow-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-muted text-navy dark:text-gold">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend && (
        <div className={cn("mt-2 flex items-center gap-1 text-xs", up ? "text-emerald-600" : "text-red-600")}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
