import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { paginated, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PipelinesService } from '../pipelines/pipelines.service';
import { CreateDealDto, MoveDealStageDto, UpdateDealDto } from './dto/deal.dto';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelines: PipelinesService,
  ) {}

  async create(workspaceId: string, ownerId: string, dto: CreateDealDto) {
    let pipelineId = dto.pipelineId;
    let stageId = dto.stageId;

    if (!pipelineId || !stageId) {
      const pipeline = await this.pipelines.ensureDefault(workspaceId);
      pipelineId = pipeline.id;
      stageId = pipeline.stages.find((s) => !s.isWon && !s.isLost)?.id ?? pipeline.stages[0]?.id;
    }

    return this.prisma.deal.create({
      data: {
        workspaceId,
        ownerId,
        title: dto.title,
        pipelineId,
        stageId,
        leadId: dto.leadId,
        contactId: dto.contactId,
        companyId: dto.companyId,
        amount: dto.amount ?? 0,
        currency: dto.currency ?? 'INR',
        probability: dto.probability,
        expectedCloseAt: dto.expectedCloseAt ? new Date(dto.expectedCloseAt) : undefined,
      },
      include: {
        stage: true,
        contact: true,
        company: true,
      },
    });
  }

  async list(workspaceId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.DealWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        include: {
          stage: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  }

  async getById(workspaceId: string, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        stage: true,
        pipeline: { include: { stages: { orderBy: { sortOrder: 'asc' } } } },
        contact: true,
        company: true,
        lead: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 30 },
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async update(workspaceId: string, id: string, dto: UpdateDealDto) {
    await this.getById(workspaceId, id);
    return this.prisma.deal.update({
      where: { id },
      data: {
        title: dto.title,
        pipelineId: dto.pipelineId,
        stageId: dto.stageId,
        leadId: dto.leadId,
        contactId: dto.contactId,
        companyId: dto.companyId,
        amount: dto.amount,
        currency: dto.currency,
        probability: dto.probability,
        expectedCloseAt: dto.expectedCloseAt ? new Date(dto.expectedCloseAt) : undefined,
      },
      include: { stage: true, contact: true, company: true },
    });
  }

  async moveStage(workspaceId: string, id: string, dto: MoveDealStageDto) {
    const deal = await this.getById(workspaceId, id);
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id: dto.stageId, pipelineId: deal.pipelineId ?? undefined },
    });
    if (!stage) throw new NotFoundException('Stage not found in deal pipeline');

    return this.prisma.deal.update({
      where: { id },
      data: {
        stageId: stage.id,
        probability: stage.probability,
        closedAt: stage.isWon || stage.isLost ? new Date() : null,
        wonReason: stage.isWon ? deal.wonReason : null,
        lostReason: stage.isLost ? deal.lostReason : null,
      },
      include: { stage: true },
    });
  }

  async softDelete(workspaceId: string, id: string) {
    await this.getById(workspaceId, id);
    return this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
