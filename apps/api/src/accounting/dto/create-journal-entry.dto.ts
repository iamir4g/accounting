import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJournalLineDto {
  @ApiProperty({
    description: 'شناسه حساب',
    example: 'account-uuid',
  })
  @IsString()
  accountId!: string;

  @ApiProperty({
    description: 'مبلغ بدهکار',
    example: 1500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  debit!: number;

  @ApiProperty({
    description: 'مبلغ بستانکار',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  credit!: number;
}

export class CreateJournalEntryDto {
  @ApiPropertyOptional({
    description: 'شرح سند',
    example: 'ثبت دریافت از مشتری',
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiPropertyOptional({
    description: 'نوع مرجع سند',
    example: 'payment',
  })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({
    description: 'شناسه مرجع سند',
    example: 'payment-uuid',
  })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiProperty({
    description: 'آیتم‌های سند حسابداری',
    type: () => [CreateJournalLineDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalLineDto)
  lines!: CreateJournalLineDto[];
}
