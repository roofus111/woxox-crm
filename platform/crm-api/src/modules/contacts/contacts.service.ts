import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { paginated, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, ownerId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        workspaceId,
        ownerId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        emails: dto.emails?.map((e) => e.toLowerCase()) ?? [],
        phones: dto.phones ?? [],
        jobTitle: dto.jobTitle,
        companyId: dto.companyId,
      },
      include: { company: true },
    });
  }

  async list(workspaceId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { emails: { has: query.search.toLowerCase() } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: { company: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  }

  async getById(workspaceId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        company: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 30 },
        deals: { where: { deletedAt: null }, take: 10 },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(workspaceId: string, id: string, dto: UpdateContactDto) {
    await this.getById(workspaceId, id);
    return this.prisma.contact.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        emails: dto.emails?.map((e) => e.toLowerCase()),
        phones: dto.phones,
        jobTitle: dto.jobTitle,
        companyId: dto.companyId,
      },
      include: { company: true },
    });
  }

  async softDelete(workspaceId: string, id: string) {
    await this.getById(workspaceId, id);
    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
