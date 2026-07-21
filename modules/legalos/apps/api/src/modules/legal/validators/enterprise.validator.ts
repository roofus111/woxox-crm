import { z } from 'zod';
import {
  ACCESS_LEVELS,
  FIRM_DEPARTMENTS,
  FIRM_TITLES,
  MATTER_TEAM_ROLES,
  WAR_ROOM_ENTRY_TYPES,
} from '../enums.js';
import { DOCUMENT_WORKFLOW_STEPS } from '../models/document-workflow.model.js';
import { TIME_ENTRY_ACTIVITIES } from '../models/time-entry.model.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createBranchDto = z
  .object({
    name: z.string().trim().min(1).max(200),
    code: z.string().trim().min(1).max(32),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    isHeadOffice: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const updateBranchDto = createBranchDto.partial().strict();

export const upsertMemberDto = z
  .object({
    userId: z.string().trim().min(1),
    branchId: objectId.optional().nullable(),
    title: z.enum(FIRM_TITLES),
    department: z.enum(FIRM_DEPARTMENTS),
    accessLevels: z.array(z.enum(ACCESS_LEVELS)).default([]),
    moduleAccess: z
      .array(
        z
          .object({
            module: z.string().trim().min(1),
            levels: z.array(z.enum(ACCESS_LEVELS)),
          })
          .strict(),
      )
      .optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const setCaseAclDto = z
  .object({
    entries: z.array(
      z
        .object({
          userId: z.string().trim().min(1),
          levels: z.array(z.enum(ACCESS_LEVELS)).min(1),
        })
        .strict(),
    ),
  })
  .strict();

export const upsertTeamMemberDto = z
  .object({
    userId: z.string().trim().min(1),
    role: z.enum(MATTER_TEAM_ROLES),
    responsibilities: z.string().trim().max(2000).optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const createWarRoomEntryDto = z
  .object({
    type: z.enum(WAR_ROOM_ENTRY_TYPES),
    title: z.string().trim().max(300).optional(),
    body: z.string().trim().min(1).max(20000),
    parentId: objectId.optional(),
    pinned: z.boolean().optional(),
  })
  .strict();

export const conflictCheckDto = z
  .object({
    partyNames: z.array(z.string().trim().min(1)).min(1),
    partyIds: z.array(objectId).optional(),
    title: z.string().trim().max(300).optional(),
    caseId: objectId.optional(),
  })
  .strict();

export const createTimeEntryDto = z
  .object({
    caseId: objectId.optional(),
    activity: z.enum(TIME_ENTRY_ACTIVITIES),
    minutes: z.number().int().min(1),
    billable: z.boolean().optional(),
    notes: z.string().max(5000).optional(),
    occurredAt: z.coerce.date(),
    userId: z.string().trim().min(1).optional(),
  })
  .strict();

export const createWorkflowDto = z
  .object({
    caseId: objectId,
    title: z.string().trim().min(1).max(300),
    body: z.string().min(1),
    currentStep: z.enum(DOCUMENT_WORKFLOW_STEPS).optional(),
  })
  .strict();

export const advanceWorkflowDto = z
  .object({
    body: z.string().min(1).optional(),
    approve: z.boolean().optional(),
  })
  .strict();

export type CreateBranchInput = z.infer<typeof createBranchDto>;
export type UpdateBranchInput = z.infer<typeof updateBranchDto>;
export type UpsertMemberInput = z.infer<typeof upsertMemberDto>;
export type SetCaseAclInput = z.infer<typeof setCaseAclDto>;
export type UpsertTeamMemberInput = z.infer<typeof upsertTeamMemberDto>;
export type CreateWarRoomEntryInput = z.infer<typeof createWarRoomEntryDto>;
export type ConflictCheckInput = z.infer<typeof conflictCheckDto>;
export type CreateTimeEntryInput = z.infer<typeof createTimeEntryDto>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowDto>;
export type AdvanceWorkflowInput = z.infer<typeof advanceWorkflowDto>;

export const branchIdParams = z.object({ id: objectId }).strict();
export const caseIdOnlyParams = z.object({ caseId: objectId }).strict();
export const warRoomEntryIdParams = z.object({ id: objectId }).strict();
export const workflowIdParams = z.object({ id: objectId }).strict();
export const teamMemberParams = z
  .object({
    caseId: objectId,
    userId: z.string().trim().min(1),
  })
  .strict();
export const pinWarRoomDto = z.object({ pinned: z.boolean() }).strict();
export const timeEntryQuery = z
  .object({
    caseId: objectId.optional(),
    userId: z.string().trim().min(1).optional(),
  })
  .strict();
export const workflowQuery = z.object({ caseId: objectId.optional() }).strict();
export const caseAccessQuery = z
  .object({
    minLevel: z.enum(ACCESS_LEVELS).optional(),
  })
  .strict();
