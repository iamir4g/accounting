import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaControlService } from '../../prisma/prisma-control.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaControlService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const tenantId = req.tenantId as string | undefined;
    if (!tenantId) throw new BadRequestException('هدر x-tenant-id الزامی است');

    const user = req.user as { id: string } | undefined;
    if (!user?.id) throw new ForbiddenException();

    const membership = await this.prisma.membership.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId } },
      include: { tenant: true },
    });
    if (!membership) throw new ForbiddenException('شما به این شرکت دسترسی ندارید');
    if (!membership.tenant.isActive) throw new ForbiddenException('این شرکت غیرفعال است');

    req.membershipRoleKey = membership.roleKey;
    req.tenantDbUrl = membership.tenant.dbUrl;
    return true;
  }
}

