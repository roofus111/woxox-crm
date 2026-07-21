"use client";

import { use, useMemo } from "react";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRelationshipGraph } from "@/features/legal/api";
import { CaseEnterpriseNav } from "@/features/legal/components/CaseEnterpriseNav";
import { mockGraph } from "@/features/legal/utils/enterprise-mock";

const TYPE_COLORS: Record<string, string> = {
  Client: "bg-sky-100 text-sky-900 border-sky-200",
  Opposite: "bg-rose-100 text-rose-900 border-rose-200",
  FIR: "bg-amber-100 text-amber-900 border-amber-200",
  Fir: "bg-amber-100 text-amber-900 border-amber-200",
  Matter: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Case: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Advocate: "bg-violet-100 text-violet-900 border-violet-200",
  Police: "bg-slate-100 text-slate-900 border-slate-200",
  Witness: "bg-indigo-100 text-indigo-900 border-indigo-200",
  Complaint: "bg-orange-100 text-orange-900 border-orange-200",
};

const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 130;

export default function RelationshipGraphPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const { data: graphData } = useRelationshipGraph(caseId);
  const graph = graphData ?? mockGraph;

  const positions = useMemo(() => {
    const n = graph.nodes.length || 1;
    return Object.fromEntries(
      graph.nodes.map((node, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        return [
          node.id,
          { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) },
        ];
      })
    ) as Record<string, { x: number; y: number }>;
  }, [graph.nodes]);

  const labelById = Object.fromEntries(graph.nodes.map((n) => [n.id, n.label]));

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseId} />

      <div>
        <h1 className="font-serif text-2xl font-semibold">Relationship Graph</h1>
        <p className="text-sm text-muted-foreground">
          Parties, counsel, and linked records for {caseId}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4" />
            Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative mx-auto w-full max-w-md">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full">
              {graph.edges.map((edge) => {
                const from = positions[edge.from];
                const to = positions[edge.to];
                if (!from || !to) return null;
                return (
                  <g key={`${edge.from}-${edge.to}-${edge.label}`}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth={1.5}
                    />
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px]"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}
              {graph.nodes.map((node) => {
                const pos = positions[node.id];
                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={28}
                      className="fill-card stroke-border"
                      strokeWidth={1.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      className="fill-foreground text-[9px] font-medium"
                    >
                      {node.label.length > 14 ? `${node.label.slice(0, 12)}…` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {graph.nodes.map((node) => (
              <span
                key={node.id}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  TYPE_COLORS[node.type] ?? "bg-muted text-foreground border-border"
                }`}
              >
                {node.label}
                <Badge variant="outline" className="ml-2 border-0 bg-white/50 text-[10px]">
                  {node.type}
                </Badge>
              </span>
            ))}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Edges</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {graph.edges.map((edge) => (
                <li key={`${edge.from}-${edge.to}-${edge.label}`}>
                  <span className="text-foreground">{labelById[edge.from]}</span>
                  {" → "}
                  <span className="text-foreground">{labelById[edge.to]}</span>
                  <span className="ml-2 text-xs">({edge.label})</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
