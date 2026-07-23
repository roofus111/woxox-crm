import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PipelinesService } from './pipelines.service';
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

@ApiTags('pipelines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelines: PipelinesService) {}

  @Get('templates')
  listTemplates(@CurrentUser() user: JwtPayload) {
    return this.pipelines.listTemplates(user.workspaceId);
  }

  @Post('templates/apply')
  applyTemplate(@CurrentUser() user: JwtPayload, @Body() dto: ApplyTemplateDto) {
    return this.pipelines.createFromTemplate(user.workspaceId, dto);
  }

  @Post('import')
  importPipeline(@CurrentUser() user: JwtPayload, @Body() dto: ImportPipelineDto) {
    return this.pipelines.importPipeline(user.workspaceId, dto, user.sub);
  }

  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Query('moduleKey') moduleKey?: string,
    @Query('archived') archived?: string,
  ) {
    return this.pipelines.list(user.workspaceId, {
      moduleKey,
      archived: archived === 'true',
    });
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePipelineDto) {
    return this.pipelines.create(user.workspaceId, dto, user.sub);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelines.getOne(user.workspaceId, id);
  }

  @Get(':id/board')
  board(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelines.getBoard(user.workspaceId, id);
  }

  @Get(':id/export')
  export(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelines.exportPipeline(user.workspaceId, id);
  }

  @Get(':id/versions')
  versions(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelines.listVersions(user.workspaceId, id);
  }

  @Get(':id/audit')
  audit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelines.listAudit(user.workspaceId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelines.update(user.workspaceId, id, dto, user.sub);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelines.remove(user.workspaceId, id, user.sub);
  }

  @Post(':id/clone')
  clone(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ClonePipelineDto,
  ) {
    return this.pipelines.clone(user.workspaceId, id, dto, user.sub);
  }

  @Post(':id/publish')
  publish(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: PublishPipelineDto,
  ) {
    return this.pipelines.publish(user.workspaceId, id, dto, user.sub);
  }

  @Post(':id/versions/:version/restore')
  restore(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.pipelines.restoreVersion(user.workspaceId, id, version, user.sub);
  }

  @Post(':id/save-template')
  saveTemplate(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SaveTemplateDto,
  ) {
    return this.pipelines.saveAsTemplate(user.workspaceId, id, dto, user.sub);
  }

  @Post(':id/validate-transition')
  validateTransition(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ValidateTransitionDto,
  ) {
    return this.pipelines.validateTransition(user.workspaceId, id, dto, user.sub);
  }

  @Post(':id/stages')
  addStage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.pipelines.addStage(user.workspaceId, id, dto, user.sub);
  }

  @Put(':id/stages/reorder')
  reorder(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReorderStagesDto,
  ) {
    return this.pipelines.reorderStages(user.workspaceId, id, dto, user.sub);
  }

  @Patch(':id/stages/:stageId')
  updateStage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.pipelines.updateStage(user.workspaceId, id, stageId, dto, user.sub);
  }

  @Delete(':id/stages/:stageId')
  deleteStage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
  ) {
    return this.pipelines.deleteStage(user.workspaceId, id, stageId, user.sub);
  }

  @Post(':id/stages/:stageId/duplicate')
  duplicateStage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
  ) {
    return this.pipelines.duplicateStage(user.workspaceId, id, stageId, user.sub);
  }

  @Post(':id/stages/:stageId/fields')
  upsertField(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() dto: StageFieldDto,
  ) {
    return this.pipelines.upsertField(user.workspaceId, id, stageId, dto);
  }

  @Delete(':id/stages/:stageId/fields/:fieldId')
  deleteField(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return this.pipelines.deleteField(user.workspaceId, id, stageId, fieldId);
  }

  @Post(':id/stages/:stageId/documents')
  upsertDocument(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() dto: StageDocumentDto,
  ) {
    return this.pipelines.upsertDocument(user.workspaceId, id, stageId, dto);
  }

  @Delete(':id/stages/:stageId/documents/:docId')
  deleteDocument(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Param('docId') docId: string,
  ) {
    return this.pipelines.deleteDocument(user.workspaceId, id, stageId, docId);
  }

  @Post(':id/stages/:stageId/checklist')
  addChecklist(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() dto: StageChecklistDto,
  ) {
    return this.pipelines.addChecklistItem(user.workspaceId, id, stageId, dto);
  }

  @Delete(':id/stages/:stageId/checklist/:itemId')
  deleteChecklist(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.pipelines.deleteChecklistItem(user.workspaceId, id, stageId, itemId);
  }

  @Post(':id/stages/:stageId/permissions')
  addPermission(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() dto: StagePermissionDto,
  ) {
    return this.pipelines.addPermission(user.workspaceId, id, stageId, dto);
  }

  @Delete(':id/stages/:stageId/permissions/:permId')
  deletePermission(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Param('permId') permId: string,
  ) {
    return this.pipelines.deletePermission(user.workspaceId, id, stageId, permId);
  }

  @Post(':id/stages/:stageId/automations')
  addAutomation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() dto: StageAutomationDto,
  ) {
    return this.pipelines.addAutomation(user.workspaceId, id, stageId, dto);
  }

  @Delete(':id/stages/:stageId/automations/:autoId')
  deleteAutomation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Param('autoId') autoId: string,
  ) {
    return this.pipelines.deleteAutomation(user.workspaceId, id, stageId, autoId);
  }

  @Post(':id/transitions')
  upsertTransition(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: TransitionRuleDto,
  ) {
    return this.pipelines.upsertTransition(user.workspaceId, id, dto);
  }

  @Delete(':id/transitions/:ruleId')
  deleteTransition(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('ruleId') ruleId: string,
  ) {
    return this.pipelines.deleteTransition(user.workspaceId, id, ruleId);
  }
}
