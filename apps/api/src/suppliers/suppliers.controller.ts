import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Post()
  @RequirePermissions('suppliers:write')
  create(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.suppliers.create(dbUrl, user.id, dto);
  }

  @Get()
  @RequirePermissions('suppliers:read')
  findAll(@CurrentTenantDbUrl() dbUrl: string) {
    return this.suppliers.findAll(dbUrl);
  }

  @Get(':id')
  @RequirePermissions('suppliers:read')
  findOne(@CurrentTenantDbUrl() dbUrl: string, @Param('id') id: string) {
    return this.suppliers.findOne(dbUrl, id);
  }

  @Patch(':id')
  @RequirePermissions('suppliers:write')
  update(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliers.update(dbUrl, user.id, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('suppliers:write')
  remove(@CurrentTenantDbUrl() dbUrl: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.suppliers.remove(dbUrl, user.id, id);
  }
}

