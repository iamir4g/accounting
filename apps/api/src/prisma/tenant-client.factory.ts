import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../prisma/generated/tenant';

/**
 * Database-per-tenant:
 * هر درخواست بر اساس tenantId به یک DB جدا وصل می‌شود.
 *
 * در این اسکلت، برای سادگی یک cache در حافظه نگه می‌داریم.
 * در محیط production پیشنهاد می‌شود:
 * - pool محدود
 * - eviction policy
 * - health checks
 */
@Injectable()
export class TenantClientFactory {
  private clients = new Map<string, PrismaClient>();

  getClient(tenantDbUrl: string): PrismaClient {
    const existing = this.clients.get(tenantDbUrl);
    if (existing) return existing;

    const client = new PrismaClient({
      datasources: {
        db: { url: tenantDbUrl },
      },
    });

    this.clients.set(tenantDbUrl, client);
    return client;
  }
}

