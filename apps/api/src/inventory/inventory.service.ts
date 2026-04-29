import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '../prisma/generated/tenant';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { CreateInventoryTxnDto, InventoryTxnTypeDto } from './dto/create-inventory-txn.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async createTxn(tenantDbUrl: string, actorUserId: string | undefined, dto: CreateInventoryTxnDto) {
    const prisma = this.prisma(tenantDbUrl);

    return prisma.$transaction(async (tx) => {
      this.validate(dto);
      const txn = await tx.inventoryTxn.create({
        data: {
          type: dto.type as any,
          productId: dto.productId,
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
          qty: dto.qty as any,
          unitCost: dto.unitCost as any,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          actorUserId,
        },
      });

      await this.applyStock(tx, dto);

      await this.audit.log({
        tenantDbUrl,
        actorUserId,
        action: 'inventory.txn.create',
        entityType: 'InventoryTxn',
        entityId: txn.id,
        diff: dto,
      });

      return txn;
    });
  }

  async stock(tenantDbUrl: string, params?: { warehouseId?: string; lowStock?: boolean }) {
    const prisma = this.prisma(tenantDbUrl);

    const items = await prisma.stockItem.findMany({
      where: params?.warehouseId ? { warehouseId: params.warehouseId } : undefined,
      include: { product: true, warehouse: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!params?.lowStock) return items;

    return items.filter((i) => Number(i.qty) <= Number(i.product.minStock));
  }

  units(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).unit.findMany({ orderBy: { nameFa: 'asc' } });
  }

  private validate(dto: CreateInventoryTxnDto) {
    if (dto.type === InventoryTxnTypeDto.IN && !dto.toWarehouseId) {
      throw new BadRequestException('برای IN، toWarehouseId الزامی است');
    }
    if (dto.type === InventoryTxnTypeDto.OUT && !dto.fromWarehouseId) {
      throw new BadRequestException('برای OUT، fromWarehouseId الزامی است');
    }
    if (dto.type === InventoryTxnTypeDto.TRANSFER && (!dto.fromWarehouseId || !dto.toWarehouseId)) {
      throw new BadRequestException('برای TRANSFER، fromWarehouseId و toWarehouseId الزامی است');
    }
  }

  private async applyStock(tx: Prisma.TransactionClient, dto: CreateInventoryTxnDto) {
    const upsertStock = async (warehouseId: string, delta: number) => {
      await tx.stockItem.upsert({
        where: { productId_warehouseId: { productId: dto.productId, warehouseId } },
        update: { qty: { increment: delta as any } },
        create: { productId: dto.productId, warehouseId, qty: delta as any, avgCost: dto.unitCost as any },
      });
    };

    switch (dto.type) {
      case InventoryTxnTypeDto.IN:
        // روش AVG: avgCost جدید = (oldQty*oldCost + inQty*unitCost) / newQty
        if (dto.unitCost != null) {
          const existing = await tx.stockItem.findUnique({
            where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.toWarehouseId! } },
          });
          const oldQty = Number(existing?.qty ?? 0);
          const oldCost = Number(existing?.avgCost ?? 0);
          const inQty = dto.qty;
          const inCost = dto.unitCost;
          const newQty = oldQty + inQty;
          const newAvg = newQty > 0 ? (oldQty * oldCost + inQty * inCost) / newQty : inCost;

          await tx.stockItem.upsert({
            where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.toWarehouseId! } },
            update: { qty: { increment: inQty as any }, avgCost: newAvg as any },
            create: { productId: dto.productId, warehouseId: dto.toWarehouseId!, qty: inQty as any, avgCost: newAvg as any },
          });
          break;
        }
        await upsertStock(dto.toWarehouseId!, dto.qty);
        break;
      case InventoryTxnTypeDto.OUT:
        await upsertStock(dto.fromWarehouseId!, -dto.qty);
        break;
      case InventoryTxnTypeDto.ADJUST:
        if (!dto.toWarehouseId && !dto.fromWarehouseId) {
          throw new BadRequestException('برای ADJUST یکی از fromWarehouseId یا toWarehouseId را ارسال کنید');
        }
        // در ADJUST اگر fromWarehouseId داده شود به معنی کاهش و اگر toWarehouseId داده شود به معنی افزایش است
        if (dto.fromWarehouseId) await upsertStock(dto.fromWarehouseId, -dto.qty);
        if (dto.toWarehouseId) {
          if (dto.unitCost != null) {
            // اگر ADJUST افزایشی با unitCost بود، همانند IN رفتار می‌کنیم.
            const existing = await tx.stockItem.findUnique({
              where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.toWarehouseId } },
            });
            const oldQty = Number(existing?.qty ?? 0);
            const oldCost = Number(existing?.avgCost ?? 0);
            const inQty = dto.qty;
            const inCost = dto.unitCost;
            const newQty = oldQty + inQty;
            const newAvg = newQty > 0 ? (oldQty * oldCost + inQty * inCost) / newQty : inCost;

            await tx.stockItem.upsert({
              where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.toWarehouseId } },
              update: { qty: { increment: inQty as any }, avgCost: newAvg as any },
              create: { productId: dto.productId, warehouseId: dto.toWarehouseId, qty: inQty as any, avgCost: newAvg as any },
            });
          } else {
            await upsertStock(dto.toWarehouseId, dto.qty);
          }
        }
        break;
      case InventoryTxnTypeDto.TRANSFER:
        await upsertStock(dto.fromWarehouseId!, -dto.qty);
        await upsertStock(dto.toWarehouseId!, dto.qty);
        break;
    }
  }
}
