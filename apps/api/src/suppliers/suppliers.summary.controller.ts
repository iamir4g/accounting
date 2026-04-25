import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class SuppliersSummaryController {
  constructor(private readonly prismaTenant: PrismaTenantService) {}

  @Get(':id/summary')
  @RequirePermissions('suppliers:read', 'reports:read')
  async summary(@CurrentTenantDbUrl() tenantDbUrl: string, @Param('id') id: string) {
    const prisma = this.prismaTenant.getTenantClient(tenantDbUrl);

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    const invoices = await prisma.purchaseInvoice.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalInvoiced = invoices.reduce((a, b) => a + Number(b.total), 0);
    const payments = await prisma.payment.aggregate({
      where: { referenceType: 'PurchaseInvoice', referenceId: { in: invoices.map((i) => i.id) }, direction: 'OUT' as any },
      _sum: { amount: true },
    });
    const totalPaid = Number(payments._sum.amount ?? 0);

    return {
      supplier,
      totals: { totalInvoiced, totalPaid, balance: totalInvoiced - totalPaid },
      invoices,
    };
  }
}

