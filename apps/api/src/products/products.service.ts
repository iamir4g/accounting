import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async create(tenantDbUrl: string, actorUserId: string | undefined, dto: CreateProductDto) {
    const product = await this.prisma(tenantDbUrl).product.create({
      data: {
        ...dto,
        salePrice: dto.salePrice,
        purchasePrice: dto.purchasePrice,
        taxRate: dto.taxRate ?? 0,
        minStock: dto.minStock ?? 0,
      },
      include: { unit: true, category: true },
    });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'products.create',
      entityType: 'Product',
      entityId: product.id,
      diff: dto,
    });
    return product;
  }

  findAll(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { unit: true, category: true },
    });
  }

  findOne(tenantDbUrl: string, id: string) {
    return this.prisma(tenantDbUrl).product.findUnique({
      where: { id },
      include: { unit: true, category: true },
    });
  }

  async update(tenantDbUrl: string, actorUserId: string | undefined, id: string, dto: UpdateProductDto) {
    const product = await this.prisma(tenantDbUrl).product.update({
      where: { id },
      data: {
        ...dto,
        taxRate: dto.taxRate ?? undefined,
        minStock: dto.minStock ?? undefined,
      },
      include: { unit: true, category: true },
    });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'products.update',
      entityType: 'Product',
      entityId: product.id,
      diff: dto,
    });
    return product;
  }

  async remove(tenantDbUrl: string, actorUserId: string | undefined, id: string) {
    const product = await this.prisma(tenantDbUrl).product.delete({ where: { id } });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'products.delete',
      entityType: 'Product',
      entityId: product.id,
    });
    return product;
  }
}
