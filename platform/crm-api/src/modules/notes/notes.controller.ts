import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { NotesService } from './notes.service';
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

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get('tags')
  tags(@CurrentUser() user: JwtPayload) {
    return this.notes.ensureDefaultTags(user.workspaceId);
  }

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: ListNotesQueryDto) {
    return this.notes.list(user.workspaceId, user.sub, query);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateNoteDto) {
    return this.notes.create(user.workspaceId, user.sub, dto);
  }

  @Get('stickies')
  listStickies(
    @CurrentUser() user: JwtPayload,
    @Query('pageKey') pageKey?: string,
  ) {
    return this.notes.listStickies(user.workspaceId, user.sub, pageKey || 'dashboard');
  }

  @Post('stickies')
  createSticky(@CurrentUser() user: JwtPayload, @Body() dto: CreateStickyDto) {
    return this.notes.createSticky(user.workspaceId, user.sub, dto);
  }

  @Patch('stickies/:id')
  updateSticky(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStickyDto,
  ) {
    return this.notes.updateSticky(user.workspaceId, user.sub, id, dto);
  }

  @Put('stickies/:id/position')
  upsertPosition(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpsertStickyPositionDto,
  ) {
    return this.notes.upsertStickyPosition(user.workspaceId, user.sub, id, dto);
  }

  @Post('stickies/:id/duplicate')
  duplicateSticky(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notes.duplicateSticky(user.workspaceId, user.sub, id);
  }

  @Post('stickies/:id/convert-to-note')
  convertSticky(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notes.convertStickyToNote(user.workspaceId, user.sub, id);
  }

  @Delete('stickies/:id')
  deleteSticky(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notes.deleteSticky(user.workspaceId, user.sub, id);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notes.getOne(user.workspaceId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notes.update(user.workspaceId, user.sub, id, dto);
  }

  @Post(':id/trash')
  trash(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notes.trash(user.workspaceId, user.sub, id);
  }

  @Post(':id/restore')
  restore(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notes.restore(user.workspaceId, user.sub, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notes.remove(user.workspaceId, id);
  }

  @Post(':id/links')
  addLink(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddNoteLinkDto,
  ) {
    return this.notes.addLink(user.workspaceId, id, dto);
  }

  @Delete(':id/links/:linkId')
  removeLink(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('linkId') linkId: string,
  ) {
    return this.notes.removeLink(user.workspaceId, id, linkId);
  }

  @Post(':id/comments')
  addComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddNoteCommentDto,
  ) {
    return this.notes.addComment(user.workspaceId, user.sub, id, dto);
  }

  @Post(':id/share')
  share(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ShareNoteDto,
  ) {
    return this.notes.share(user.workspaceId, id, dto);
  }
}
