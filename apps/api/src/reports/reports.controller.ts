import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('profit-loss')
  @RequirePermissions('reports:read')
  profitLoss(
    @CurrentTenantDbUrl() dbUrl: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reports.profitLoss(dbUrl, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('balance-sheet')
  @RequirePermissions('reports:read')
  balanceSheet(@CurrentTenantDbUrl() dbUrl: string, @Query('at') at?: string) {
    return this.reports.balanceSheet(dbUrl, { at: at ? new Date(at) : undefined });
  }

  @Get('inventory-valuation')
  @RequirePermissions('reports:read')
  inventoryValuation(@CurrentTenantDbUrl() dbUrl: string, @Query('warehouseId') warehouseId?: string) {
    return this.reports.inventoryValuation(dbUrl, { warehouseId });
  }

  @Get('ledger')
  @RequirePermissions('reports:read')
  ledger(
    @CurrentTenantDbUrl() dbUrl: string,
    @Query('accountId') accountId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reports.ledger(dbUrl, {
      accountId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}
