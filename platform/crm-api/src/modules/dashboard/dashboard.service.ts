import { Injectable } from '@nestjs/common';
import { LeadStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { PipelinesService } from '../pipelines/pipelines.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelines: PipelinesService,
  ) {}

  async getSummary(workspaceId: string) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const pipeline = await this.pipelines.ensureDefault(workspaceId);

    const [
      totalLeads,
      qualifiedLeads,
      totalContacts,
      totalCompanies,
      openDeals,
      wonDeals,
      lostDeals,
      pipelineValue,
      wonValue,
      tasksDueToday,
      openTasks,
      activitiesToday,
      recentActivities,
      leadsByStatus,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { workspaceId, deletedAt: null } }),
      this.prisma.lead.count({
        where: { workspaceId, deletedAt: null, status: LeadStatus.QUALIFIED },
      }),
      this.prisma.contact.count({ where: { workspaceId, deletedAt: null } }),
      this.prisma.company.count({ where: { workspaceId, deletedAt: null } }),
      this.prisma.deal.count({
        where: { workspaceId, deletedAt: null, closedAt: null },
      }),
      this.prisma.deal.count({
        where: {
          workspaceId,
          deletedAt: null,
          stage: { isWon: true },
        },
      }),
      this.prisma.deal.count({
        where: {
          workspaceId,
          deletedAt: null,
          stage: { isLost: true },
        },
      }),
      this.prisma.deal.aggregate({
        where: { workspaceId, deletedAt: null, closedAt: null },
        _sum: { amount: true },
      }),
      this.prisma.deal.aggregate({
        where: {
          workspaceId,
          deletedAt: null,
          stage: { isWon: true },
        },
        _sum: { amount: true },
      }),
      this.prisma.task.count({
        where: {
          workspaceId,
          deletedAt: null,
          status: { not: TaskStatus.COMPLETED },
          dueAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      this.prisma.task.count({
        where: {
          workspaceId,
          deletedAt: null,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
        },
      }),
      this.prisma.activity.count({
        where: {
          workspaceId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      this.prisma.activity.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: { workspaceId, deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const winRate =
      wonDeals + lostDeals > 0
        ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100)
        : 0;

    return {
      kpis: {
        totalLeads,
        qualifiedLeads,
        totalContacts,
        totalCompanies,
        openDeals,
        wonDeals,
        lostDeals,
        pipelineValue: Number(pipelineValue._sum.amount ?? 0),
        wonValue: Number(wonValue._sum.amount ?? 0),
        winRate,
        tasksDueToday,
        openTasks,
        activitiesToday,
      },
      funnel: leadsByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      defaultPipelineId: pipeline.id,
      recentActivities,
    };
  }
}
