import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantsController } from './tenants.controller';
import { TenantProvisionerService } from './tenant-provisioner.service';
import { TenantsService } from './tenants.service';

@Module({
  imports: [ConfigModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantProvisionerService],
  exports: [TenantsService],
})
export class TenantsModule {}

