import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { AccountingPostingService } from '../accounting/accounting-posting.service';
import { CreatePaymentDto, PaymentDirectionDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
    private readonly posting: AccountingPostingService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  async create(tenantDbUrl: string, actorUserId: string | undefined, dto: CreatePaymentDto) {
    if (dto.direction === PaymentDirectionDto.TRANSFER && (!dto.fromAccountId || !dto.toAccountId)) {
      throw new BadRequestException('برای TRANSFER، fromAccountId و toAccountId الزامی است');
    }

    const payment = await this.prisma(tenantDbUrl).payment.create({
      data: {
        direction: dto.direction as any,
        amount: dto.amount as any,
        method: dto.method,
        fromAccountId: dto.fromAccountId,
        toAccountId: dto.toAccountId,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        actorUserId,
      },
    });

    // Accounting posting (skeleton)
    await this.posting.postPayment(tenantDbUrl, actorUserId, payment.id);

    // آپدیت وضعیت پرداخت فاکتور (Paid/Partially/Unpaid)
    await this.updateInvoicePaymentStatusIfNeeded(tenantDbUrl, dto.referenceType, dto.referenceId);

    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'payments.create',
      entityType: 'Payment',
      entityId: payment.id,
      diff: dto,
    });

    return payment;
  }

  list(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).payment.findMany({ orderBy: { happenedAt: 'desc' }, take: 200 });
  }

  private async updateInvoicePaymentStatusIfNeeded(tenantDbUrl: string, referenceType?: string, referenceId?: string) {
    if (!referenceType || !referenceId) return;
    const prisma = this.prisma(tenantDbUrl);

    if (referenceType === 'SalesInvoice') {
      const inv = await prisma.salesInvoice.findUnique({ where: { id: referenceId } });
      if (!inv) return;
      const sum = await prisma.payment.aggregate({
        where: { referenceType: 'SalesInvoice', referenceId, direction: 'IN' as any },
        _sum: { amount: true },
      });
      const paid = Number(sum._sum.amount ?? 0);
      const total = Number(inv.total);
      const status = paid <= 0 ? 'UNPAID' : paid + 0.0001 < total ? 'PARTIALLY_PAID' : 'PAID';
      await prisma.salesInvoice.update({ where: { id: referenceId }, data: { status: status as any } });
    }

    if (referenceType === 'PurchaseInvoice') {
      const inv = await prisma.purchaseInvoice.findUnique({ where: { id: referenceId } });
      if (!inv) return;
      const sum = await prisma.payment.aggregate({
        where: { referenceType: 'PurchaseInvoice', referenceId, direction: 'OUT' as any },
        _sum: { amount: true },
      });
      const paid = Number(sum._sum.amount ?? 0);
      const total = Number(inv.total);
      const status = paid <= 0 ? 'UNPAID' : paid + 0.0001 < total ? 'PARTIALLY_PAID' : 'PAID';
      await prisma.purchaseInvoice.update({ where: { id: referenceId }, data: { status: status as any } });
    }
  }
}
