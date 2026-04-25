import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AccountingService } from './accounting.service';

@Injectable()
export class AccountingPostingService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly accounting: AccountingService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  private async accountIdByCode(tenantDbUrl: string, code: string) {
    const a = await this.prisma(tenantDbUrl).account.findUnique({ where: { code } });
    if (!a) throw new NotFoundException(`Account not found for code=${code}`);
    return a.id;
  }

  /**
   * Posting ساده برای فروش:
   * Dr AR(1300) / Cr Revenue(4000) / Cr VAT Payable(2200)
   */
  async postSalesInvoice(tenantDbUrl: string, actorUserId: string | undefined, salesInvoiceId: string) {
    const prisma = this.prisma(tenantDbUrl);
    const inv = await prisma.salesInvoice.findUnique({ where: { id: salesInvoiceId } });
    if (!inv) throw new NotFoundException('SalesInvoice not found');

    const ar = await this.accountIdByCode(tenantDbUrl, '1300');
    const revenue = await this.accountIdByCode(tenantDbUrl, '4000');
    const vatPayable = await this.accountIdByCode(tenantDbUrl, '2200');

    const lines = [
      { accountId: ar, debit: Number(inv.total), credit: 0 },
      { accountId: revenue, debit: 0, credit: Number(inv.subtotal) },
    ];

    if (Number(inv.taxTotal) > 0) {
      lines.push({ accountId: vatPayable, debit: 0, credit: Number(inv.taxTotal) });
    }

    return this.accounting.createJournalEntry(tenantDbUrl, actorUserId, {
      memo: `ثبت فروش ${inv.number}`,
      sourceType: 'SalesInvoice',
      sourceId: inv.id,
      lines,
    });
  }

  /**
   * Posting ساده برای خرید:
   * Dr Inventory(1500) / Dr VAT Receivable(1400) / Cr AP(2100)
   */
  async postPurchaseInvoice(tenantDbUrl: string, actorUserId: string | undefined, purchaseInvoiceId: string) {
    const prisma = this.prisma(tenantDbUrl);
    const inv = await prisma.purchaseInvoice.findUnique({ where: { id: purchaseInvoiceId } });
    if (!inv) throw new NotFoundException('PurchaseInvoice not found');

    const ap = await this.accountIdByCode(tenantDbUrl, '2100');
    const inventory = await this.accountIdByCode(tenantDbUrl, '1500');
    const vatRecv = await this.accountIdByCode(tenantDbUrl, '1400');

    const lines = [
      { accountId: inventory, debit: Number(inv.subtotal), credit: 0 },
      { accountId: ap, debit: 0, credit: Number(inv.total) },
    ];

    if (Number(inv.taxTotal) > 0) {
      lines.splice(1, 0, { accountId: vatRecv, debit: Number(inv.taxTotal), credit: 0 });
    }

    return this.accounting.createJournalEntry(tenantDbUrl, actorUserId, {
      memo: `ثبت خرید ${inv.number}`,
      sourceType: 'PurchaseInvoice',
      sourceId: inv.id,
      lines,
    });
  }

  /**
   * Posting پایه پرداخت‌ها:
   * - IN + ref SalesInvoice: Dr Cash/Bank , Cr AR
   * - OUT + ref PurchaseInvoice: Dr AP , Cr Cash/Bank
   * - TRANSFER: Dr to , Cr from
   */
  async postPayment(tenantDbUrl: string, actorUserId: string | undefined, paymentId: string) {
    const prisma = this.prisma(tenantDbUrl);
    const p = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!p) throw new NotFoundException('Payment not found');

    const cashDefault = await this.accountIdByCode(tenantDbUrl, '1100');
    const ar = await this.accountIdByCode(tenantDbUrl, '1300');
    const ap = await this.accountIdByCode(tenantDbUrl, '2100');

    const amount = Number(p.amount);
    const toAcc = p.toAccountId ?? cashDefault;
    const fromAcc = p.fromAccountId ?? cashDefault;

    if (p.direction === 'TRANSFER') {
      return this.accounting.createJournalEntry(tenantDbUrl, actorUserId, {
        memo: 'انتقال بین حساب‌ها',
        sourceType: 'Payment',
        sourceId: p.id,
        lines: [
          { accountId: toAcc, debit: amount, credit: 0 },
          { accountId: fromAcc, debit: 0, credit: amount },
        ],
      });
    }

    // incoming
    if (p.direction === 'IN' && p.referenceType === 'SalesInvoice') {
      return this.accounting.createJournalEntry(tenantDbUrl, actorUserId, {
        memo: 'دریافت وجه از مشتری',
        sourceType: 'Payment',
        sourceId: p.id,
        lines: [
          { accountId: toAcc, debit: amount, credit: 0 },
          { accountId: ar, debit: 0, credit: amount },
        ],
      });
    }

    // outgoing
    if (p.direction === 'OUT' && p.referenceType === 'PurchaseInvoice') {
      return this.accounting.createJournalEntry(tenantDbUrl, actorUserId, {
        memo: 'پرداخت به تامین‌کننده',
        sourceType: 'Payment',
        sourceId: p.id,
        lines: [
          { accountId: ap, debit: amount, credit: 0 },
          { accountId: fromAcc, debit: 0, credit: amount },
        ],
      });
    }

    // fallback: just record cash movement (not recommended, but keeps skeleton consistent)
    const sign = p.direction === 'IN' ? 1 : -1;
    return this.accounting.createJournalEntry(tenantDbUrl, actorUserId, {
      memo: 'پرداخت (بدون مرجع)',
      sourceType: 'Payment',
      sourceId: p.id,
      lines: sign === 1
        ? [
            { accountId: toAcc, debit: amount, credit: 0 },
            { accountId: ar, debit: 0, credit: amount },
          ]
        : [
            { accountId: ap, debit: amount, credit: 0 },
            { accountId: fromAcc, debit: 0, credit: amount },
          ],
    });
  }
}
