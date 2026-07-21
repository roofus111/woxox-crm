"use client";

import { use, useEffect, useState } from "react";
import { Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useMatterTeam, useMembers, useUpsertMatterTeam } from "@/features/legal/api";
import { CaseEnterpriseNav } from "@/features/legal/components/CaseEnterpriseNav";
import { MATTER_TEAM_ROLES, mockStaff } from "@/features/legal/utils/enterprise-mock";

export default function MatterTeamPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { data: teamData } = useMatterTeam(caseId);
  const { data: membersData } = useMembers();
  const upsertTeam = useUpsertMatterTeam();

  const staff = membersData ?? mockStaff;
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(MATTER_TEAM_ROLES.map((role) => [role, ""]))
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!teamData) return;
    const next = Object.fromEntries(MATTER_TEAM_ROLES.map((role) => [role, ""])) as Record<
      string,
      string
    >;
    for (const member of teamData) {
      const person =
        staff.find((s) => s.id === member.userId || (s as { userId?: string }).userId === member.userId) ??
        staff.find((s) => s.name === member.userId);
      if (MATTER_TEAM_ROLES.includes(member.role as (typeof MATTER_TEAM_ROLES)[number])) {
        next[member.role] = person?.name ?? member.userId;
      }
    }
    setAssignments(next);
  }, [teamData, staff]);

  const saveTeam = async () => {
    const entries = Object.entries(assignments).filter(([, name]) => name);
    try {
      await Promise.all(
        entries.map(([role, name]) => {
          const person = staff.find((s) => s.name === name);
          const userId = (person as { userId?: string } | undefined)?.userId ?? person?.id ?? name;
          return upsertTeam.mutateAsync({
            caseId,
            userId,
            role,
          });
        })
      );
    } catch {
      // keep local assignments; mocks already shown
    }
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseId} />

      <div>
        <h1 className="font-serif text-2xl font-semibold">Matter Team</h1>
        <p className="text-sm text-muted-foreground">Assign roles for matter {caseId}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Role assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MATTER_TEAM_ROLES.map((role) => (
            <div
              key={role}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <label className="text-sm font-medium">{role}</label>
              <Select
                className="sm:max-w-xs"
                value={assignments[role]}
                onChange={(e) => {
                  setAssignments((prev) => ({ ...prev, [role]: e.target.value }));
                  setSaved(false);
                }}
              >
                <option value="">Unassigned</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.name}>
                    {person.name}
                  </option>
                ))}
              </Select>
            </div>
          ))}

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <Button onClick={saveTeam} disabled={upsertTeam.isPending}>
              <Check className="mr-2 h-4 w-4" />
              Save team
            </Button>
            {saved && (
              <p className="text-sm text-muted-foreground">Team saved locally.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
