import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import {
  ApplyTemplateDto,
  ClonePipelineDto,
  CreatePipelineDto,
  CreateStageDto,
  ImportPipelineDto,
  PublishPipelineDto,
  ReorderStagesDto,
  SaveTemplateDto,
  StageAutomationDto,
  StageChecklistDto,
  StageDocumentDto,
  StageFieldDto,
  StagePermissionDto,
  TransitionRuleDto,
  UpdatePipelineDto,
  UpdateStageDto,
  ValidateTransitionDto,
} from './dto/pipeline.dto';
import { SYSTEM_PIPELINE_TEMPLATES, SeedStageDef } from './pipeline-templates.seed';
import { PipelineMongoBridgeService } from './pipeline-mongo-bridge.service';
import { TransitionValidatorService } from './transition-validator.service';

const STAGE_INCLUDE = {
  fields: { orderBy: { sortOrder: 'asc' as const } },
  documents: { orderBy: { sortOrder: 'asc' as const } },
  checklist: { orderBy: { sortOrder: 'asc' as const } },
  permissions: true,
  automations: { orderBy: { sortOrder: 'asc' as const } },
  transitionsFrom: true,
  transitionsTo: true,
};

const PIPELINE_DETAIL_INCLUDE = {
  stages: {
    orderBy: { sortOrder: 'asc' as const },
    include: STAGE_INCLUDE,
  },
  versions: { orderBy: { version: 'desc' as const }, take: 20 },
  _count: { select: { deals: true, records: true } },
};

@Injectable()
export class PipelinesService {
  private readonly logger = new Logger(PipelinesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bridge: PipelineMongoBridgeService,
    private readonly transitions: TransitionValidatorService,
  ) {}

