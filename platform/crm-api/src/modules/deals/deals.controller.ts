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
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { DealsService } from './deals.service';
import { CreateDealDto, MoveDealStageDto, UpdateDealDto } from './dto/deal.dto';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDealDto) {
    return this.deals.create(user.workspaceId, user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.deals.list(user.workspaceId, query);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deals.getById(user.workspaceId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.deals.update(user.workspaceId, id, dto);
  }

  @Put(':id/stage')
  moveStage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: MoveDealStageDto,
  ) {
    return this.deals.moveStage(user.workspaceId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deals.softDelete(user.workspaceId, id);
  }
}
