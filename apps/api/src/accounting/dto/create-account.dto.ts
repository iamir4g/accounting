import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AccountTypeDto {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export class CreateAccountDto {
  @ApiProperty({
    description: 'کد حساب',
    example: '1101',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'نام فارسی حساب',
    example: 'بانک ملت',
  })
  @IsString()
  nameFa!: string;

  @ApiProperty({
    description: 'نوع حساب',
    enum: AccountTypeDto,
    example: AccountTypeDto.ASSET,
  })
  @IsEnum(AccountTypeDto)
  type!: AccountTypeDto;

  @ApiPropertyOptional({
    description: 'شناسه حساب والد',
    example: 'parent-account-uuid',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
