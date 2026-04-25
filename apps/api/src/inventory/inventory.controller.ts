import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateInventoryTxnDto } from './dto/create-inventory-txn.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Post('txns')
  @RequirePermissions('inventory:write')
  createTxn(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInventoryTxnDto,
  ) {
    return this.inventory.createTxn(dbUrl, user.id, dto);
  }

  @Get('stock')
  @RequirePermissions('reports:read')
  stock(
    @CurrentTenantDbUrl() dbUrl: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('lowStock') lowStockRaw?: string,
  ) {
    const lowStock = lowStockRaw === '1' || lowStockRaw === 'true';
    return this.inventory.stock(dbUrl, { warehouseId, lowStock });
  }
}

