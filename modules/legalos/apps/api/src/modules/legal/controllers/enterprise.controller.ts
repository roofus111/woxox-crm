import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import type { AccessLevel } from '../enums.js';
import { enterpriseService } from '../services/enterprise.service.js';
import type {
  AdvanceWorkflowInput,
  ConflictCheckInput,
  CreateBranchInput,
  CreateTimeEntryInput,
  CreateWarRoomEntryInput,
  CreateWorkflowInput,
  SetCaseAclInput,
  UpdateBranchInput,
  UpsertMemberInput,
  UpsertTeamMemberInput,
} from '../validators/enterprise.validator.js';

async function requireCaseView(req: Request, caseId: string) {
  await enterpriseService.assertCaseAccess(
    req.workspace!.id,
    caseId,
    req.user!.id,
    req.user!.permissions ?? [],
    'VIEW',
  );
}

async function requireCaseEdit(req: Request, caseId: string) {
  await enterpriseService.assertCaseAccess(
    req.workspace!.id,
    caseId,
    req.user!.id,
    req.user!.permissions ?? [],
    'EDIT',
  );
}

export async function listBranches(req: Request, res: Response) {
  const items = await enterpriseService.listBranches(req.workspace!.id);
  return sendOk(res, items);
}

export async function createBranch(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await enterpriseService.createBranch(ctx, req.validatedBody as CreateBranchInput);
  return sendCreated(res, entity);
}

export async function updateBranch(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await enterpriseService.updateBranch(
    ctx,
    id,
    req.validatedBody as UpdateBranchInput,
  );
  return sendOk(res, entity);
}

export async function listMembers(req: Request, res: Response) {
  const items = await enterpriseService.listMembers(req.workspace!.id);
  return sendOk(res, items);
}

export async function upsertMember(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await enterpriseService.upsertMember(ctx, req.validatedBody as UpsertMemberInput);
  return sendOk(res, entity);
}

export async function getCaseAcl(req: Request, res: Response) {
  const { caseId } = req.validatedParams as { caseId: string };
  await requireCaseView(req, caseId);
  const items = await enterpriseService.getCaseAcl(req.workspace!.id, caseId);
  return sendOk(res, items);
}

export async function setCaseAcl(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { caseId } = req.validatedParams as { caseId: string };
  await enterpriseService.assertCaseAccess(
    req.workspace!.id,
    caseId,
    req.user!.id,
    req.user!.permissions ?? [],
    'ADMIN',
  );
  const items = await enterpriseService.setCaseAcl(
    ctx,
    caseId,
    req.validatedBody as SetCaseAclInput,
  );
  return sendOk(res, items);
}

export async function listMatterTeam(req: Request, res: Response) {
  const { caseId } = req.validatedParams as { caseId: string };
  await requireCaseView(req, caseId);
  const items = await enterpriseService.listMatterTeam(req.workspace!.id, caseId);
  return sendOk(res, items);
}

export async function upsertMatterTeamMember(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { caseId } = req.validatedParams as { caseId: string };
  await requireCaseEdit(req, caseId);
  const entity = await enterpriseService.upsertMatterTeamMember(
    ctx,
    caseId,
    req.validatedBody as UpsertTeamMemberInput,
  );
  return sendOk(res, entity);
}

export async function removeMatterTeamMember(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { caseId, userId } = req.validatedParams as { caseId: string; userId: string };
  await requireCaseEdit(req, caseId);
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  await enterpriseService.removeMatterTeamMember(ctx, caseId, userId, role);
  return sendOk(res, { removed: true });
}

export async function listWarRoom(req: Request, res: Response) {
  const { caseId } = req.validatedParams as { caseId: string };
  await requireCaseView(req, caseId);
  const items = await enterpriseService.listWarRoom(req.workspace!.id, caseId);
  return sendOk(res, items);
}

export async function createWarRoomEntry(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { caseId } = req.validatedParams as { caseId: string };
  await requireCaseEdit(req, caseId);
  const entity = await enterpriseService.createWarRoomEntry(
    ctx,
    caseId,
    req.validatedBody as CreateWarRoomEntryInput,
  );
  return sendCreated(res, entity);
}

export async function pinWarRoomEntry(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const pinned =
    typeof (req.validatedBody as { pinned?: boolean } | undefined)?.pinned === 'boolean'
      ? (req.validatedBody as { pinned: boolean }).pinned
      : true;
  const entity = await enterpriseService.pinWarRoomEntry(ctx, id, pinned);
  return sendOk(res, entity);
}

export async function runConflictCheck(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await enterpriseService.runConflictCheck(
    ctx,
    req.validatedBody as ConflictCheckInput,
  );
  return sendCreated(res, entity);
}

export async function getRelationshipGraph(req: Request, res: Response) {
  const { caseId } = req.validatedParams as { caseId: string };
  await requireCaseView(req, caseId);
  const graph = await enterpriseService.getRelationshipGraph(req.workspace!.id, caseId);
  return sendOk(res, graph);
}

export async function listTimeEntries(req: Request, res: Response) {
  const query = req.validatedQuery as { caseId?: string; userId?: string } | undefined;
  if (query?.caseId) await requireCaseView(req, query.caseId);
  const items = await enterpriseService.listTimeEntries(req.workspace!.id, {
    caseId: query?.caseId,
    userId: query?.userId,
  });
  return sendOk(res, items);
}

export async function createTimeEntry(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const body = req.validatedBody as CreateTimeEntryInput;
  if (body.caseId) await requireCaseEdit(req, body.caseId);
  const entity = await enterpriseService.createTimeEntry(ctx, body);
  return sendCreated(res, entity);
}

export async function listWorkflows(req: Request, res: Response) {
  const query = req.validatedQuery as { caseId?: string } | undefined;
  if (query?.caseId) await requireCaseView(req, query.caseId);
  const items = await enterpriseService.listWorkflows(req.workspace!.id, query?.caseId);
  return sendOk(res, items);
}

export async function createWorkflow(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const body = req.validatedBody as CreateWorkflowInput;
  await requireCaseEdit(req, body.caseId);
  const entity = await enterpriseService.createWorkflow(ctx, body);
  return sendCreated(res, entity);
}

export async function advanceWorkflow(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await enterpriseService.advanceWorkflow(
    ctx,
    id,
    (req.validatedBody as AdvanceWorkflowInput) ?? {},
  );
  return sendOk(res, entity);
}

export async function accessibleCaseIds(req: Request, res: Response) {
  const result = await enterpriseService.accessibleCaseIds(
    req.workspace!.id,
    req.user!.id,
    req.user!.permissions ?? [],
  );
  return sendOk(res, result);
}

export async function assertCaseAccess(req: Request, res: Response) {
  const { caseId } = req.validatedParams as { caseId: string };
  const minLevel = (req.validatedQuery as { minLevel?: AccessLevel } | undefined)?.minLevel;
  await enterpriseService.assertCaseAccess(
    req.workspace!.id,
    caseId,
    req.user!.id,
    req.user!.permissions ?? [],
    minLevel,
  );
  return sendOk(res, { ok: true });
}

export async function bootstrapCaseAccess(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { caseId } = req.validatedParams as { caseId: string };
  await enterpriseService.bootstrapCaseAccess(ctx, caseId);
  return sendOk(res, { bootstrapped: true });
}
