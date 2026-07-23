import { Module } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';
import { TransitionValidatorService } from './transition-validator.service';
import { PipelineMongoBridgeService } from './pipeline-mongo-bridge.service';

@Module({
  controllers: [PipelinesController],
  providers: [PipelinesService, TransitionValidatorService, PipelineMongoBridgeService],
  exports: [PipelinesService, TransitionValidatorService],
})
export class PipelinesModule {}
