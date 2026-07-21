import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { paginated, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, ownerId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        workspaceId,
        ownerId,
        name: dto.name,
        industry: dto.industry,
        website: dto.website,
        revenue: dto.revenue,
        employeeCount: dto.employeeCount,
      },
    });
  }

  async list(workspaceId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: { _count: { select: { contacts: true, deals: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  }

  async getById(workspaceId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        contacts: { where: { deletedAt: null }, take: 50 },
        deals: { where: { deletedAt: null }, take: 20 },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(workspaceId: string, id: string, dto: UpdateCompanyDto) {
    await this.getById(workspaceId, id);
    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        industry: dto.industry,
        website: dto.website,
        revenue: dto.revenue,
        employeeCount: dto.employeeCount,
      },
    });
  }

  async softDelete(workspaceId: string, id: string) {
    await this.getById(workspaceId, id);
    return this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
