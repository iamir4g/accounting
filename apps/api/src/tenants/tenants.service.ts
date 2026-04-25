import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaControlService } from '../prisma/prisma-control.service';
import { TenantProvisionerService } from './tenant-provisioner.service';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaControlService,
    private readonly config: ConfigService,
    private readonly provisioner: TenantProvisionerService,
  ) {}

  async createTenant(input: { name: string; slug: string; ownerUserId: string }) {
    const dbName = `tenant_${input.slug}`;
    const tenantDbUrl = this.buildTenantDbUrl(dbName);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        dbUrl: tenantDbUrl,
        memberships: {
          create: {
            userId: input.ownerUserId,
            roleKey: 'SUPER_ADMIN',
          },
        },
      },
      include: { memberships: true },
    });

    await this.provisioner.provisionTenantDatabase({ tenantDbName: dbName, tenantDbUrl });

    return tenant;
  }

  async listMyTenants(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { tenant: true },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      tenantId: m.tenantId,
      tenantName: m.tenant.name,
      tenantSlug: m.tenant.slug,
      roleKey: m.roleKey,
    }));
  }

  async getTenantDbUrl(tenantId: string) {
    const t = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    return t?.dbUrl ?? null;
  }

  private buildTenantDbUrl(dbName: string) {
    // از CONTROL_DATABASE_URL به عنوان الگو (host/user/pass) استفاده می‌کنیم.
    const controlUrl = this.config.getOrThrow<string>('CONTROL_DATABASE_URL');
    const url = new URL(controlUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  }
}

