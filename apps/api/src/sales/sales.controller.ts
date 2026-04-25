import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Post('invoices')
  @RequirePermissions('sales:write')
  create(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSalesInvoiceDto,
  ) {
    return this.sales.createInvoice(dbUrl, user.id, dto);
  }

  @Get('invoices')
  @RequirePermissions('sales:read')
  list(@CurrentTenantDbUrl() dbUrl: string) {
    return this.sales.list(dbUrl);
  }

  @Get('invoices/:id')
  @RequirePermissions('sales:read')
  get(@CurrentTenantDbUrl() dbUrl: string, @Param('id') id: string) {
    return this.sales.get(dbUrl, id);
  }
}

