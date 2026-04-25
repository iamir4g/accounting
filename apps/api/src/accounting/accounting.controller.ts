import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentTenantDbUrl } from '../common/decorators/current-tenant-db-url.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AccountingService } from './accounting.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

@Controller('accounting')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class AccountingController {
  constructor(private readonly accounting: AccountingService) {}

  @Post('accounts')
  @RequirePermissions('accounting:write')
  createAccount(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accounting.createAccount(dbUrl, user.id, dto);
  }

  @Get('accounts')
  @RequirePermissions('accounting:read')
  listAccounts(@CurrentTenantDbUrl() dbUrl: string) {
    return this.accounting.listAccounts(dbUrl);
  }

  @Post('journal-entries')
  @RequirePermissions('accounting:write')
  createEntry(
    @CurrentTenantDbUrl() dbUrl: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.accounting.createJournalEntry(dbUrl, user.id, dto);
  }

  @Get('journal-entries')
  @RequirePermissions('accounting:read')
  listEntries(@CurrentTenantDbUrl() dbUrl: string) {
    return this.accounting.listJournalEntries(dbUrl);
  }

  @Get('trial-balance')
  @RequirePermissions('reports:read')
  trialBalance(@CurrentTenantDbUrl() dbUrl: string) {
    return this.accounting.trialBalance(dbUrl);
  }
}

