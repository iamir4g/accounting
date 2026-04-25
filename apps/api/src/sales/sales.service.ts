import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { AccountingPostingService } from '../accounting/accounting-posting.service';
import { generateNumber } from '../shared/numbering';
import { CogsService } from './cogs.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
    private readonly posting: AccountingPostingService,
    private readonly cogs: CogsService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async createInvoice(tenantDbUrl: string, actorUserId: string | undefined, dto: CreateSalesInvoiceDto) {
    const prisma = this.prisma(tenantDbUrl);
    const number = generateNumber('S');

    // برآورد بهای تمام‌شده با روش AVG (قبل از خروج موجودی)
    const totalCogs = await this.cogs.estimateCogs(
      tenantDbUrl,
      dto.warehouseId,
      dto.items.map((i) => ({ productId: i.productId, qty: i.qty })),
    );

    const computed = dto.items.map((i) => {
      const discount = i.discount ?? 0;
      const taxRate = i.taxRate ?? 0;
      const lineSubtotal = i.qty * i.unitPrice - discount;
      const tax = (lineSubtotal * taxRate) / 100;
      const total = lineSubtotal + tax;
      return { ...i, discount, taxRate, total, lineSubtotal, tax };
    });

    const subtotal = computed.reduce((a, b) => a + b.lineSubtotal, 0);
    const discountTotal = computed.reduce((a, b) => a + b.discount, 0);
    const taxTotal = computed.reduce((a, b) => a + b.tax, 0);
    const total = subtotal + taxTotal;

    const invoice = await prisma.salesInvoice.create({
      data: {
        number,
        customerId: dto.customerId,
        subtotal,
        discountTotal,
        taxTotal,
        total,
        notes: dto.notes,
        items: {
          create: computed.map((i) => ({
            productId: i.productId,
            qty: i.qty as any,
            unitPrice: i.unitPrice as any,
            taxRate: i.taxRate as any,
            discount: i.discount as any,
            total: i.total as any,
          })),
        },
      },
      include: { items: true },
    });

    // Inventory OUT for each item (skeleton: separate tx per item)
    for (const item of invoice.items) {
      await this.inventory.createTxn(tenantDbUrl, actorUserId, {
        type: 'OUT' as any,
        productId: item.productId,
        fromWarehouseId: dto.warehouseId,
        qty: Number(item.qty),
        referenceType: 'SalesInvoice',
        referenceId: invoice.id,
      });
    }

    // Accounting posting (skeleton)
    await this.posting.postSalesInvoice(tenantDbUrl, actorUserId, invoice.id);

    // COGS posting: Dr COGS(5100) / Cr Inventory(1500)
    if (totalCogs > 0) {
      const invAcc = await prisma.account.findUnique({ where: { code: '1500' } });
      const cogsAcc = await prisma.account.findUnique({ where: { code: '5100' } });
      if (invAcc && cogsAcc) {
        await prisma.journalEntry.create({
          data: {
            number: generateNumber('JE'),
            memo: `بهای تمام‌شده ${number}`,
            sourceType: 'SalesInvoice',
            sourceId: invoice.id,
            actorUserId,
            lines: {
              create: [
                { accountId: cogsAcc.id, debit: totalCogs as any, credit: 0 as any },
                { accountId: invAcc.id, debit: 0 as any, credit: totalCogs as any },
              ],
            },
          },
        });
      }
    }

    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'sales.invoice.create',
      entityType: 'SalesInvoice',
      entityId: invoice.id,
      diff: dto,
    });

    return invoice;
  }

  list(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).salesInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true, items: true },
    });
  }

  get(tenantDbUrl: string, id: string) {
    return this.prisma(tenantDbUrl).salesInvoice.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });
  }
}
