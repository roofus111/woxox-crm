import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/activity.dto';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateActivityDto) {
    return this.activities.create(user.workspaceId, user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.activities.list(user.workspaceId, query);
  }

  @Patch(':id/complete')
  complete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.activities.complete(user.workspaceId, id);
  }
}
