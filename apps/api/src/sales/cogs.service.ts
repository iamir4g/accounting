import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';

@Injectable()
export class CogsService {
  constructor(private readonly prismaTenant: PrismaTenantService) {}

  async estimateCogs(tenantDbUrl: string, warehouseId: string, items: { productId: string; qty: number }[]) {
    const prisma = this.prismaTenant.getTenantClient(tenantDbUrl);
    const stocks = await prisma.stockItem.findMany({
      where: { warehouseId, productId: { in: items.map((i) => i.productId) } },
    });
    const map = new Map(stocks.map((s) => [s.productId, Number(s.avgCost ?? 0)]));

    let total = 0;
    for (const i of items) {
      const cost = map.get(i.productId) ?? 0;
      total += cost * i.qty;
    }
    return total;
  }
}

