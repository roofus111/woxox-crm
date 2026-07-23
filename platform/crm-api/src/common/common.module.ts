import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { LegacyProvisionService } from './legacy-provision.service';

@Global()
@Module({
  providers: [MailService, LegacyProvisionService],
  exports: [MailService, LegacyProvisionService],
})
export class CommonModule {}
