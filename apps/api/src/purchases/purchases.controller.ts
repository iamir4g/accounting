import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PurchasesController {
  constructor(private readonly purchases: PurchasesService) {}

  @Post('invoices')
  @RequirePermissions('purchases:write')
  create(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePurchaseInvoiceDto,
  ) {
    return this.purchases.createInvoice(dbUrl, user.id, dto);
  }

  @Get('invoices')
  @RequirePermissions('purchases:read')
  list(@CurrentTenantDbUrl() dbUrl: string) {
    return this.purchases.list(dbUrl);
  }

  @Get('invoices/:id')
  @RequirePermissions('purchases:read')
  get(@CurrentTenantDbUrl() dbUrl: string, @Param('id') id: string) {
    return this.purchases.get(dbUrl, id);
  }
}

