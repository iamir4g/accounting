import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class WarehousesController {
  constructor(private readonly warehouses: WarehousesService) {}

  @Post()
  @RequirePermissions('inventory:write')
  create(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehouses.create(dbUrl, user.id, dto);
  }

  @Get()
  @RequirePermissions('products:read')
  findAll(@CurrentTenantDbUrl() dbUrl: string) {
    return this.warehouses.findAll(dbUrl);
  }

  @Get(':id')
  @RequirePermissions('products:read')
  findOne(@CurrentTenantDbUrl() dbUrl: string, @Param('id') id: string) {
    return this.warehouses.findOne(dbUrl, id);
  }

  @Patch(':id')
  @RequirePermissions('inventory:write')
  update(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehouses.update(dbUrl, user.id, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('inventory:write')
  remove(@CurrentTenantDbUrl() dbUrl: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.warehouses.remove(dbUrl, user.id, id);
  }
}

