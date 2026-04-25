import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AccountingController } from './accounting.controller';
import { AccountingPostingService } from './accounting-posting.service';
import { AccountingService } from './accounting.service';

@Module({
  imports: [AuditModule],
  controllers: [AccountingController],
  providers: [AccountingService, AccountingPostingService],
  exports: [AccountingService, AccountingPostingService],
})
export class AccountingModule {}
