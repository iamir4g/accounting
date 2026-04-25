import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async create(tenantDbUrl: string, actorUserId: string | undefined, dto: CreateWarehouseDto) {
    const warehouse = await this.prisma(tenantDbUrl).warehouse.create({ data: dto });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'warehouses.create',
      entityType: 'Warehouse',
      entityId: warehouse.id,
      diff: dto,
    });
    return warehouse;
  }

  findAll(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).warehouse.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(tenantDbUrl: string, id: string) {
    return this.prisma(tenantDbUrl).warehouse.findUnique({ where: { id } });
  }

  async update(tenantDbUrl: string, actorUserId: string | undefined, id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.prisma(tenantDbUrl).warehouse.update({ where: { id }, data: dto });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'warehouses.update',
      entityType: 'Warehouse',
      entityId: warehouse.id,
      diff: dto,
    });
    return warehouse;
  }

  async remove(tenantDbUrl: string, actorUserId: string | undefined, id: string) {
    const warehouse = await this.prisma(tenantDbUrl).warehouse.delete({ where: { id } });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'warehouses.delete',
      entityType: 'Warehouse',
      entityId: warehouse.id,
    });
    return warehouse;
  }
}

