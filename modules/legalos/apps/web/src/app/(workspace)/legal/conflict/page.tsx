"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConflictCheck } from "@/features/legal/api";
import { mockConflictMatches } from "@/features/legal/utils/enterprise-mock";

function riskVariant(score: number): "destructive" | "warning" | "success" {
  if (score >= 70) return "destructive";
  if (score >= 40) return "warning";
  return "success";
}

function riskLabel(score: number) {
  if (score >= 70) return "High risk";
  if (score >= 40) return "Medium risk";
  return "Low risk";
}

export default function ConflictCheckerPage() {
  const [title, setTitle] = useState("");
  const [parties, setParties] = useState("");
  const [checked, setChecked] = useState(false);
  const [decision, setDecision] = useState<"proceed" | "abort" | null>(null);
  const [matches, setMatches] = useState(mockConflictMatches);
  const [score, setScore] = useState(0);

  const conflictCheck = useConflictCheck();

  const computedFallbackScore = useMemo(() => {
    const strengths = mockConflictMatches.map((m) => m.strength);
    const maxStrength = Math.max(...strengths);
    const weighted =
      strengths.reduce((sum, s, i) => sum + s * (strengths.length - i), 0) /
      strengths.reduce((sum, _, i) => sum + (strengths.length - i), 0);
    return Math.round(Math.max(maxStrength, weighted));
  }, []);

  const runCheck = async () => {
    const partyNames = parties
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    setDecision(null);
    try {
      const result = await conflictCheck.mutateAsync({
        partyNames,
        title: title.trim() || undefined,
      });
      setMatches(result.matches.length ? result.matches : mockConflictMatches);
      setScore(result.score || computedFallbackScore);
    } catch {
      setMatches(mockConflictMatches);
      setScore(computedFallbackScore);
    }
    setChecked(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Smart Conflict Checker</h1>
        <p className="text-sm text-muted-foreground">
          Screen party names against active and historical representations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matter intake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Matter title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WP(C) 482/2024 — Sharma v. State"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Party names</label>
            <textarea
              value={parties}
              onChange={(e) => setParties(e.target.value)}
              placeholder={"One party per line\nRajesh Sharma\nState of Delhi"}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button
            onClick={runCheck}
            disabled={!title.trim() || !parties.trim() || conflictCheck.isPending}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Run Check
          </Button>
        </CardContent>
      </Card>

      {checked && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Conflict score</CardTitle>
              <p className="mt-1 text-3xl font-serif font-semibold tabular-nums">{score}</p>
            </div>
            <Badge variant={riskVariant(score)}>{riskLabel(score)}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {matches.map((match) => (
                <li
                  key={`${match.name}-${match.reason}`}
                  className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{match.name}</p>
                    <p className="text-sm text-muted-foreground">{match.reason}</p>
                  </div>
                  <Badge variant={riskVariant(match.strength)}>{match.strength}</Badge>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                variant={decision === "proceed" ? "default" : "outline"}
                onClick={() => setDecision("proceed")}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Proceed
              </Button>
              <Button
                variant={decision === "abort" ? "destructive" : "outline"}
                onClick={() => setDecision("abort")}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Abort
              </Button>
              {decision && (
                <p className="w-full text-sm text-muted-foreground">
                  Decision recorded locally: {decision === "proceed" ? "Proceed" : "Abort"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
