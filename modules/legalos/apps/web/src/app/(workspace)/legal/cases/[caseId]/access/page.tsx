"use client";

import { use, useEffect, useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCaseAcl, useMembers, useSetCaseAcl } from "@/features/legal/api";
import { CaseEnterpriseNav } from "@/features/legal/components/CaseEnterpriseNav";
import { ACCESS_LEVELS, mockStaff } from "@/features/legal/utils/enterprise-mock";

type AclMap = Record<string, Record<string, boolean>>;

function emptyAcl(staff: typeof mockStaff): AclMap {
  return Object.fromEntries(
    staff.map((s) => [
      s.id,
      Object.fromEntries(ACCESS_LEVELS.map((level) => [level, false])),
    ])
  );
}

export default function CaseAccessPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { data: aclData } = useCaseAcl(caseId);
  const { data: membersData } = useMembers();
  const setAclMutation = useSetCaseAcl();

  const staff = membersData ?? mockStaff;
  const [acl, setAcl] = useState<AclMap>(() => emptyAcl(mockStaff));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const base = emptyAcl(staff);
    if (aclData) {
      for (const entry of aclData) {
        const person =
          staff.find((s) => s.id === entry.userId || (s as { userId?: string }).userId === entry.userId) ??
          staff.find((s) => s.name === entry.userId);
        const key = person?.id ?? entry.userId;
        if (!base[key]) {
          base[key] = Object.fromEntries(ACCESS_LEVELS.map((level) => [level, false]));
        }
        for (const level of entry.levels) {
          if (ACCESS_LEVELS.includes(level as (typeof ACCESS_LEVELS)[number])) {
            base[key][level] = true;
          }
        }
      }
    }
    setAcl(base);
  }, [aclData, staff]);

  const toggle = (staffId: string, level: string) => {
    setAcl((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [level]: !prev[staffId]?.[level],
      },
    }));
    setSaved(false);
  };

  const saveAcl = async () => {
    const entries = staff
      .map((person) => {
        const levels = ACCESS_LEVELS.filter((level) => acl[person.id]?.[level]);
        const userId = (person as { userId?: string }).userId ?? person.id;
        return { userId, levels: [...levels] };
      })
      .filter((e) => e.levels.length > 0);

    try {
      await setAclMutation.mutateAsync({ caseId, entries });
    } catch {
      // keep local matrix
    }
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseId} />

      <div>
        <h1 className="font-serif text-2xl font-semibold">Case Permission Matrix</h1>
        <p className="text-sm text-muted-foreground">ACL for matter {caseId}</p>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>No one else can see this matter unless listed</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Staff × access levels
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="sticky left-0 bg-card p-2 font-medium">Staff</th>
                {ACCESS_LEVELS.map((level) => (
                  <th key={level} className="p-2 text-center text-xs font-medium whitespace-nowrap">
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((person) => (
                <tr key={person.id} className="border-b border-border">
                  <td className="sticky left-0 bg-card p-2 whitespace-nowrap">
                    <span className="font-medium">{person.name}</span>
                    <span className="block text-xs text-muted-foreground">{person.title}</span>
                  </td>
                  {ACCESS_LEVELS.map((level) => (
                    <td key={level} className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={acl[person.id]?.[level] ?? false}
                        onChange={() => toggle(person.id, level)}
                        aria-label={`${person.name} — ${level}`}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <Button onClick={saveAcl} disabled={setAclMutation.isPending}>
              Save ACL
            </Button>
            {saved && <p className="text-sm text-muted-foreground">ACL saved locally.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
