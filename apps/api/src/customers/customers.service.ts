import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async create(tenantDbUrl: string, actorUserId: string | undefined, dto: CreateCustomerDto) {
    const customer = await this.prisma(tenantDbUrl).customer.create({ data: dto });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'customers.create',
      entityType: 'Customer',
      entityId: customer.id,
      diff: dto,
    });
    return customer;
  }

  findAll(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).customer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(tenantDbUrl: string, id: string) {
    return this.prisma(tenantDbUrl).customer.findUnique({ where: { id } });
  }

  async update(tenantDbUrl: string, actorUserId: string | undefined, id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma(tenantDbUrl).customer.update({ where: { id }, data: dto });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'customers.update',
      entityType: 'Customer',
      entityId: customer.id,
      diff: dto,
    });
    return customer;
  }

  async remove(tenantDbUrl: string, actorUserId: string | undefined, id: string) {
    const customer = await this.prisma(tenantDbUrl).customer.delete({ where: { id } });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'customers.delete',
      entityType: 'Customer',
      entityId: customer.id,
    });
    return customer;
  }
}
