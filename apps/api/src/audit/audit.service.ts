import { Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';

@Injectable()
export class AuditService {
  constructor(private readonly prismaTenant: PrismaTenantService) {}

  async log(params: {
    tenantDbUrl: string;
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    diff?: unknown;
  }) {
    const prisma = this.prismaTenant.getTenantClient(params.tenantDbUrl);
    await prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        diff: params.diff as any,
      },
    });
  }
}

