import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { AccountingPostingService } from '../accounting/accounting-posting.service';
import { generateNumber } from '../shared/numbering';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
    private readonly posting: AccountingPostingService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async createInvoice(tenantDbUrl: string, actorUserId: string | undefined, dto: CreatePurchaseInvoiceDto) {
    const prisma = this.prisma(tenantDbUrl);
    const number = generateNumber('P');

    const computed = dto.items.map((i) => {
      const discount = i.discount ?? 0;
      const taxRate = i.taxRate ?? 0;
      const lineSubtotal = i.qty * i.unitCost - discount;
      const tax = (lineSubtotal * taxRate) / 100;
      const total = lineSubtotal + tax;
      return { ...i, discount, taxRate, total, lineSubtotal, tax };
    });

    const subtotal = computed.reduce((a, b) => a + b.lineSubtotal, 0);
    const discountTotal = computed.reduce((a, b) => a + b.discount, 0);
    const taxTotal = computed.reduce((a, b) => a + b.tax, 0);
    const total = subtotal + taxTotal;

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        number,
        supplierId: dto.supplierId,
        subtotal,
        discountTotal,
        taxTotal,
        total,
        notes: dto.notes,
        items: {
          create: computed.map((i) => ({
            productId: i.productId,
            qty: i.qty as any,
            unitCost: i.unitCost as any,
            taxRate: i.taxRate as any,
            discount: i.discount as any,
            total: i.total as any,
          })),
        },
      },
      include: { items: true },
    });

    // Inventory IN for each item
    for (const item of invoice.items) {
      await this.inventory.createTxn(tenantDbUrl, actorUserId, {
        type: 'IN' as any,
        productId: item.productId,
        toWarehouseId: dto.warehouseId,
        qty: Number(item.qty),
        unitCost: Number(item.unitCost),
        referenceType: 'PurchaseInvoice',
        referenceId: invoice.id,
      });
    }

    // Accounting posting (skeleton)
    await this.posting.postPurchaseInvoice(tenantDbUrl, actorUserId, invoice.id);

    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'purchases.invoice.create',
      entityType: 'PurchaseInvoice',
      entityId: invoice.id,
      diff: dto,
    });

    return invoice;
  }

  list(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).purchaseInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { supplier: true, items: true },
    });
  }

  get(tenantDbUrl: string, id: string) {
    return this.prisma(tenantDbUrl).purchaseInvoice.findUnique({
      where: { id },
      include: { supplier: true, items: true },
    });
  }
}
