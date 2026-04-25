import { Module } from '@nestjs/common';
import { AccountingModule } from '../accounting/accounting.module';
import { AuditModule } from '../audit/audit.module';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesController } from './sales.controller';
import { CogsService } from './cogs.service';
import { SalesService } from './sales.service';

@Module({
  imports: [AuditModule, InventoryModule, AccountingModule],
  controllers: [SalesController],
  providers: [SalesService, CogsService],
})
export class SalesModule {}