  async ensureSystemTemplates() {
    for (const tpl of SYSTEM_PIPELINE_TEMPLATES) {
      const existing = await this.prisma.pipelineTemplate.findFirst({
        where: { isSystem: true, name: tpl.name, moduleKey: tpl.moduleKey, workspaceId: null },
      });
      if (!existing) {
        await this.prisma.pipelineTemplate.create({
          data: {
            name: tpl.name,
            description: tpl.description,
            moduleKey: tpl.moduleKey,
            icon: tpl.icon,
            color: tpl.color,
            isSystem: true,
            stagesJson: tpl.stages as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }
  }

  async ensureDefault(workspaceId: string) {
    await this.ensureSystemTemplates();
    const existing = await this.prisma.pipeline.findFirst({
      where: { workspaceId, isDefault: true, isArchived: false },
      include: PIPELINE_DETAIL_INCLUDE,
    });
    if (existing) return existing;

    const sales = await this.prisma.pipelineTemplate.findFirst({
      where: { isSystem: true, name: 'Sales' },
    });
    if (sales) {
      return this.createFromTemplate(workspaceId, {
        templateId: sales.id,
        name: 'Sales Pipeline',
      }, true);
    }

    return this.prisma.pipeline.create({
      data: {
        workspaceId,
        name: 'Sales Pipeline',
        moduleKey: 'crm',
        isDefault: true,
        stages: {
          create: [
            { name: 'Qualification', probability: 10, winProbability: 10, sortOrder: 0 },
            { name: 'Proposal', probability: 40, winProbability: 40, sortOrder: 1 },
            { name: 'Negotiation', probability: 70, winProbability: 70, sortOrder: 2 },
            {
              name: 'Won',
              probability: 100,
              winProbability: 100,
              sortOrder: 3,
              isWon: true,
              isSuccess: true,
              isClosed: true,
              stageType: 'success',
            },
            {
              name: 'Lost',
              probability: 0,
              winProbability: 0,
              sortOrder: 4,
              isLost: true,
              isClosed: true,
              stageType: 'lost',
            },
          ],
        },
      },
      include: PIPELINE_DETAIL_INCLUDE,
    });
  }

  async list(workspaceId: string, query?: { moduleKey?: string; archived?: boolean }) {
    await this.ensureDefault(workspaceId);
    return this.prisma.pipeline.findMany({
      where: {
        workspaceId,
        ...(query?.moduleKey ? { moduleKey: query.moduleKey } : {}),
        isArchived: query?.archived ?? false,
      },
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { deals: true, records: true } },
      },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async getOne(workspaceId: string, id: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, workspaceId },
      include: PIPELINE_DETAIL_INCLUDE,
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async getBoard(workspaceId: string, pipelineId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, workspaceId },
      include: {
        stages: {
          orderBy: { sortOrder: 'asc' },
          include: {
            deals: {
              where: { deletedAt: null },
              orderBy: { updatedAt: 'desc' },
              include: {
                contact: { select: { id: true, firstName: true, lastName: true } },
                company: { select: { id: true, name: true } },
              },
            },
            records: {
              where: { deletedAt: null },
              orderBy: { updatedAt: 'desc' },
            },
          },
        },
      },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  private stageCreateData(stage: SeedStageDef | CreateStageDto, sortOrder: number) {
    const isWon = !!(stage as CreateStageDto).isWon || !!(stage as SeedStageDef).isSuccess;
    const isSuccess = !!(stage as CreateStageDto).isSuccess || isWon;
    const isLost = !!(stage as CreateStageDto).isLost;
    const isClosed = !!(stage as CreateStageDto).isClosed || isWon || isLost;
    const probability =
      (stage as CreateStageDto).probability ??
      (stage as CreateStageDto).winProbability ??
      (stage as SeedStageDef).probability ??
      0;

    return {
      name: stage.name,
      description: (stage as CreateStageDto).description,
      color: (stage as CreateStageDto).color,
      icon: (stage as CreateStageDto).icon,
      sortOrder: (stage as CreateStageDto).sortOrder ?? sortOrder,
      stageType:
        (stage as CreateStageDto).stageType ||
        (isWon ? 'success' : isLost ? 'lost' : isClosed ? 'closed' : 'open'),
      isWon,
      isSuccess,
      isLost,
      isClosed,
      probability,
      winProbability: (stage as CreateStageDto).winProbability ?? probability,
      slaHours: (stage as CreateStageDto).slaHours,
      estimatedDuration: (stage as CreateStageDto).estimatedDuration,
      revenuePercent: (stage as CreateStageDto).revenuePercent,
      requiresApproval: (stage as CreateStageDto).requiresApproval ?? false,
      config: ((stage as CreateStageDto).config || {}) as Prisma.InputJsonValue,
    };
  }

  private async createNestedStageConfig(stageId: string, def: SeedStageDef) {
    if (def.fields?.length) {
      await this.prisma.stageField.createMany({
        data: def.fields.map((f, i) => ({
          stageId,
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType || 'text',
          isRequired: f.isRequired ?? true,
          sortOrder: i,
        })),
      });
    }
    if (def.documents?.length) {
      await this.prisma.stageDocument.createMany({
        data: def.documents.map((d, i) => ({
          stageId,
          docKey: d.docKey,
          label: d.label,
          isRequired: d.isRequired ?? true,
          sortOrder: i,
        })),
      });
    }
    if (def.checklist?.length) {
      await this.prisma.stageChecklistItem.createMany({
        data: def.checklist.map((c, i) => ({
          stageId,
          label: c.label,
          isRequired: c.isRequired ?? true,
          sortOrder: i,
        })),
      });
    }
  }

  async createFromTemplate(
    workspaceId: string,
    dto: ApplyTemplateDto,
    asDefault = false,
  ) {
    const template = await this.prisma.pipelineTemplate.findFirst({
      where: {
        id: dto.templateId,
        OR: [{ isSystem: true }, { workspaceId }],
      },
    });
    if (!template) throw new NotFoundException('Template not found');

    if (asDefault) {
      await this.prisma.pipeline.updateMany({
        where: { workspaceId },
        data: { isDefault: false },
      });
    }

    const stages = (template.stagesJson as unknown as SeedStageDef[]) || [];
    const pipeline = await this.prisma.pipeline.create({
      data: {
        workspaceId,
        name: dto.name || template.name,
        description: template.description,
        icon: template.icon,
        color: template.color,
        moduleKey: template.moduleKey,
        isDefault: asDefault,
      },
    });

    for (const [i, s] of stages.entries()) {
      const created = await this.prisma.pipelineStage.create({
        data: { pipelineId: pipeline.id, ...this.stageCreateData(s, i) },
      });
      await this.createNestedStageConfig(created.id, s);
    }

    await this.audit(workspaceId, pipeline.id, null, 'pipeline.created_from_template', 'Pipeline', pipeline.id, null, {
      templateId: template.id,
    });

    return this.getOne(workspaceId, pipeline.id);
  }

  async create(workspaceId: string, dto: CreatePipelineDto, ownerId?: string) {
    if (dto.templateId) {
      return this.createFromTemplate(workspaceId, {
        templateId: dto.templateId,
        name: dto.name,
      }, !!dto.isDefault);
    }

    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { workspaceId },
        data: { isDefault: false },
      });
    }

    const pipeline = await this.prisma.pipeline.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color || '#0288d1',
        moduleKey: dto.moduleKey || 'crm',
        businessUnit: dto.businessUnit,
        country: dto.country,
        isDefault: dto.isDefault ?? false,
        visibility: dto.visibility || 'workspace',
        ownerId,
        stages: {
          create: [
            { name: 'New', probability: 10, winProbability: 10, sortOrder: 0 },
            { name: 'In Progress', probability: 50, winProbability: 50, sortOrder: 1 },
            {
              name: 'Won',
              probability: 100,
              winProbability: 100,
              sortOrder: 2,
              isWon: true,
              isSuccess: true,
              isClosed: true,
              stageType: 'success',
            },
            {
              name: 'Lost',
              probability: 0,
              winProbability: 0,
              sortOrder: 3,
              isLost: true,
              isClosed: true,
              stageType: 'lost',
            },
          ],
        },
      },
      include: PIPELINE_DETAIL_INCLUDE,
    });

