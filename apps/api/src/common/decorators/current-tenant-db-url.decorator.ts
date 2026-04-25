import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenantDbUrl = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return req.tenantDbUrl as string;
});

