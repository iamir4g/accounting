import { Injectable } from '@nestjs/common';
import { TenantClientFactory } from './tenant-client.factory';
import { PrismaClient } from '../prisma/generated/tenant';

@Injectable()
export class PrismaTenantService {
  constructor(private readonly factory: TenantClientFactory) {}

  getTenantClient(tenantDbUrl: string): PrismaClient {
    return this.factory.getClient(tenantDbUrl);
  }
}

