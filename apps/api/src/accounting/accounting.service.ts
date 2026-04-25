import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaTenantService } from '../prisma/prisma-tenant.service';
import { AuditService } from '../audit/audit.service';
import { generateNumber } from '../shared/numbering';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

@Injectable()
export class AccountingService {
  constructor(
    private readonly prismaTenant: PrismaTenantService,
    private readonly audit: AuditService,
  ) {}

  private prisma(tenantDbUrl: string) {
    return this.prismaTenant.getTenantClient(tenantDbUrl);
  }

  // Chart of accounts
  async createAccount(tenantDbUrl: string, actorUserId: string | undefined, dto: CreateAccountDto) {
    const account = await this.prisma(tenantDbUrl).account.create({ data: dto as any });
    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'accounting.account.create',
      entityType: 'Account',
      entityId: account.id,
      diff: dto,
    });
    return account;
  }

  listAccounts(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).account.findMany({ orderBy: { code: 'asc' } });
  }

  // Journal entries
  async createJournalEntry(tenantDbUrl: string, actorUserId: string | undefined, dto: CreateJournalEntryDto) {
    const debit = dto.lines.reduce((a, b) => a + b.debit, 0);
    const credit = dto.lines.reduce((a, b) => a + b.credit, 0);
    if (Math.abs(debit - credit) > 0.0001) {
      throw new BadRequestException('جمع بدهکار و بستانکار باید برابر باشد');
    }

    const number = generateNumber('JE');

    const entry = await this.prisma(tenantDbUrl).journalEntry.create({
      data: {
        number,
        memo: dto.memo,
        sourceType: dto.sourceType,
        sourceId: dto.sourceId,
        actorUserId,
        lines: {
          create: dto.lines.map((l) => ({
            accountId: l.accountId,
            debit: l.debit as any,
            credit: l.credit as any,
          })),
        },
      },
      include: { lines: true },
    });

    await this.audit.log({
      tenantDbUrl,
      actorUserId,
      action: 'accounting.journal-entry.create',
      entityType: 'JournalEntry',
      entityId: entry.id,
      diff: dto,
    });

    return entry;
  }

  listJournalEntries(tenantDbUrl: string) {
    return this.prisma(tenantDbUrl).journalEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
      take: 200,
    });
  }

  async trialBalance(tenantDbUrl: string) {
    const prisma = this.prisma(tenantDbUrl);
    const accounts = await prisma.account.findMany({ orderBy: { code: 'asc' } });
    const sums = await prisma.journalLine.groupBy({
      by: ['accountId'],
      _sum: { debit: true, credit: true },
    });

    const map = new Map(sums.map((s) => [s.accountId, s]));

    return accounts.map((a) => {
      const s = map.get(a.id);
      const debit = Number(s?._sum.debit ?? 0);
      const credit = Number(s?._sum.credit ?? 0);
      return { accountId: a.id, code: a.code, nameFa: a.nameFa, type: a.type, debit, credit, balance: debit - credit };
    });
  }
}

