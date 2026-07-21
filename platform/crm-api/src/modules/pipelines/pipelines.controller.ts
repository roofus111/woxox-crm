import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, CreateStageDto } from './dto/pipeline.dto';

@ApiTags('pipelines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelines: PipelinesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.pipelines.list(user.workspaceId);
  }

  @Get(':id/board')
  board(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelines.getBoard(user.workspaceId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePipelineDto) {
    return this.pipelines.create(user.workspaceId, dto);
  }

  @Post(':id/stages')
  addStage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.pipelines.addStage(user.workspaceId, id, dto);
  }
}
