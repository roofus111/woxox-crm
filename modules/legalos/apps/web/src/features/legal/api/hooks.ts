"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiTask } from "../types";
import { legalApi } from "./legalApi";

export const legalQueryKeys = {
  dashboard: ["legal", "dashboard"] as const,
  cases: ["legal", "cases"] as const,
  case: (id: string) => ["legal", "cases", id] as const,
  complaints: ["legal", "complaints"] as const,
  complaint: (id: string) => ["legal", "complaints", id] as const,
  firs: ["legal", "firs"] as const,
  fir: (id: string) => ["legal", "firs", id] as const,
  hearings: (params?: { from?: string; to?: string; q?: string }) =>
    ["legal", "hearings", params] as const,
  evidence: ["legal", "evidence"] as const,
  filings: ["legal", "filings"] as const,
  filing: (id: string) => ["legal", "filings", id] as const,
  knowledge: (params?: { category?: string; search?: string }) => ["legal", "knowledge", params] as const,
  notifications: ["legal", "notifications"] as const,
  providers: ["legal", "providers"] as const,
  branches: ["legal", "org", "branches"] as const,
  members: ["legal", "org", "members"] as const,
  caseAcl: (caseId: string) => ["legal", "cases", caseId, "acl"] as const,
  matterTeam: (caseId: string) => ["legal", "cases", caseId, "team"] as const,
  warRoom: (caseId: string) => ["legal", "cases", caseId, "war-room"] as const,
  relationshipGraph: (caseId: string) => ["legal", "cases", caseId, "graph"] as const,
  timeEntries: (params?: { caseId?: string; userId?: string }) =>
    ["legal", "time-entries", params] as const,
  workflows: (params?: { caseId?: string }) => ["legal", "workflows", params] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: legalQueryKeys.dashboard,
    queryFn: () => legalApi.getDashboard(),
    staleTime: 60_000,
  });
}

export function useCases(params?: { status?: string }) {
  return useQuery({
    queryKey: [...legalQueryKeys.cases, params],
    queryFn: () => legalApi.getCases(params),
    staleTime: 30_000,
  });
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: legalQueryKeys.case(caseId),
    queryFn: () => legalApi.getCaseById(caseId),
    enabled: !!caseId,
  });
}

export function useComplaints() {
  return useQuery({
    queryKey: legalQueryKeys.complaints,
    queryFn: () => legalApi.getComplaints(),
    staleTime: 30_000,
  });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: legalQueryKeys.complaint(id),
    queryFn: () => legalApi.getComplaintById(id),
    enabled: !!id,
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      status?: string;
      nextFollowUpAt?: string | null;
      escalation?: boolean;
      notes?: string;
    }) => {
      const { id, ...body } = input;
      return legalApi.updateComplaint(id, body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.complaints });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.complaint(vars.id) });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.notifications });
    },
  });
}

export function useConvertComplaintToFir() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: string | { id: string; policeStation?: string }) => {
      if (typeof input === "string") {
        return legalApi.convertComplaintToFir(input);
      }
      return legalApi.convertComplaintToFir(input.id, input.policeStation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.complaints });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.firs });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.dashboard });
    },
  });
}

export function useFirs() {
  return useQuery({
    queryKey: legalQueryKeys.firs,
    queryFn: () => legalApi.getFirs(),
    staleTime: 30_000,
  });
}

export function useFir(id: string) {
  return useQuery({
    queryKey: legalQueryKeys.fir(id),
    queryFn: () => legalApi.getFirById(id),
    enabled: !!id,
  });
}

export function useUpdateFir() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      status?: string;
      bailStatus?: string;
      chargeSheet?: { filedAt?: string; referenceNumber?: string; notes?: string };
      investigationOfficer?: string;
      summary?: string;
    }) => {
      const { id, ...body } = input;
      return legalApi.updateFir(id, body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.firs });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.fir(vars.id) });
    },
  });
}

export function useHearings(params?: { from?: string; to?: string; caseId?: string; q?: string }) {
  return useQuery({
    queryKey: legalQueryKeys.hearings(params),
    queryFn: () => legalApi.getHearings(params),
    staleTime: 30_000,
  });
}

export function useEvidence() {
  return useQuery({
    queryKey: legalQueryKeys.evidence,
    queryFn: () => legalApi.getEvidence(),
    staleTime: 30_000,
  });
}

export function useSealEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; sha256?: string; notes?: string }) =>
      legalApi.sealEvidence(input.id, { sha256: input.sha256, notes: input.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.evidence });
    },
  });
}

export function useFilings(params?: { caseId?: string; status?: string }) {
  return useQuery({
    queryKey: [...legalQueryKeys.filings, params],
    queryFn: () => legalApi.getFilings(params),
    staleTime: 30_000,
  });
}

export function useCreateFiling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.createFiling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.filings });
    },
  });
}

export function useUpdateFiling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; title?: string; status?: string; diaryNumber?: string }) => {
      const { id, ...body } = input;
      return legalApi.updateFiling(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.filings });
    },
  });
}

export function useKnowledge(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: legalQueryKeys.knowledge(params),
    queryFn: () => legalApi.getKnowledge(params),
    staleTime: 30_000,
  });
}

