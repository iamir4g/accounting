import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentDirectionDto {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'جهت پرداخت',
    enum: PaymentDirectionDto,
    example: PaymentDirectionDto.IN,
  })
  @IsEnum(PaymentDirectionDto)
  direction!: PaymentDirectionDto;

  @ApiProperty({
    description: 'مبلغ پرداخت',
    example: 2500000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description: 'روش پرداخت',
    example: 'bank_transfer',
  })
  @IsString()
  method!: string; // cash, bank_transfer, pos...

  @ApiPropertyOptional({
    description: 'شناسه حساب مبدا',
    example: 'account-from-uuid',
  })
  @IsOptional()
  @IsString()
  fromAccountId?: string;

  @ApiPropertyOptional({
    description: 'شناسه حساب مقصد',
    example: 'account-to-uuid',
  })
  @IsOptional()
  @IsString()
  toAccountId?: string;

  @ApiPropertyOptional({
    description: 'نوع مرجع مرتبط',
    example: 'sales_invoice',
  })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({
    description: 'شناسه رکورد مرجع',
    example: 'invoice-uuid',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
