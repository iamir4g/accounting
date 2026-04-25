import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prismaTenant: PrismaTenantService) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async profitLoss(tenantDbUrl: string, params?: { from?: Date; to?: Date }) {
    const prisma = this.prisma(tenantDbUrl);
    const whereDate =
      params?.from || params?.to
        ? {
            date: {
              gte: params.from,
              lte: params.to,
            },
          }
        : undefined;

    const entries = await prisma.journalEntry.findMany({
      where: whereDate,
      include: { lines: { include: { account: true } } },
    });

    let revenue = 0;
    let expense = 0;

    for (const e of entries) {
      for (const l of e.lines) {
        const debit = Number(l.debit);
        const credit = Number(l.credit);
        if (l.account.type === 'REVENUE') revenue += credit - debit;
        if (l.account.type === 'EXPENSE') expense += debit - credit;
      }
    }

    return {
      revenue,
      expense,
      netProfit: revenue - expense,
    };
  }

  async balanceSheet(tenantDbUrl: string, params?: { at?: Date }) {
    const prisma = this.prisma(tenantDbUrl);
    const at = params?.at;

    const entries = await prisma.journalEntry.findMany({
      where: at ? { date: { lte: at } } : undefined,
      include: { lines: { include: { account: true } } },
    });

    const totals = {
      ASSET: 0,
      LIABILITY: 0,
      EQUITY: 0,
    } as Record<string, number>;

    for (const e of entries) {
      for (const l of e.lines) {
        const debit = Number(l.debit);
        const credit = Number(l.credit);
        if (l.account.type === 'ASSET') totals.ASSET += debit - credit;
        if (l.account.type === 'LIABILITY') totals.LIABILITY += credit - debit;
        if (l.account.type === 'EQUITY') totals.EQUITY += credit - debit;
      }
    }

    return {
      assets: totals.ASSET,
      liabilities: totals.LIABILITY,
      equity: totals.EQUITY,
      liabilitiesPlusEquity: totals.LIABILITY + totals.EQUITY,
      isBalanced: Math.abs(totals.ASSET - (totals.LIABILITY + totals.EQUITY)) < 0.0001,
    };
  }

  async inventoryValuation(tenantDbUrl: string, params?: { warehouseId?: string }) {
    const prisma = this.prisma(tenantDbUrl);
    const items = await prisma.stockItem.findMany({
      where: params?.warehouseId ? { warehouseId: params.warehouseId } : undefined,
      include: { product: true, warehouse: true },
    });

    const rows = items.map((i) => {
      const qty = Number(i.qty);
      const avgCost = Number(i.avgCost ?? 0);
      return {
        productId: i.productId,
        sku: i.product.sku,
        nameFa: i.product.nameFa,
        warehouseId: i.warehouseId,
        warehouseNameFa: i.warehouse.nameFa,
        qty,
        avgCost,
        value: qty * avgCost,
      };
    });

    const totalValue = rows.reduce((a, b) => a + b.value, 0);
    return { totalValue, rows };
  }

  async ledger(tenantDbUrl: string, params: { accountId: string; from?: Date; to?: Date }) {
    const prisma = this.prisma(tenantDbUrl);
    const account = await prisma.account.findUnique({ where: { id: params.accountId } });

    const whereEntry =
      params.from || params.to
        ? {
            entry: {
              date: {
                gte: params.from,
                lte: params.to,
              },
            },
          }
        : undefined;

    const lines = await prisma.journalLine.findMany({
      where: { accountId: params.accountId, ...(whereEntry as any) },
      include: { entry: true },
      orderBy: [{ entry: { date: 'asc' } }, { entry: { createdAt: 'asc' } }],
      take: 2000,
    });

    let running = 0;
    const rows = lines.map((l) => {
      const debit = Number(l.debit);
      const credit = Number(l.credit);
      running += debit - credit;
      return {
        entryDate: l.entry.date,
        entryNumber: l.entry.number,
        memo: l.entry.memo,
        sourceType: l.entry.sourceType,
        sourceId: l.entry.sourceId,
        debit,
        credit,
        balance: running,
      };
    });

    return { account, openingBalance: 0, rows, closingBalance: running };
  }
}
