import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { paginated, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, ownerId: string, dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        workspaceId,
        ownerId,
        type: dto.type,
        subject: dto.subject,
        body: dto.body,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        leadId: dto.leadId,
        contactId: dto.contactId,
        dealId: dto.dealId,
      },
    });
  }

  async list(workspaceId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = { workspaceId };

    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  }

  async complete(workspaceId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, workspaceId },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return this.prisma.activity.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }
}
