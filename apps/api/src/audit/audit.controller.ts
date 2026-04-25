import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly prismaTenant: PrismaTenantService) {}

  @Get()
  @RequirePermissions('reports:read')
  async list(
    @CurrentTenantDbUrl() tenantDbUrl: string,
    @Query('take') takeRaw?: string,
  ) {
    const take = Math.min(Number(takeRaw ?? 50), 200);
    const prisma = this.prismaTenant.getTenantClient(tenantDbUrl);
    return prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take });
  }
}

