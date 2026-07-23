import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import {
  AddNoteCommentDto,
  AddNoteLinkDto,
  CreateNoteDto,
  CreateStickyDto,
  ListNotesQueryDto,
  ShareNoteDto,
  UpdateNoteDto,
  UpdateStickyDto,
  UpsertStickyPositionDto,
} from './dto/notes.dto';

const DEFAULT_TAGS = [
  { name: 'Work', color: '#90CAF9' },
  { name: 'Personal', color: '#A5D6A7' },
  { name: 'Urgent', color: '#EF9A9A' },
  { name: 'Meeting', color: '#CE93D8' },
  { name: 'Ideas', color: '#FFE082' },
];

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaultTags(workspaceId: string) {
    for (const tag of DEFAULT_TAGS) {
      await this.prisma.noteTag.upsert({
        where: { workspaceId_name: { workspaceId, name: tag.name } },
        create: { workspaceId, name: tag.name, color: tag.color },
        update: {},
      });
    }
    return this.prisma.noteTag.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  private noteInclude() {
    return {
      tags: { include: { tag: true } },
      links: true,
      attachments: true,
      shares: true,
      _count: { select: { comments: true } },
    } as const;
  }

  async list(workspaceId: string, userId: string, query: ListNotesQueryDto) {
    await this.ensureDefaultTags(workspaceId);
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '30', 10) || 30));
    const folder = query.folder || 'all';

    const where: any = {
      workspaceId,
      OR: [{ createdById: userId }, { shares: { some: { userId } }, visibility: { in: ['shared', 'public'] } }, { visibility: 'public' }],
    };

    if (folder === 'pinned') {
      where.isPinned = true;
      where.trashedAt = null;
      where.isArchived = false;
    } else if (folder === 'favorites') {
      where.isFavorite = true;
      where.trashedAt = null;
      where.isArchived = false;
    } else if (folder === 'archive') {
      where.isArchived = true;
      where.trashedAt = null;
    } else if (folder === 'trash') {
      where.trashedAt = { not: null };
    } else {
      where.trashedAt = null;
      where.isArchived = false;
    }

    if (query.tag) {
      where.tags = { some: { tag: { name: query.tag } } };
    }
    if (query.q) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: query.q, mode: 'insensitive' } },
            { contentHtml: { contains: query.q, mode: 'insensitive' } },
          ],
        },
      ];
    }
    if (query.entityType && query.entityId) {
      where.links = { some: { entityType: query.entityType, entityId: query.entityId } };
    }

    const [items, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        include: this.noteInclude(),
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.note.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getOne(workspaceId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, workspaceId },
      include: {
        ...this.noteInclude(),
        comments: { orderBy: { createdAt: 'asc' } },
        reminders: true,
      },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  private async resolveTagIds(workspaceId: string, tagIds?: string[], tagNames?: string[]) {
    const ids = new Set<string>(tagIds || []);
    if (tagNames?.length) {
      for (const name of tagNames) {
        const tag = await this.prisma.noteTag.upsert({
          where: { workspaceId_name: { workspaceId, name } },
          create: { workspaceId, name, color: '#90CAF9' },
          update: {},
        });
        ids.add(tag.id);
      }
    }
    return [...ids];
  }

  async create(workspaceId: string, userId: string, dto: CreateNoteDto) {
    await this.ensureDefaultTags(workspaceId);
    const tagIds = await this.resolveTagIds(workspaceId, dto.tagIds, dto.tagNames);

    const note = await this.prisma.note.create({
      data: {
        workspaceId,
        createdById: userId,
        updatedById: userId,
        title: dto.title || 'Untitled',
        contentHtml: dto.contentHtml || '',
        contentJson: dto.contentJson ?? {},
        color: dto.color || '#FFF59D',
        isPinned: dto.isPinned || false,
        isFavorite: dto.isFavorite || false,
        reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : null,
        tags: tagIds.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        links: dto.links?.length
          ? {
              create: dto.links.map((l) => ({
                entityType: l.entityType,
                entityId: l.entityId,
                label: l.label,
              })),
            }
          : undefined,
        activityLogs: {
          create: { userId, action: 'created', details: 'Note created' },
        },
      },
      include: this.noteInclude(),
    });

    if (dto.reminderAt) {
      await this.prisma.noteReminder.create({
        data: { noteId: note.id, remindAt: new Date(dto.reminderAt), channel: 'in_app' },
      });
    }

    return note;
  }

  async update(workspaceId: string, userId: string, id: string, dto: UpdateNoteDto) {
    await this.getOne(workspaceId, id);

    if (dto.tagIds || dto.tagNames) {
      const tagIds = await this.resolveTagIds(workspaceId, dto.tagIds, dto.tagNames);
      await this.prisma.noteTagOnNote.deleteMany({ where: { noteId: id } });
      if (tagIds.length) {
        await this.prisma.noteTagOnNote.createMany({
          data: tagIds.map((tagId) => ({ noteId: id, tagId })),
        });
      }
    }

    const note = await this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.contentHtml !== undefined ? { contentHtml: dto.contentHtml } : {}),
        ...(dto.contentJson !== undefined ? { contentJson: dto.contentJson } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.isPinned !== undefined ? { isPinned: dto.isPinned } : {}),
        ...(dto.isFavorite !== undefined ? { isFavorite: dto.isFavorite } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
        ...(dto.reminderAt !== undefined
          ? { reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : null }
          : {}),
        updatedById: userId,
        activityLogs: {
          create: { userId, action: 'updated', details: 'Note updated' },
        },
      },
      include: this.noteInclude(),
    });

    return note;
  }

  async trash(workspaceId: string, userId: string, id: string) {
    await this.getOne(workspaceId, id);
    return this.prisma.note.update({
      where: { id },
      data: {
        trashedAt: new Date(),
        activityLogs: { create: { userId, action: 'trashed' } },
      },
    });
  }

  async restore(workspaceId: string, userId: string, id: string) {
    await this.getOne(workspaceId, id);
    return this.prisma.note.update({
      where: { id },
      data: {
        trashedAt: null,
        isArchived: false,
        activityLogs: { create: { userId, action: 'restored' } },
      },
      include: this.noteInclude(),
    });
  }

  async remove(workspaceId: string, id: string) {
    await this.getOne(workspaceId, id);
    await this.prisma.note.delete({ where: { id } });
    return { success: true };
  }

  async addLink(workspaceId: string, noteId: string, dto: AddNoteLinkDto) {
    await this.getOne(workspaceId, noteId);
    return this.prisma.noteLink.upsert({
      where: {
        noteId_entityType_entityId: {
          noteId,
          entityType: dto.entityType,
          entityId: dto.entityId,
        },
      },
      create: {
        noteId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        label: dto.label,
      },
      update: { label: dto.label },
    });
  }

  async removeLink(workspaceId: string, noteId: string, linkId: string) {
    await this.getOne(workspaceId, noteId);
    await this.prisma.noteLink.deleteMany({ where: { id: linkId, noteId } });
    return { success: true };
  }

  async addComment(workspaceId: string, userId: string, noteId: string, dto: AddNoteCommentDto) {
    await this.getOne(workspaceId, noteId);
    return this.prisma.noteComment.create({
      data: {
        noteId,
        userId,
        body: dto.body,
        mentions: dto.mentions || [],
      },
    });
  }

  async share(workspaceId: string, noteId: string, dto: ShareNoteDto) {
    await this.getOne(workspaceId, noteId);
    await this.prisma.note.update({
      where: { id: noteId },
      data: { visibility: 'shared' },
    });
    return this.prisma.noteShare.upsert({
      where: { noteId_userId: { noteId, userId: dto.userId } },
      create: {
        noteId,
        userId: dto.userId,
        permission: dto.permission || 'view',
      },
      update: { permission: dto.permission || 'view' },
    });
  }

  // ── Stickies ─────────────────────────────────────────────────────────────

  async listStickies(workspaceId: string, userId: string, pageKey = 'dashboard') {
    const items = await this.prisma.stickyNote.findMany({
      where: {
        workspaceId,
        createdById: userId,
        isArchived: false,
      },
      include: {
        positions: { where: { userId, pageKey } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return items;
  }

  async createSticky(workspaceId: string, userId: string, dto: CreateStickyDto) {
    const sticky = await this.prisma.stickyNote.create({
      data: {
        workspaceId,
        createdById: userId,
        title: dto.title || 'Sticky',
        content: dto.content || '',
        checklist: dto.checklist ?? [],
        color: dto.color || '#FFF59D',
        isPinned: dto.isPinned || false,
        isFavorite: dto.isFavorite || false,
        reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : null,
        recurrence: dto.recurrence || null,
        positions: {
          create: {
            userId,
            pageKey: 'dashboard',
            x: dto.x ?? 80 + Math.random() * 120,
            y: dto.y ?? 80 + Math.random() * 80,
            width: 240,
            height: 200,
            zIndex: 10,
          },
        },
      },
      include: { positions: true },
    });
    return sticky;
  }

  async updateSticky(workspaceId: string, userId: string, id: string, dto: UpdateStickyDto) {
    const existing = await this.prisma.stickyNote.findFirst({
      where: { id, workspaceId, createdById: userId },
    });
    if (!existing) throw new NotFoundException('Sticky note not found');

    return this.prisma.stickyNote.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.checklist !== undefined ? { checklist: dto.checklist } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.isPinned !== undefined ? { isPinned: dto.isPinned } : {}),
        ...(dto.isFavorite !== undefined ? { isFavorite: dto.isFavorite } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
        ...(dto.reminderAt !== undefined
          ? { reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : null }
          : {}),
        ...(dto.recurrence !== undefined ? { recurrence: dto.recurrence } : {}),
      },
      include: { positions: { where: { userId } } },
    });
  }

  async upsertStickyPosition(
    workspaceId: string,
    userId: string,
    stickyId: string,
    dto: UpsertStickyPositionDto,
  ) {
    const sticky = await this.prisma.stickyNote.findFirst({
      where: { id: stickyId, workspaceId, createdById: userId },
    });
    if (!sticky) throw new NotFoundException('Sticky note not found');

    const pageKey = dto.pageKey || 'dashboard';
    return this.prisma.stickyPosition.upsert({
      where: {
        stickyNoteId_userId_pageKey: {
          stickyNoteId: stickyId,
          userId,
          pageKey,
        },
      },
      create: {
        stickyNoteId: stickyId,
        userId,
        pageKey,
        x: dto.x,
        y: dto.y,
        width: dto.width ?? 240,
        height: dto.height ?? 200,
        zIndex: dto.zIndex ?? 1,
      },
      update: {
        x: dto.x,
        y: dto.y,
        ...(dto.width !== undefined ? { width: dto.width } : {}),
        ...(dto.height !== undefined ? { height: dto.height } : {}),
        ...(dto.zIndex !== undefined ? { zIndex: dto.zIndex } : {}),
      },
    });
  }

  async deleteSticky(workspaceId: string, userId: string, id: string) {
    const sticky = await this.prisma.stickyNote.findFirst({
      where: { id, workspaceId, createdById: userId },
    });
    if (!sticky) throw new NotFoundException('Sticky note not found');
    await this.prisma.stickyNote.delete({ where: { id } });
    return { success: true };
  }

  async convertStickyToNote(workspaceId: string, userId: string, stickyId: string) {
    const sticky = await this.prisma.stickyNote.findFirst({
      where: { id: stickyId, workspaceId, createdById: userId },
    });
    if (!sticky) throw new NotFoundException('Sticky note not found');

    return this.create(workspaceId, userId, {
      title: sticky.title,
      contentHtml: `<p>${(sticky.content || '').replace(/\n/g, '<br/>')}</p>`,
      color: sticky.color,
      isPinned: sticky.isPinned,
      isFavorite: sticky.isFavorite,
      reminderAt: sticky.reminderAt?.toISOString(),
    });
  }

  async duplicateSticky(workspaceId: string, userId: string, stickyId: string) {
    const sticky = await this.prisma.stickyNote.findFirst({
      where: { id: stickyId, workspaceId, createdById: userId },
      include: { positions: { where: { userId }, take: 1 } },
    });
    if (!sticky) throw new NotFoundException('Sticky note not found');
    const pos = sticky.positions[0];
    return this.createSticky(workspaceId, userId, {
      title: `${sticky.title} (copy)`,
      content: sticky.content,
      checklist: sticky.checklist as any,
      color: sticky.color,
      x: (pos?.x || 80) + 24,
      y: (pos?.y || 80) + 24,
    });
  }
}
