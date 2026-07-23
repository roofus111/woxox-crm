import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { ValidateTransitionDto } from './dto/pipeline.dto';

export type TransitionValidationResult = {
  allowed: boolean;
  errors: string[];
  warnings: string[];
};

@Injectable()
export class TransitionValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    workspaceId: string,
    pipelineId: string,
    dto: ValidateTransitionDto,
    actorUserId?: string,
  ): Promise<TransitionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, workspaceId },
      include: {
        stages: {
          include: {
            fields: true,
            documents: true,
            checklist: true,
            permissions: true,
            transitionsFrom: true,
          },
        },
      },
    });

    if (!pipeline) {
      return { allowed: false, errors: ['Pipeline not found'], warnings };
    }

    const fromStage = pipeline.stages.find((s) => s.id === dto.fromStageId);
    const toStage = pipeline.stages.find((s) => s.id === dto.toStageId);

    if (!fromStage || !toStage) {
      return { allowed: false, errors: ['Invalid from/to stage'], warnings };
    }

    const explicitRules = fromStage.transitionsFrom.filter((r) => r.isActive);
    if (explicitRules.length > 0) {
      const match = explicitRules.find((r) => r.toStageId === dto.toStageId);
      if (!match) {
        errors.push('Transition is not allowed by stage rules');
      }
    }

    const movingForward = toStage.sortOrder >= fromStage.sortOrder;
    const perms = fromStage.permissions;
    if (perms.length) {
      const applicable = perms.filter(
        (p) =>
          (!p.userId || p.userId === actorUserId) &&
          (!p.role || !dto.actorRole || p.role === dto.actorRole || dto.actorRole === 'ADMIN'),
      );
      const effective =
        applicable.length > 0
          ? applicable.reduce(
              (acc, p) => ({
                canMoveFwd: acc.canMoveFwd || p.canMoveFwd,
                canMoveBack: acc.canMoveBack || p.canMoveBack,
                canSkip: acc.canSkip || p.canSkip,
              }),
              { canMoveFwd: false, canMoveBack: false, canSkip: false },
            )
          : { canMoveFwd: true, canMoveBack: true, canSkip: false };

      if (movingForward && !effective.canMoveFwd && !effective.canSkip) {
        errors.push('You do not have permission to move forward from this stage');
      }
      if (!movingForward && !effective.canMoveBack && !effective.canSkip) {
        errors.push('You do not have permission to move back from this stage');
      }
    }

    let fieldValues = dto.fieldValues || {};
    let documents = dto.documents || {};
    let checklist = dto.checklist || {};

    if (dto.recordId) {
      const record = await this.prisma.pipelineRecord.findFirst({
        where: { id: dto.recordId, workspaceId, pipelineId },
      });
      if (record) {
        fieldValues = { ...(record.fieldValues as object), ...fieldValues };
        documents = { ...(record.documents as object), ...documents };
        checklist = { ...(record.checklist as object), ...checklist };
      }
    }

    for (const field of fromStage.fields.filter((f) => f.isRequired)) {
      const val = fieldValues[field.fieldKey];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push(`Required field missing: ${field.label}`);
      }
    }

    for (const doc of fromStage.documents.filter((d) => d.isRequired)) {
      const entry = documents[doc.docKey] as { uploaded?: boolean; url?: string } | undefined;
      if (!entry || (!entry.uploaded && !entry.url)) {
        errors.push(`Required document missing: ${doc.label}`);
      }
    }

    const requiredChecks = fromStage.checklist.filter((c) => c.isRequired);
    if (requiredChecks.length) {
      const done = requiredChecks.filter((c) => checklist[c.id]).length;
      const pct = Math.round((done / requiredChecks.length) * 100);
      if (done < requiredChecks.length) {
        errors.push(`Checklist incomplete (${pct}%): complete all required items before leaving this stage`);
      }
    }

    if (fromStage.requiresApproval) {
      warnings.push('Stage requires approval — ensure approval is recorded before transition');
    }

    return { allowed: errors.length === 0, errors, warnings };
  }
}
