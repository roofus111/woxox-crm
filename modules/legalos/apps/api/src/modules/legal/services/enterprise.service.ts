import mongoose from 'mongoose';
import { ApiError } from '../../../common/ApiError.js';
import type { ServiceContext } from '../../../common/types.js';
import type { AccessLevel } from '../enums.js';
import { ACCESS_LEVELS } from '../enums.js';
import { Branch, type IBranch } from '../models/branch.model.js';
import { CaseAcl, type ICaseAcl } from '../models/case-acl.model.js';
import {
  ConflictCheck,
  type ConflictMatch,
  type ConflictRisk,
  type IConflictCheck,
} from '../models/conflict-check.model.js';
import {
  DOCUMENT_WORKFLOW_STEPS,
  DocumentWorkflow,
  type DocumentWorkflowStep,
  type IDocumentWorkflow,
} from '../models/document-workflow.model.js';
import { FirmMember, type IFirmMember } from '../models/firm-member.model.js';
import { LegalCase } from '../models/legal-case.model.js';
import { MatterTeamMember, type IMatterTeamMember } from '../models/matter-team.model.js';
import { Party } from '../models/party.model.js';
import { TimeEntry, type ITimeEntry } from '../models/time-entry.model.js';
import { WarRoomEntry, type IWarRoomEntry } from '../models/war-room.model.js';
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

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function workspaceObjectId(workspaceId: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(workspaceId);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function riskFromScore(score: number): ConflictRisk {
  if (score <= 0) return 'NONE';
  if (score < 25) return 'LOW';
  if (score < 50) return 'MEDIUM';
  if (score < 75) return 'HIGH';
  return 'BLOCK';
}

const ACCESS_RANK = new Map(ACCESS_LEVELS.map((level, index) => [level, index]));

function hasMinAccessLevel(levels: AccessLevel[], minLevel: AccessLevel): boolean {
  if (levels.includes('SUPER_ADMIN') || levels.includes('ADMIN')) return true;
  if (levels.includes(minLevel)) return true;
  const minRank = ACCESS_RANK.get(minLevel) ?? 0;
  return levels.some((level) => (ACCESS_RANK.get(level) ?? -1) >= minRank);
}

function isEnterpriseAdmin(userPermissions: string[]): boolean {
  return (
    userPermissions.includes('legal.admin.manage') ||
    userPermissions.includes('SUPER_ADMIN') ||
    userPermissions.includes('legal.super_admin')
  );
}

function nextWorkflowStep(current: DocumentWorkflowStep): DocumentWorkflowStep {
  const index = DOCUMENT_WORKFLOW_STEPS.indexOf(current);
  if (index < 0 || index >= DOCUMENT_WORKFLOW_STEPS.length - 1) {
    return 'DONE';
  }
  return DOCUMENT_WORKFLOW_STEPS[index + 1]!;
}

export class EnterpriseService {
  async listBranches(workspaceId: string) {
    return Branch.find({ workspaceId: workspaceObjectId(workspaceId) })
      .sort({ isHeadOffice: -1, name: 1 })
      .lean();
  }

  async createBranch(ctx: ServiceContext, input: CreateBranchInput): Promise<IBranch> {
    try {
      return await Branch.create({
        workspaceId: workspaceObjectId(ctx.workspaceId),
        name: input.name,
        code: input.code,
        city: input.city,
        state: input.state,
        isHeadOffice: input.isHeadOffice ?? false,
        active: input.active ?? true,
      });
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        throw ApiError.conflict('Branch code already exists in this workspace');
      }
      throw err;
    }
  }

  async updateBranch(
    ctx: ServiceContext,
    branchId: string,
    input: UpdateBranchInput,
  ): Promise<IBranch> {
    const branch = await Branch.findOne({
      _id: toObjectId(branchId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
    });
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    Object.assign(branch, input);
    try {
      await branch.save();
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        throw ApiError.conflict('Branch code already exists in this workspace');
      }
      throw err;
    }
    return branch;
  }

  async listMembers(workspaceId: string) {
    return FirmMember.find({ workspaceId: workspaceObjectId(workspaceId) })
      .sort({ department: 1, title: 1, userId: 1 })
      .lean();
  }

  async upsertMember(ctx: ServiceContext, input: UpsertMemberInput): Promise<IFirmMember> {
    const $set: Record<string, unknown> = {
      title: input.title,
      department: input.department,
      accessLevels: input.accessLevels,
      active: input.active ?? true,
    };
    const $unset: Record<string, 1> = {};

    if (input.branchId === null) {
      $unset.branchId = 1;
    } else if (input.branchId) {
      $set.branchId = toObjectId(input.branchId);
    }
    if (input.moduleAccess !== undefined) {
      $set.moduleAccess = input.moduleAccess;
    }

    const update: Record<string, unknown> = { $set };
    if (Object.keys($unset).length > 0) update.$unset = $unset;

    const doc = await FirmMember.findOneAndUpdate(
      {
        workspaceId: workspaceObjectId(ctx.workspaceId),
        userId: input.userId,
      },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (!doc) throw ApiError.internal('Failed to upsert firm member');
    return doc;
  }

  async getCaseAcl(workspaceId: string, caseId: string) {
    return CaseAcl.find({
      workspaceId: workspaceObjectId(workspaceId),
      caseId: toObjectId(caseId),
    }).lean();
  }

  async setCaseAcl(
    ctx: ServiceContext,
    caseId: string,
    input: SetCaseAclInput,
  ): Promise<ICaseAcl[]> {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(caseId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
      deletedAt: null,
    }).select('_id');
    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    const ws = workspaceObjectId(ctx.workspaceId);
    const caseOid = toObjectId(caseId);

    await CaseAcl.deleteMany({ workspaceId: ws, caseId: caseOid });

    if (input.entries.length === 0) {
      return [];
    }

    const docs = await CaseAcl.insertMany(
      input.entries.map((entry) => ({
        workspaceId: ws,
        caseId: caseOid,
        userId: entry.userId,
        levels: entry.levels,
        grantedBy: ctx.actorId,
      })),
    );

    return docs;
  }

  async listMatterTeam(workspaceId: string, caseId: string) {
    return MatterTeamMember.find({
      workspaceId: workspaceObjectId(workspaceId),
      caseId: toObjectId(caseId),
    })
      .sort({ role: 1, userId: 1 })
      .lean();
  }

  async upsertMatterTeamMember(
    ctx: ServiceContext,
    caseId: string,
    input: UpsertTeamMemberInput,
  ): Promise<IMatterTeamMember> {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(caseId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
      deletedAt: null,
    }).select('_id');
    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    const doc = await MatterTeamMember.findOneAndUpdate(
      {
        workspaceId: workspaceObjectId(ctx.workspaceId),
        caseId: toObjectId(caseId),
        userId: input.userId,
        role: input.role,
      },
      {
        $set: {
          responsibilities: input.responsibilities,
          active: input.active ?? true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (!doc) throw ApiError.internal('Failed to upsert matter team member');
    return doc;
  }

  async removeMatterTeamMember(
    ctx: ServiceContext,
    caseId: string,
    userId: string,
    role?: string,
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(ctx.workspaceId),
      caseId: toObjectId(caseId),
      userId,
    };
    if (role) filter.role = role;

    const result = await MatterTeamMember.deleteMany(filter);
    if (result.deletedCount === 0) {
      throw ApiError.notFound('Matter team member not found');
    }
  }

  async listWarRoom(workspaceId: string, caseId: string) {
    return WarRoomEntry.find({
      workspaceId: workspaceObjectId(workspaceId),
      caseId: toObjectId(caseId),
    })
      .sort({ pinned: -1, createdAt: -1 })
      .lean();
  }

  async createWarRoomEntry(
    ctx: ServiceContext,
    caseId: string,
    input: CreateWarRoomEntryInput,
  ): Promise<IWarRoomEntry> {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(caseId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
      deletedAt: null,
    }).select('_id');
    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    return WarRoomEntry.create({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      caseId: toObjectId(caseId),
      type: input.type,
      title: input.title,
      body: input.body,
      authorId: ctx.actorId,
      pinned: input.pinned ?? false,
      parentId: input.parentId ? toObjectId(input.parentId) : undefined,
    });
  }

  async pinWarRoomEntry(
    ctx: ServiceContext,
    entryId: string,
    pinned = true,
  ): Promise<IWarRoomEntry> {
    const entry = await WarRoomEntry.findOne({
      _id: toObjectId(entryId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
    });
    if (!entry) {
      throw ApiError.notFound('War room entry not found');
    }
    entry.pinned = pinned;
    await entry.save();
    return entry;
  }

  async runConflictCheck(
    ctx: ServiceContext,
    input: ConflictCheckInput,
  ): Promise<IConflictCheck> {
    const ws = workspaceObjectId(ctx.workspaceId);
    const matches: ConflictMatch[] = [];
    const seen = new Set<string>();

    const partyOr = input.partyNames.flatMap((name) => {
      const regex = new RegExp(escapeRegex(name), 'i');
      return [{ displayName: regex }, { organizationName: regex }];
    });
    const caseOr = input.partyNames.map((name) => ({
      partiesSearch: new RegExp(escapeRegex(name), 'i'),
    }));

    const [parties, cases] = await Promise.all([
      partyOr.length
        ? Party.find({ workspaceId: ws, deletedAt: null, $or: partyOr }).limit(100).lean()
        : Promise.resolve([]),
      caseOr.length
        ? LegalCase.find({ workspaceId: ws, deletedAt: null, $or: caseOr })
            .select('_id title caseNumber partiesSearch')
            .limit(100)
            .lean()
        : Promise.resolve([]),
    ]);

    for (const party of parties) {
      const key = `party:${party._id.toString()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        partyId: party._id,
        name: party.displayName,
        reason: 'Party name match in firm records',
        strength: 80,
      });
    }

    for (const legalCase of cases) {
      const key = `case:${legalCase._id.toString()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        name: legalCase.title,
        reason: `Case partiesSearch match (${legalCase.caseNumber ?? legalCase._id})`,
        strength: 60,
      });
    }

    if (input.partyIds?.length) {
      const byId = await Party.find({
        workspaceId: ws,
        deletedAt: null,
        _id: { $in: input.partyIds.map(toObjectId) },
      }).lean();

      for (const party of byId) {
        const key = `party:${party._id.toString()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        matches.push({
          partyId: party._id,
          name: party.displayName,
          reason: 'Explicit party id provided for conflict scan',
          strength: 90,
        });
      }
    }

    const score = Math.min(100, matches.length * 25);
    const risk = riskFromScore(score);

    return ConflictCheck.create({
      workspaceId: ws,
      title: input.title,
      partyNames: input.partyNames,
      partyIds: input.partyIds?.map(toObjectId),
      score,
      risk,
      matches,
      status: 'OPEN',
      caseId: input.caseId ? toObjectId(input.caseId) : undefined,
      createdBy: ctx.actorId,
    });
  }

  async getRelationshipGraph(workspaceId: string, caseId: string) {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(caseId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    }).lean();

    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    const nodes: Array<{ id: string; type: string; label: string }> = [
      {
        id: `case:${legalCase._id}`,
        type: 'case',
        label: legalCase.title,
      },
    ];
    const edges: Array<{ from: string; to: string; relation: string }> = [];
    const caseNodeId = `case:${legalCase._id}`;

    const partyIds = [
      ...legalCase.clientPartyIds,
      ...legalCase.oppositePartyIds,
      ...legalCase.witnessPartyIds,
    ];
    const parties =
      partyIds.length > 0
        ? await Party.find({ _id: { $in: partyIds }, deletedAt: null }).lean()
        : [];
    const partyMap = new Map(parties.map((p) => [p._id.toString(), p]));

    const addPartyEdge = (
      ids: mongoose.Types.ObjectId[],
      relation: string,
      type: string,
    ) => {
      for (const id of ids) {
        const party = partyMap.get(id.toString());
        const nodeId = `party:${id}`;
        if (!nodes.some((n) => n.id === nodeId)) {
          nodes.push({
            id: nodeId,
            type,
            label: party?.displayName ?? id.toString(),
          });
        }
        edges.push({ from: caseNodeId, to: nodeId, relation });
      }
    };

    addPartyEdge(legalCase.clientPartyIds, 'client', 'client');
    addPartyEdge(legalCase.oppositePartyIds, 'opposite', 'opposite');
    addPartyEdge(legalCase.witnessPartyIds, 'witness', 'witness');

    for (const advocateId of legalCase.advocateIds) {
      const nodeId = `advocate:${advocateId}`;
      nodes.push({ id: nodeId, type: 'advocate', label: advocateId.toString() });
      edges.push({ from: caseNodeId, to: nodeId, relation: 'advocate' });
    }

    for (const complaintId of legalCase.complaintIds ?? []) {
      const nodeId = `complaint:${complaintId}`;
      nodes.push({ id: nodeId, type: 'complaint', label: complaintId.toString() });
      edges.push({ from: caseNodeId, to: nodeId, relation: 'complaint' });
    }

    for (const firId of legalCase.firIds ?? []) {
      const nodeId = `fir:${firId}`;
      nodes.push({ id: nodeId, type: 'fir', label: firId.toString() });
      edges.push({ from: caseNodeId, to: nodeId, relation: 'fir' });
    }

    return { caseId: legalCase._id.toString(), nodes, edges };
  }

  async listTimeEntries(workspaceId: string, filters?: { caseId?: string; userId?: string }) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
    };
    if (filters?.caseId) filter.caseId = toObjectId(filters.caseId);
    if (filters?.userId) filter.userId = filters.userId;

    return TimeEntry.find(filter).sort({ occurredAt: -1 }).lean();
  }

  async createTimeEntry(ctx: ServiceContext, input: CreateTimeEntryInput): Promise<ITimeEntry> {
    if (input.caseId) {
      const legalCase = await LegalCase.findOne({
        _id: toObjectId(input.caseId),
        workspaceId: workspaceObjectId(ctx.workspaceId),
        deletedAt: null,
      }).select('_id');
      if (!legalCase) {
        throw ApiError.notFound('Case not found');
      }
    }

    return TimeEntry.create({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      caseId: input.caseId ? toObjectId(input.caseId) : undefined,
      userId: input.userId ?? ctx.actorId,
      activity: input.activity,
      minutes: input.minutes,
      billable: input.billable ?? true,
      notes: input.notes,
      occurredAt: input.occurredAt,
    });
  }

  async listWorkflows(workspaceId: string, caseId?: string) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
    };
    if (caseId) filter.caseId = toObjectId(caseId);

    return DocumentWorkflow.find(filter).sort({ updatedAt: -1 }).lean();
  }

  async createWorkflow(
    ctx: ServiceContext,
    input: CreateWorkflowInput,
  ): Promise<IDocumentWorkflow> {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(input.caseId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
      deletedAt: null,
    }).select('_id');
    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    return DocumentWorkflow.create({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      caseId: toObjectId(input.caseId),
      title: input.title,
      currentStep: input.currentStep ?? 'INTERN',
      versions: [
        {
          version: 1,
          body: input.body,
          authorId: ctx.actorId,
          createdAt: new Date(),
        },
      ],
      createdBy: ctx.actorId,
    });
  }

  async advanceWorkflow(
    ctx: ServiceContext,
    workflowId: string,
    input: AdvanceWorkflowInput,
  ): Promise<IDocumentWorkflow> {
    const workflow = await DocumentWorkflow.findOne({
      _id: toObjectId(workflowId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
    });
    if (!workflow) {
      throw ApiError.notFound('Document workflow not found');
    }
    if (workflow.currentStep === 'DONE') {
      throw ApiError.badRequest('Workflow is already complete');
    }

    const latest = workflow.versions[workflow.versions.length - 1];
    if (input.approve && latest && !latest.approvedBy) {
      latest.approvedBy = ctx.actorId;
      latest.approvedAt = new Date();
    }

    if (input.body) {
      workflow.versions.push({
        version: (latest?.version ?? 0) + 1,
        body: input.body,
        authorId: ctx.actorId,
        createdAt: new Date(),
      });
    }

    workflow.currentStep = nextWorkflowStep(workflow.currentStep);
    await workflow.save();
    return workflow;
  }

  async accessibleCaseIds(
    workspaceId: string,
    userId: string,
    userPermissions: string[],
  ): Promise<string[] | 'ALL'> {
    if (isEnterpriseAdmin(userPermissions)) {
      return 'ALL';
    }

    const ws = workspaceObjectId(workspaceId);
    const [aclRows, teamRows] = await Promise.all([
      CaseAcl.find({ workspaceId: ws, userId }).select('caseId').lean(),
      MatterTeamMember.find({ workspaceId: ws, userId, active: true }).select('caseId').lean(),
    ]);

    const ids = new Set<string>();
    for (const row of aclRows) ids.add(row.caseId.toString());
    for (const row of teamRows) ids.add(row.caseId.toString());
    return [...ids];
  }

  async assertCaseAccess(
    workspaceId: string,
    caseId: string,
    userId: string,
    permissions: string[],
    minLevel?: AccessLevel,
  ): Promise<void> {
    if (isEnterpriseAdmin(permissions)) return;

    const accessible = await this.accessibleCaseIds(workspaceId, userId, permissions);
    if (accessible === 'ALL') return;

    const legalCase = await LegalCase.findOne({
      _id: toObjectId(caseId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    })
      .select('visibility createdBy branchId')
      .lean();

    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    if (legalCase.visibility === 'FIRM') {
      if (!minLevel || minLevel === 'VIEW') return;
    }

    if (legalCase.visibility === 'BRANCH' && legalCase.branchId) {
      const member = await FirmMember.findOne({
        workspaceId: workspaceObjectId(workspaceId),
        userId,
        active: true,
        branchId: legalCase.branchId,
      })
        .select('_id')
        .lean();
      if (member && (!minLevel || minLevel === 'VIEW')) return;
    }

    if (legalCase.createdBy?.toString() === userId) {
      return;
    }

    if (!accessible.includes(caseId)) {
      throw ApiError.forbidden('No access to this case');
    }

    if (!minLevel || minLevel === 'VIEW') return;

    const acl = await CaseAcl.findOne({
      workspaceId: workspaceObjectId(workspaceId),
      caseId: toObjectId(caseId),
      userId,
    }).lean();

    if (acl && hasMinAccessLevel(acl.levels as AccessLevel[], minLevel)) {
      return;
    }

    const onTeam = await MatterTeamMember.exists({
      workspaceId: workspaceObjectId(workspaceId),
      caseId: toObjectId(caseId),
      userId,
      active: true,
    });
    if (onTeam && (minLevel === 'EDIT' || minLevel === 'COMMENT')) {
      return;
    }

    throw ApiError.forbidden(`Requires ${minLevel} access on this case`);
  }

  async bootstrapCaseAccess(ctx: ServiceContext, caseId: string): Promise<void> {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(caseId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
      deletedAt: null,
    }).select('_id');
    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    const ws = workspaceObjectId(ctx.workspaceId);
    const caseOid = toObjectId(caseId);

    await CaseAcl.findOneAndUpdate(
      { workspaceId: ws, caseId: caseOid, userId: ctx.actorId },
      {
        $set: {
          levels: ['VIEW', 'EDIT', 'ASSIGN', 'ADMIN'] satisfies AccessLevel[],
          grantedBy: ctx.actorId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await MatterTeamMember.findOneAndUpdate(
      {
        workspaceId: ws,
        caseId: caseOid,
        userId: ctx.actorId,
        role: 'LEAD_ADVOCATE',
      },
      { $set: { active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

export const enterpriseService = new EnterpriseService();
