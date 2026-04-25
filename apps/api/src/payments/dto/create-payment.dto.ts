import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentDirectionDto {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
}

export class CreatePaymentDto {
  @IsEnum(PaymentDirectionDto)
  direction!: PaymentDirectionDto;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  method!: string; // cash, bank_transfer, pos...

  @IsOptional()
  @IsString()
  fromAccountId?: string;

  @IsOptional()
  @IsString()
  toAccountId?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

