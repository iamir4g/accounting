import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CustomersController } from './customers.controller';
import { CustomersSummaryController } from './customers.summary.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [AuditModule],
  controllers: [CustomersController, CustomersSummaryController],
  providers: [CustomersService],
})
export class CustomersModule {}
