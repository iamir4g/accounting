import { Global, Module } from '@nestjs/common';
import { PrismaControlService } from './prisma-control.service';
import { PrismaTenantService } from './prisma-tenant.service';
import { TenantClientFactory } from './tenant-client.factory';

@Global()
@Module({
  providers: [PrismaControlService, TenantClientFactory, PrismaTenantService],
  exports: [PrismaControlService, PrismaTenantService],
})
export class PrismaModule {}

