"use client";

import { useMemo, useState } from "react";
import {
  ACCESS_LEVELS,
  FIRM_TITLES,
  MODULES,
} from "@/features/legal/utils/enterprise-mock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Shield } from "lucide-react";

const MATRIX_LEVELS = ACCESS_LEVELS.filter((l) =>
  ["View Only", "Edit", "Approve", "Delete", "Assign", "Export", "Administration"].includes(l)
);

type MatrixKey = `${string}:${string}`;

function key(module: string, level: string): MatrixKey {
  return `${module}:${level}`;
}

export default function DepartmentAccessControlPage() {
  const [role, setRole] = useState<string>(FIRM_TITLES[0]);
  const [matrix, setMatrix] = useState<Record<MatrixKey, boolean>>({});
  const [savedMsg, setSavedMsg] = useState("");

  const checkedCount = useMemo(
    () => Object.values(matrix).filter(Boolean).length,
    [matrix]
  );

  const toggle = (module: string, level: string) => {
    const k = key(module, level);
    setMatrix((prev) => ({ ...prev, [k]: !prev[k] }));
    setSavedMsg("");
  };

  const handleSave = () => {
    console.log("RBAC save", { role, matrix });
    setSavedMsg("Saved locally — API next");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Department Access Control</h1>
          <p className="text-sm text-muted-foreground">
            Module permissions by firm title · {checkedCount} grants selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            className="w-52"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setSavedMsg("");
            }}
          >
            {FIRM_TITLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Button variant="gold" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      {savedMsg && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {savedMsg}
        </p>
      )}

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-gold">
            <Shield className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">Access matrix — {role}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Module</th>
                {MATRIX_LEVELS.map((level) => (
                  <th key={level} className="px-3 py-3 text-center font-medium">
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => (
                <tr key={mod} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{mod}</td>
                  {MATRIX_LEVELS.map((level) => (
                    <td key={level} className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[hsl(var(--accent))]"
                        checked={!!matrix[key(mod, level)]}
                        onChange={() => toggle(mod, level)}
                        aria-label={`${mod} ${level}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
