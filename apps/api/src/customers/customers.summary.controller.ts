import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';

@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class CustomersSummaryController {
  constructor(private readonly prismaTenant: PrismaTenantService) {}

  @Get(':id/summary')
  @RequirePermissions('customers:read', 'reports:read')
  async summary(@CurrentTenantDbUrl() tenantDbUrl: string, @Param('id') id: string) {
    const prisma = this.prismaTenant.getTenantClient(tenantDbUrl);

    const customer = await prisma.customer.findUnique({ where: { id } });
    const invoices = await prisma.salesInvoice.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalInvoiced = invoices.reduce((a, b) => a + Number(b.total), 0);
    const payments = await prisma.payment.aggregate({
      where: { referenceType: 'SalesInvoice', referenceId: { in: invoices.map((i) => i.id) }, direction: 'IN' as any },
      _sum: { amount: true },
    });
    const totalPaid = Number(payments._sum.amount ?? 0);

    return {
      customer,
      totals: { totalInvoiced, totalPaid, balance: totalInvoiced - totalPaid },
      invoices,
    };
  }
}

