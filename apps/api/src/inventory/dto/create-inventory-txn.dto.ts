import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum InventoryTxnTypeDto {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
  TRANSFER = 'TRANSFER',
}

export class CreateInventoryTxnDto {
  @IsEnum(InventoryTxnTypeDto)
  type!: InventoryTxnTypeDto;

  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  fromWarehouseId?: string;

  @IsOptional()
  @IsString()
  toWarehouseId?: string;

  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

