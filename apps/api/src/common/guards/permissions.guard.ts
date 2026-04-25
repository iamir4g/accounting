import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaTenantService } from '../../prisma/prisma-tenant.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaTenant: PrismaTenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const roleKey = req.membershipRoleKey as string | undefined;
    const tenantDbUrl = req.tenantDbUrl as string | undefined;
    if (!roleKey || !tenantDbUrl) throw new ForbiddenException();

    if (roleKey === 'SUPER_ADMIN') return true;

    const prisma = this.prismaTenant.getTenantClient(tenantDbUrl);
    const role = await prisma.role.findUnique({
      where: { key: roleKey },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new ForbiddenException('نقش نامعتبر است');

    const keys = new Set(role.permissions.map((rp) => rp.permission.key));
    const ok = required.every((p) => keys.has(p));
    if (!ok) throw new ForbiddenException('اجازه دسترسی ندارید');
    return true;
  }
}

