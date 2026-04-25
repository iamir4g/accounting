import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post()
  @RequirePermissions('customers:write')
  create(@CurrentTenantDbUrl() dbUrl: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCustomerDto) {
    return this.customers.create(dbUrl, user.id, dto);
  }

  @Get()
  @RequirePermissions('customers:read')
  findAll(@CurrentTenantDbUrl() dbUrl: string) {
    return this.customers.findAll(dbUrl);
  }

  @Get(':id')
  @RequirePermissions('customers:read')
  findOne(@CurrentTenantDbUrl() dbUrl: string, @Param('id') id: string) {
    return this.customers.findOne(dbUrl, id);
  }

  @Patch(':id')
  @RequirePermissions('customers:write')
  update(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(dbUrl, user.id, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('customers:write')
  remove(@CurrentTenantDbUrl() dbUrl: string, @CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customers.remove(dbUrl, user.id, id);
  }
}
