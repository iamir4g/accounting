import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @RequirePermissions('products:write')
  create(@CurrentTenantDbUrl() dbUrl: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProductDto) {
    return this.products.create(dbUrl, user.id, dto);
  }

  @Get()
  @RequirePermissions('products:read')
  findAll(@CurrentTenantDbUrl() dbUrl: string) {
    return this.products.findAll(dbUrl);
  }

  @Get(':id')
  @RequirePermissions('products:read')
  findOne(@CurrentTenantDbUrl() dbUrl: string, @Param('id') id: string) {
    return this.products.findOne(dbUrl, id);
  }

  @Patch(':id')
  @RequirePermissions('products:write')
  update(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(dbUrl, user.id, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('products:write')
  remove(@CurrentTenantDbUrl() dbUrl: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.products.remove(dbUrl, user.id, id);
  }
}