    await this.audit(workspaceId, pipeline.id, ownerId, 'pipeline.created', 'Pipeline', pipeline.id, null, pipeline);
    return pipeline;
  }

  async update(workspaceId: string, id: string, dto: UpdatePipelineDto, actorId?: string) {
    await this.getOne(workspaceId, id);
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { workspaceId },
        data: { isDefault: false },
      });
    }
    const updated = await this.prisma.pipeline.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        moduleKey: dto.moduleKey,
        businessUnit: dto.businessUnit,
        country: dto.country,
        isDefault: dto.isDefault,
        isActive: dto.isActive,
        isArchived: dto.isArchived,
        visibility: dto.visibility,
        version: { increment: 1 },
      },
      include: PIPELINE_DETAIL_INCLUDE,
    });
    await this.audit(workspaceId, id, actorId, 'pipeline.updated', 'Pipeline', id, null, updated);
    return updated;
  }

  async remove(workspaceId: string, id: string, actorId?: string) {
    const pipeline = await this.getOne(workspaceId, id);
    if (pipeline.isDefault) {
      throw new BadRequestException('Cannot delete the default pipeline — set another default first');
    }
    await this.prisma.pipeline.update({
      where: { id },
      data: { isArchived: true, isActive: false, version: { increment: 1 } },
    });
    await this.audit(workspaceId, id, actorId, 'pipeline.archived', 'Pipeline', id, pipeline, null);
    return { message: 'Pipeline archived' };
  }

  async addStage(workspaceId: string, pipelineId: string, dto: CreateStageDto, actorId?: string) {
    await this.getOne(workspaceId, pipelineId);
    if (dto.isWon && dto.isLost) {
      throw new BadRequestException('Stage cannot be both won and lost');
    }
    const max = await this.prisma.pipelineStage.aggregate({
      where: { pipelineId },
      _max: { sortOrder: true },
    });
    const stage = await this.prisma.pipelineStage.create({
      data: {
        pipelineId,
        ...this.stageCreateData(dto, (max._max.sortOrder ?? -1) + 1),
      },
      include: STAGE_INCLUDE,
    });
    await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { version: { increment: 1 } },
    });
    await this.audit(workspaceId, pipelineId, actorId, 'stage.created', 'PipelineStage', stage.id, null, stage);
    return stage;
  }

  async updateStage(
    workspaceId: string,
    pipelineId: string,
    stageId: string,
    dto: UpdateStageDto,
    actorId?: string,
  ) {
    await this.getOne(workspaceId, pipelineId);
    const existing = await this.prisma.pipelineStage.findFirst({
      where: { id: stageId, pipelineId },
    });
    if (!existing) throw new NotFoundException('Stage not found');

    const probability = dto.probability ?? dto.winProbability ?? existing.probability;
    const isWon = dto.isWon ?? dto.isSuccess ?? existing.isWon;
    const isSuccess = dto.isSuccess ?? isWon;
    const isLost = dto.isLost ?? existing.isLost;

    const stage = await this.prisma.pipelineStage.update({
      where: { id: stageId },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
        stageType: dto.stageType,
        isWon,
        isSuccess,
        isLost,
        isClosed: dto.isClosed,
        probability,
        winProbability: dto.winProbability ?? probability,
        slaHours: dto.slaHours,
        estimatedDuration: dto.estimatedDuration,
        revenuePercent: dto.revenuePercent,
        requiresApproval: dto.requiresApproval,
        config: dto.config as Prisma.InputJsonValue | undefined,
      },
      include: STAGE_INCLUDE,
    });
    await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { version: { increment: 1 } },
    });
    await this.audit(workspaceId, pipelineId, actorId, 'stage.updated', 'PipelineStage', stageId, existing, stage);
    return stage;
  }

  async deleteStage(workspaceId: string, pipelineId: string, stageId: string, actorId?: string) {
    await this.getOne(workspaceId, pipelineId);
    const existing = await this.prisma.pipelineStage.findFirst({
      where: { id: stageId, pipelineId },
    });
    if (!existing) throw new NotFoundException('Stage not found');
    await this.prisma.pipelineStage.delete({ where: { id: stageId } });
    await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { version: { increment: 1 } },
    });
    await this.audit(workspaceId, pipelineId, actorId, 'stage.deleted', 'PipelineStage', stageId, existing, null);
    return { message: 'Stage deleted' };
  }

  async reorderStages(workspaceId: string, pipelineId: string, dto: ReorderStagesDto, actorId?: string) {
    await this.getOne(workspaceId, pipelineId);
    await this.prisma.$transaction(
      dto.stageIds.map((id, index) =>
        this.prisma.pipelineStage.updateMany({
          where: { id, pipelineId },
          data: { sortOrder: index },
        }),
      ),
    );
    await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { version: { increment: 1 } },
    });
    await this.audit(workspaceId, pipelineId, actorId, 'stage.reordered', 'Pipeline', pipelineId, null, {
      stageIds: dto.stageIds,
    });
    return this.getOne(workspaceId, pipelineId);
  }

  async duplicateStage(workspaceId: string, pipelineId: string, stageId: string, actorId?: string) {
    const pipeline = await this.getOne(workspaceId, pipelineId);
    const stage = pipeline.stages.find((s) => s.id === stageId);
    if (!stage) throw new NotFoundException('Stage not found');

    const created = await this.prisma.pipelineStage.create({
      data: {
        pipelineId,
        name: `${stage.name} (copy)`,
        description: stage.description,
        color: stage.color,
        icon: stage.icon,
        sortOrder: stage.sortOrder + 1,
        stageType: stage.stageType,
        isWon: false,
        isSuccess: false,
        isLost: false,
        isClosed: false,
        probability: stage.probability,
        winProbability: stage.winProbability,
        slaHours: stage.slaHours,
        estimatedDuration: stage.estimatedDuration,
        revenuePercent: stage.revenuePercent,
        requiresApproval: stage.requiresApproval,
        config: stage.config as Prisma.InputJsonValue,
      },
    });

    for (const f of stage.fields) {
      await this.prisma.stageField.create({
        data: {
          stageId: created.id,
          fieldKey: `${f.fieldKey}_copy`,
          label: f.label,
          fieldType: f.fieldType,
          isRequired: f.isRequired,
          options: f.options as Prisma.InputJsonValue,
          sortOrder: f.sortOrder,
          validation: f.validation as Prisma.InputJsonValue,
        },
      });
    }
    for (const d of stage.documents) {
      await this.prisma.stageDocument.create({
        data: {
          stageId: created.id,
          docKey: `${d.docKey}_copy`,
          label: d.label,
          description: d.description,
          isRequired: d.isRequired,
          acceptedMime: d.acceptedMime,
          sortOrder: d.sortOrder,
        },
      });
    }
    for (const c of stage.checklist) {
      await this.prisma.stageChecklistItem.create({
        data: {
          stageId: created.id,
          label: c.label,
          description: c.description,
          isRequired: c.isRequired,
          sortOrder: c.sortOrder,
        },
      });
    }

    await this.audit(workspaceId, pipelineId, actorId, 'stage.duplicated', 'PipelineStage', created.id, stage, created);
    return this.getOne(workspaceId, pipelineId);
  }

  // ── Nested stage config ──────────────────────────────────────────────────

  async upsertField(workspaceId: string, pipelineId: string, stageId: string, dto: StageFieldDto) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    return this.prisma.stageField.upsert({
      where: { stageId_fieldKey: { stageId, fieldKey: dto.fieldKey } },
      create: {
        stageId,
        fieldKey: dto.fieldKey,
        label: dto.label,
        fieldType: dto.fieldType || 'text',
        isRequired: dto.isRequired ?? true,
        options: (dto.options || []) as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? 0,
        validation: (dto.validation || {}) as Prisma.InputJsonValue,
      },
      update: {
        label: dto.label,
        fieldType: dto.fieldType,
        isRequired: dto.isRequired,
        options: dto.options as Prisma.InputJsonValue | undefined,
        sortOrder: dto.sortOrder,
        validation: dto.validation as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async deleteField(workspaceId: string, pipelineId: string, stageId: string, fieldId: string) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    await this.prisma.stageField.deleteMany({ where: { id: fieldId, stageId } });
    return { message: 'Field deleted' };
  }

  async upsertDocument(workspaceId: string, pipelineId: string, stageId: string, dto: StageDocumentDto) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    return this.prisma.stageDocument.upsert({
      where: { stageId_docKey: { stageId, docKey: dto.docKey } },
      create: {
        stageId,
        docKey: dto.docKey,
        label: dto.label,
        description: dto.description,
        isRequired: dto.isRequired ?? true,
        acceptedMime: dto.acceptedMime || [],
        sortOrder: dto.sortOrder ?? 0,
      },
      update: {
        label: dto.label,
        description: dto.description,
        isRequired: dto.isRequired,
        acceptedMime: dto.acceptedMime,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async deleteDocument(workspaceId: string, pipelineId: string, stageId: string, docId: string) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    await this.prisma.stageDocument.deleteMany({ where: { id: docId, stageId } });
    return { message: 'Document requirement deleted' };
  }

  async addChecklistItem(workspaceId: string, pipelineId: string, stageId: string, dto: StageChecklistDto) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    return this.prisma.stageChecklistItem.create({
      data: {
        stageId,
        label: dto.label,
        description: dto.description,
        isRequired: dto.isRequired ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async deleteChecklistItem(workspaceId: string, pipelineId: string, stageId: string, itemId: string) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    await this.prisma.stageChecklistItem.deleteMany({ where: { id: itemId, stageId } });
    return { message: 'Checklist item deleted' };
  }

  async upsertTransition(workspaceId: string, pipelineId: string, dto: TransitionRuleDto) {
    await this.getOne(workspaceId, pipelineId);
    return this.prisma.stageTransitionRule.upsert({
      where: {
        fromStageId_toStageId: { fromStageId: dto.fromStageId, toStageId: dto.toStageId },
      },
      create: {
        pipelineId,
        fromStageId: dto.fromStageId,
        toStageId: dto.toStageId,
        name: dto.name,
        conditions: (dto.conditions || {}) as Prisma.InputJsonValue,
        blockUnlessValid: dto.blockUnlessValid ?? true,
        isActive: dto.isActive ?? true,
      },
      update: {
        name: dto.name,
        conditions: dto.conditions as Prisma.InputJsonValue | undefined,
        blockUnlessValid: dto.blockUnlessValid,
        isActive: dto.isActive,
      },
    });
  }

  async deleteTransition(workspaceId: string, pipelineId: string, ruleId: string) {
    await this.getOne(workspaceId, pipelineId);
    await this.prisma.stageTransitionRule.deleteMany({ where: { id: ruleId, pipelineId } });
    return { message: 'Transition rule deleted' };
  }

  async addPermission(workspaceId: string, pipelineId: string, stageId: string, dto: StagePermissionDto) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    return this.prisma.stagePermission.create({
      data: {
        stageId,
        role: dto.role,
        userId: dto.userId,
        canView: dto.canView ?? true,
        canEdit: dto.canEdit ?? false,
        canDelete: dto.canDelete ?? false,
        canMoveFwd: dto.canMoveFwd ?? true,
        canMoveBack: dto.canMoveBack ?? true,
        canApprove: dto.canApprove ?? false,
        canReject: dto.canReject ?? false,
        canSkip: dto.canSkip ?? false,
      },
    });
  }

  async deletePermission(workspaceId: string, pipelineId: string, stageId: string, permId: string) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    await this.prisma.stagePermission.deleteMany({ where: { id: permId, stageId } });
    return { message: 'Permission deleted' };
  }

  async addAutomation(workspaceId: string, pipelineId: string, stageId: string, dto: StageAutomationDto) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    return this.prisma.stageAutomation.create({
      data: {
        stageId,
        name: dto.name,
        trigger: dto.trigger,
        condition: (dto.condition || {}) as Prisma.InputJsonValue,
        action: (dto.action || {}) as Prisma.InputJsonValue,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async deleteAutomation(workspaceId: string, pipelineId: string, stageId: string, autoId: string) {
    await this.assertStage(workspaceId, pipelineId, stageId);
    await this.prisma.stageAutomation.deleteMany({ where: { id: autoId, stageId } });
    return { message: 'Automation deleted' };
  }

  async validateTransition(
    workspaceId: string,
    pipelineId: string,
    dto: ValidateTransitionDto,
    actorId?: string,
  ) {
    return this.transitions.validate(workspaceId, pipelineId, dto, actorId);
  }

  // ── Clone / publish / versions / import-export ───────────────────────────

  async clone(workspaceId: string, id: string, dto: ClonePipelineDto, actorId?: string) {
    const source = await this.getOne(workspaceId, id);
    const snapshot = this.toSnapshot(source);
    const cloned = await this.importSnapshot(workspaceId, {
      snapshot,
      name: dto.name || `${source.name} (copy)`,
    }, actorId);
    await this.audit(workspaceId, cloned.id, actorId, 'pipeline.cloned', 'Pipeline', cloned.id, { sourceId: id }, null);
    return cloned;
  }

  async publish(workspaceId: string, id: string, dto: PublishPipelineDto, actorId?: string) {
    const pipeline = await this.getOne(workspaceId, id);
    const nextVersion = (pipeline.publishedVersion || 0) + 1;
    const snapshot = this.toSnapshot(pipeline);

    await this.prisma.pipelineVersion.create({
      data: {
        pipelineId: id,
        version: nextVersion,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        note: dto.note,
        publishedBy: actorId,
      },
    });

    const sync = await this.bridge.syncPublished({
      legacyMongoId: pipeline.legacyMongoId,
      name: pipeline.name,
      description: pipeline.description,
      companyEmail: dto.legacyCompanyEmail,
      stages: pipeline.stages.map((s) => ({
        name: s.name,
        description: s.description || undefined,
        property: this.bridge.mapStageProperty(s),
        order: s.sortOrder,
      })),
    });

    const updated = await this.prisma.pipeline.update({
      where: { id },
      data: {
        publishedVersion: nextVersion,
        version: nextVersion,
        ...(sync.mongoId ? { legacyMongoId: sync.mongoId } : {}),
      },
      include: PIPELINE_DETAIL_INCLUDE,
    });

    await this.audit(workspaceId, id, actorId, 'pipeline.published', 'Pipeline', id, null, {
      version: nextVersion,
      legacySync: sync,
    });

    return { pipeline: updated, legacySync: sync };
  }

  async listVersions(workspaceId: string, id: string) {
    await this.getOne(workspaceId, id);
    return this.prisma.pipelineVersion.findMany({
      where: { pipelineId: id },
      orderBy: { version: 'desc' },
    });
  }

  async restoreVersion(workspaceId: string, id: string, version: number, actorId?: string) {
    await this.getOne(workspaceId, id);
    const ver = await this.prisma.pipelineVersion.findFirst({
      where: { pipelineId: id, version },
    });
    if (!ver) throw new NotFoundException('Version not found');

    await this.prisma.pipelineStage.deleteMany({ where: { pipelineId: id } });
    const snap = ver.snapshot as unknown as ReturnType<PipelinesService['toSnapshot']>;
    await this.prisma.pipeline.update({
      where: { id },
      data: {
        name: snap.name,
        description: snap.description,
        icon: snap.icon,
        color: snap.color,
        moduleKey: snap.moduleKey,
        businessUnit: snap.businessUnit,
        country: snap.country,
        visibility: snap.visibility,
        version: { increment: 1 },
      },
    });

    for (const [i, s] of (snap.stages || []).entries()) {
      const created = await this.prisma.pipelineStage.create({
        data: {
          pipelineId: id,
          ...this.stageCreateData(s as SeedStageDef, i),
        },
      });
      await this.createNestedStageConfig(created.id, s as SeedStageDef);
    }

    await this.audit(workspaceId, id, actorId, 'pipeline.restored', 'Pipeline', id, null, { version });
    return this.getOne(workspaceId, id);
  }

  async exportPipeline(workspaceId: string, id: string) {
    const pipeline = await this.getOne(workspaceId, id);
    return {
      format: 'woxox-pipeline-v1',
      exportedAt: new Date().toISOString(),
      snapshot: this.toSnapshot(pipeline),
    };
  }

  async importPipeline(workspaceId: string, dto: ImportPipelineDto, actorId?: string) {
    return this.importSnapshot(workspaceId, dto, actorId);
  }

  private async importSnapshot(workspaceId: string, dto: ImportPipelineDto, actorId?: string) {
    const snap = dto.snapshot as ReturnType<PipelinesService['toSnapshot']>;
    if (!snap?.name || !Array.isArray(snap.stages)) {
      throw new BadRequestException('Invalid pipeline snapshot');
    }

    const pipeline = await this.prisma.pipeline.create({
      data: {
        workspaceId,
        name: dto.name || `${snap.name} (imported)`,
        description: snap.description,
        icon: snap.icon,
        color: snap.color || '#0288d1',
        moduleKey: snap.moduleKey || 'crm',
        businessUnit: snap.businessUnit,
        country: snap.country,
        visibility: snap.visibility || 'workspace',
        ownerId: actorId,
      },
    });

    for (const [i, s] of snap.stages.entries()) {
      const created = await this.prisma.pipelineStage.create({
        data: { pipelineId: pipeline.id, ...this.stageCreateData(s as SeedStageDef, i) },
      });
      await this.createNestedStageConfig(created.id, s as SeedStageDef);
    }

    await this.audit(workspaceId, pipeline.id, actorId, 'pipeline.imported', 'Pipeline', pipeline.id, null, null);
    return this.getOne(workspaceId, pipeline.id);
  }

  // ── Templates ────────────────────────────────────────────────────────────

  async listTemplates(workspaceId: string) {
    await this.ensureSystemTemplates();
    return this.prisma.pipelineTemplate.findMany({
      where: { OR: [{ isSystem: true }, { workspaceId }] },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async saveAsTemplate(workspaceId: string, pipelineId: string, dto: SaveTemplateDto, actorId?: string) {
    const pipeline = await this.getOne(workspaceId, pipelineId);
    const stagesJson = pipeline.stages.map((s) => ({
      name: s.name,
      description: s.description,
      sortOrder: s.sortOrder,
      stageType: s.stageType,
      isWon: s.isWon,
      isSuccess: s.isSuccess,
      isLost: s.isLost,
      isClosed: s.isClosed,
      probability: s.probability,
      winProbability: s.winProbability,
      color: s.color,
      icon: s.icon,
      fields: s.fields.map((f) => ({
        fieldKey: f.fieldKey,
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
      })),
      documents: s.documents.map((d) => ({
        docKey: d.docKey,
        label: d.label,
        isRequired: d.isRequired,
      })),
      checklist: s.checklist.map((c) => ({
        label: c.label,
        isRequired: c.isRequired,
      })),
    }));

    const template = await this.prisma.pipelineTemplate.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description || pipeline.description,
        moduleKey: pipeline.moduleKey,
        icon: pipeline.icon,
        color: pipeline.color,
        isSystem: false,
        stagesJson: stagesJson as unknown as Prisma.InputJsonValue,
      },
    });
    await this.audit(workspaceId, pipelineId, actorId, 'template.saved', 'PipelineTemplate', template.id, null, template);
    return template;
  }

  async listAudit(workspaceId: string, pipelineId: string) {
    await this.getOne(workspaceId, pipelineId);
    return this.prisma.pipelineAuditLog.findMany({
      where: { workspaceId, pipelineId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private toSnapshot(pipeline: Awaited<ReturnType<PipelinesService['getOne']>>) {
    return {
      name: pipeline.name,
      description: pipeline.description,
      icon: pipeline.icon,
      color: pipeline.color,
      moduleKey: pipeline.moduleKey,
      businessUnit: pipeline.businessUnit,
      country: pipeline.country,
      visibility: pipeline.visibility,
      stages: pipeline.stages.map((s) => ({
        name: s.name,
        description: s.description,
        sortOrder: s.sortOrder,
        stageType: s.stageType,
        isWon: s.isWon,
        isSuccess: s.isSuccess,
        isLost: s.isLost,
        isClosed: s.isClosed,
        probability: s.probability,
        winProbability: s.winProbability,
        color: s.color,
        icon: s.icon,
        slaHours: s.slaHours,
        estimatedDuration: s.estimatedDuration,
        revenuePercent: s.revenuePercent,
        requiresApproval: s.requiresApproval,
        fields: s.fields,
        documents: s.documents,
        checklist: s.checklist.map((c) => ({ label: c.label, isRequired: c.isRequired })),
      })),
    };
  }

  private async assertStage(workspaceId: string, pipelineId: string, stageId: string) {
    await this.getOne(workspaceId, pipelineId);
    const stage = await this.prisma.pipelineStage.findFirst({ where: { id: stageId, pipelineId } });
    if (!stage) throw new NotFoundException('Stage not found');
    return stage;
  }

  private async audit(
    workspaceId: string,
    pipelineId: string | null,
    actorId: string | null | undefined,
    action: string,
    entity: string,
    entityId: string | null,
    before: unknown,
    after: unknown,
  ) {
    try {
      await this.prisma.pipelineAuditLog.create({
        data: {
          workspaceId,
          pipelineId: pipelineId || undefined,
          actorId: actorId || undefined,
          action,
          entity,
          entityId: entityId || undefined,
          before: before as Prisma.InputJsonValue,
          after: after as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn(`Audit write failed: ${err instanceof Error ? err.message : err}`);
    }
  }
}