export function useCreateKnowledge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.createKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.knowledge() });
    },
  });
}

export function useUpdateKnowledge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      title?: string;
      category?: string;
      body?: string;
      tags?: string[];
    }) => {
      const { id, ...body } = input;
      return legalApi.updateKnowledge(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.knowledge() });
    },
  });
}

export function useBookmarkKnowledge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => legalApi.bookmarkKnowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.knowledge() });
    },
  });
}

export function useFiling(id: string) {
  return useQuery({
    queryKey: legalQueryKeys.filing(id),
    queryFn: () => legalApi.getFilingById(id),
    enabled: !!id,
  });
}

export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: [...legalQueryKeys.notifications, { unreadOnly }],
    queryFn: () => legalApi.getNotificationFeed({ unreadOnly }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useNotificationFeed(unreadOnly?: boolean) {
  return useNotifications(unreadOnly);
}

export function useProviderCapabilities() {
  return useQuery({
    queryKey: legalQueryKeys.providers,
    queryFn: () => legalApi.getProviderCapabilities(),
    staleTime: 60_000,
  });
}

export function useCreateAiRequest() {
  return useMutation({
    mutationFn: (input: { task: AiTask; prompt?: string; caseId?: string; redact?: boolean }) =>
      legalApi.createAiRequest(input),
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.cases });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.dashboard });
    },
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.complaints });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.dashboard });
    },
  });
}

export function useScheduleHearing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      caseId: string;
      title: string;
      scheduledAt: string;
      purpose?: string;
      court?: { name?: string; judgeName?: string; courtNumber?: string; bench?: string };
      notes?: string;
    }) => {
      const { caseId, ...body } = input;
      return legalApi.scheduleHearing(caseId, body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.case(vars.caseId) });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.cases });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.hearings() });
    },
  });
}

export function useRegisterEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.registerEvidence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.evidence });
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.dashboard });
    },
  });
}

export function useBranches() {
  return useQuery({
    queryKey: legalQueryKeys.branches,
    queryFn: () => legalApi.listBranches(),
    staleTime: 30_000,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.branches });
    },
  });
}

export function useMembers() {
  return useQuery({
    queryKey: legalQueryKeys.members,
    queryFn: () => legalApi.listMembers(),
    staleTime: 30_000,
  });
}

export function useUpsertMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.upsertMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.members });
    },
  });
}

export function useCaseAcl(caseId: string) {
  return useQuery({
    queryKey: legalQueryKeys.caseAcl(caseId),
    queryFn: () => legalApi.getCaseAcl(caseId),
    enabled: !!caseId,
  });
}

export function useSetCaseAcl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      caseId: string;
      entries: { userId: string; levels: string[] }[];
    }) => legalApi.setCaseAcl(input.caseId, { entries: input.entries }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.caseAcl(vars.caseId) });
    },
  });
}

export function useMatterTeam(caseId: string) {
  return useQuery({
    queryKey: legalQueryKeys.matterTeam(caseId),
    queryFn: () => legalApi.listMatterTeam(caseId),
    enabled: !!caseId,
  });
}

export function useUpsertMatterTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      caseId: string;
      userId: string;
      role: string;
      responsibilities?: string;
    }) => {
      const { caseId, ...body } = input;
      return legalApi.upsertMatterTeamMember(caseId, body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.matterTeam(vars.caseId) });
    },
  });
}

export function useWarRoom(caseId: string) {
  return useQuery({
    queryKey: legalQueryKeys.warRoom(caseId),
    queryFn: () => legalApi.listWarRoom(caseId),
    enabled: !!caseId,
  });
}

export function useCreateWarRoomEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      caseId: string;
      type: string;
      body: string;
      title?: string;
      pinned?: boolean;
    }) => {
      const { caseId, ...body } = input;
      return legalApi.createWarRoomEntry(caseId, body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.warRoom(vars.caseId) });
    },
  });
}

export function useConflictCheck() {
  return useMutation({
    mutationFn: (input: { partyNames: string[]; title?: string }) =>
      legalApi.runConflictCheck(input),
  });
}

export function useRelationshipGraph(caseId: string) {
  return useQuery({
    queryKey: legalQueryKeys.relationshipGraph(caseId),
    queryFn: () => legalApi.getRelationshipGraph(caseId),
    enabled: !!caseId,
  });
}

export function useTimeEntries(params?: { caseId?: string; userId?: string }) {
  return useQuery({
    queryKey: legalQueryKeys.timeEntries(params),
    queryFn: () => legalApi.listTimeEntries(params),
    staleTime: 30_000,
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.timeEntries() });
    },
  });
}

export function useWorkflows(params?: { caseId?: string }) {
  return useQuery({
    queryKey: legalQueryKeys.workflows(params),
    queryFn: () => legalApi.listWorkflows(params),
    staleTime: 30_000,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: legalApi.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.workflows() });
    },
  });
}

export function useAdvanceWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; body?: string; approve?: boolean }) => {
      const { id, ...body } = input;
      return legalApi.advanceWorkflow(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalQueryKeys.workflows() });
    },
  });
}
