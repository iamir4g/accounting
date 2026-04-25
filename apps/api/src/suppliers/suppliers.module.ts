import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { SuppliersController } from './suppliers.controller';
import { SuppliersSummaryController } from './suppliers.summary.controller';
import { SuppliersService } from './suppliers.service';

@Module({
  imports: [AuditModule],
  controllers: [SuppliersController, SuppliersSummaryController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
