import { Module } from '@nestjs/common';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PipelinesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
