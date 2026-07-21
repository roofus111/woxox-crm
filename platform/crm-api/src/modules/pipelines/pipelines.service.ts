import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { CreatePipelineDto, CreateStageDto } from './dto/pipeline.dto';

const DEFAULT_STAGES: CreateStageDto[] = [
  { name: 'Qualification', probability: 10, sortOrder: 0 },
  { name: 'Proposal', probability: 40, sortOrder: 1 },
  { name: 'Negotiation', probability: 70, sortOrder: 2 },
  { name: 'Won', probability: 100, sortOrder: 3, isWon: true },
  { name: 'Lost', probability: 0, sortOrder: 4, isLost: true },
];

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefault(workspaceId: string) {
    const existing = await this.prisma.pipeline.findFirst({
      where: { workspaceId, isDefault: true },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (existing) return existing;

    return this.prisma.pipeline.create({
      data: {
        workspaceId,
        name: 'Sales Pipeline',
        isDefault: true,
        stages: { create: DEFAULT_STAGES },
      },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async list(workspaceId: string) {
    await this.ensureDefault(workspaceId);
    return this.prisma.pipeline.findMany({
      where: { workspaceId },
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { deals: true } },
      },
      orderBy: { isDefault: 'desc' },
    });
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
          },
        },
      },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async create(workspaceId: string, dto: CreatePipelineDto) {
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { workspaceId },
        data: { isDefault: false },
      });
    }
    return this.prisma.pipeline.create({
      data: {
        workspaceId,
        name: dto.name,
        isDefault: dto.isDefault ?? false,
        stages: { create: DEFAULT_STAGES },
      },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async addStage(workspaceId: string, pipelineId: string, dto: CreateStageDto) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, workspaceId },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    if (dto.isWon && dto.isLost) {
      throw new BadRequestException('Stage cannot be both won and lost');
    }
    return this.prisma.pipelineStage.create({
      data: {
        pipelineId,
        name: dto.name,
        probability: dto.probability ?? 0,
        sortOrder: dto.sortOrder ?? 0,
        isWon: dto.isWon ?? false,
        isLost: dto.isLost ?? false,
      },
    });
  }
}
