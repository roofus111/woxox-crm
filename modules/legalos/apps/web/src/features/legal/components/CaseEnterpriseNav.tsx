"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Overview", path: "" },
  { label: "Team", path: "/team" },
  { label: "Access", path: "/access" },
  { label: "War Room", path: "/war-room" },
  { label: "Graph", path: "/graph" },
  { label: "Timeline", path: "/timeline" },
  { label: "Risk", path: "/risk" },
  { label: "Hearing Prep", path: "/hearing-prep" },
] as const;

export function CaseEnterpriseNav({ caseId }: { caseId: string }) {
  const pathname = usePathname();
  const base = `/legal/cases/${caseId}`;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
      {LINKS.map((link) => {
        const href = `${base}${link.path}`;
        const active =
          link.path === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href);

        return (
          <Link
            key={link.label}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
