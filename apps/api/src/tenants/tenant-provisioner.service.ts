import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { execSync } from 'node:child_process';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';

@Injectable()
export class TenantProvisionerService {
  private readonly logger = new Logger(TenantProvisionerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly tenantPrisma: PrismaTenantService,
  ) {}

  /**
   * ایجاد یک دیتابیس جدید برای tenant و اعمال schema اولیه + seed نقش‌ها/دسترسی‌ها.
   *
   * نکته: در production بهتر است این کار در job/queue جدا انجام شود.
   */
  async provisionTenantDatabase(opts: { tenantDbName: string; tenantDbUrl: string }) {
    await this.createDatabaseIfNotExists(opts.tenantDbName);
    await this.applyTenantSchema(opts.tenantDbUrl);
    await this.seedRbac(opts.tenantDbUrl);
  }

  private async createDatabaseIfNotExists(dbName: string) {
    const adminUrl = this.config.getOrThrow<string>('POSTGRES_ADMIN_URL');
    const client = new Client({ connectionString: adminUrl });
    await client.connect();
    try {
      const exists = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName],
      );
      if (exists.rowCount === 0) {
        this.logger.log(`Creating tenant database: ${dbName}`);
        await client.query(`CREATE DATABASE "${dbName}"`);
      }
    } finally {
      await client.end();
    }
  }

  private async applyTenantSchema(tenantDbUrl: string) {
    // برای dev/local از prisma db push استفاده می‌کنیم تا پروژه بدون migration آماده اجرا باشد.
    // در محیط production پیشنهاد می‌شود از prisma migrate deploy استفاده شود.
    this.logger.log('Applying tenant schema (prisma db push)...');
    execSync(`./node_modules/.bin/prisma db push --schema apps/api/prisma/tenant.prisma`, {
      env: { ...process.env, TENANT_DATABASE_URL: tenantDbUrl },
      stdio: 'inherit',
    });
  }

  private async seedRbac(tenantDbUrl: string) {
    const prisma = this.tenantPrisma.getTenantClient(tenantDbUrl);

    const permissions = [
      'customers:read',
      'customers:write',
      'suppliers:read',
      'suppliers:write',
      'products:read',
      'products:write',
      'inventory:write',
      'sales:read',
      'sales:write',
      'purchases:read',
      'purchases:write',
      'accounting:read',
      'accounting:write',
      'reports:read',
      'settings:write',
    ];

    await prisma.permission.createMany({
      data: permissions.map((key) => ({ key })),
      skipDuplicates: true,
    });

    const roles = [
      { key: 'SUPER_ADMIN', nameFa: 'سوپر ادمین' },
      { key: 'ACCOUNTANT', nameFa: 'حسابدار' },
      { key: 'SALES_MANAGER', nameFa: 'مدیر فروش' },
      { key: 'INVENTORY_MANAGER', nameFa: 'مدیر انبار' },
      { key: 'VIEWER', nameFa: 'مشاهده‌گر' },
    ];

    for (const role of roles) {
      const r = await prisma.role.upsert({
        where: { key: role.key },
        update: { nameFa: role.nameFa },
        create: role,
      });

      const permissionKeysByRole: Record<string, string[]> = {
        SUPER_ADMIN: permissions,
        ACCOUNTANT: [
          'customers:read',
          'customers:write',
          'suppliers:read',
          'suppliers:write',
          'sales:read',
          'purchases:read',
          'accounting:read',
          'accounting:write',
          'reports:read',
        ],
        SALES_MANAGER: ['customers:read', 'customers:write', 'sales:read', 'sales:write', 'reports:read'],
        INVENTORY_MANAGER: ['products:read', 'products:write', 'inventory:write', 'reports:read'],
        VIEWER: ['customers:read', 'suppliers:read', 'products:read', 'sales:read', 'purchases:read', 'accounting:read', 'reports:read'],
      };

      const keys = permissionKeysByRole[role.key] ?? [];
      const perms = await prisma.permission.findMany({ where: { key: { in: keys } } });

      await prisma.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: r.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }

    // Seed واحدها و یک انبار پیش‌فرض
    await prisma.unit.createMany({
      data: [
        { key: 'piece', nameFa: 'عدد' },
        { key: 'kg', nameFa: 'کیلوگرم' },
        { key: 'box', nameFa: 'کارتن' },
      ],
      skipDuplicates: true,
    });

    await prisma.warehouse.createMany({
      data: [{ nameFa: 'انبار اصلی' }],
      skipDuplicates: true,
    });

    // Seed حداقلی کدینگ حساب‌ها (برای شروع)
    await prisma.account.createMany({
      data: [
        { code: '1000', nameFa: 'دارایی‌ها', type: 'ASSET' as any },
        { code: '1100', nameFa: 'صندوق', type: 'ASSET' as any },
        { code: '1200', nameFa: 'بانک', type: 'ASSET' as any },
        { code: '1300', nameFa: 'حساب‌های دریافتنی', type: 'ASSET' as any },
        { code: '1400', nameFa: 'مالیات بر ارزش افزوده خرید (اعتبار مالیاتی)', type: 'ASSET' as any },
        { code: '1500', nameFa: 'موجودی کالا', type: 'ASSET' as any },
        { code: '2000', nameFa: 'بدهی‌ها', type: 'LIABILITY' as any },
        { code: '2100', nameFa: 'حساب‌های پرداختنی', type: 'LIABILITY' as any },
        { code: '2200', nameFa: 'مالیات بر ارزش افزوده فروش (پرداختنی)', type: 'LIABILITY' as any },
        { code: '3000', nameFa: 'سرمایه', type: 'EQUITY' as any },
        { code: '4000', nameFa: 'درآمد فروش', type: 'REVENUE' as any },
        { code: '5000', nameFa: 'بهای تمام‌شده/هزینه‌ها', type: 'EXPENSE' as any },
        { code: '5100', nameFa: 'بهای تمام‌شده کالای فروش‌رفته', type: 'EXPENSE' as any },
      ],
      skipDuplicates: true,
    });
  }
}
