import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum InventoryTxnTypeDto {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
  TRANSFER = 'TRANSFER',
}

export class CreateInventoryTxnDto {
  @ApiProperty({
    description: 'نوع تراکنش انبار',
    enum: InventoryTxnTypeDto,
    example: InventoryTxnTypeDto.IN,
  })
  @IsEnum(InventoryTxnTypeDto)
  type!: InventoryTxnTypeDto;

  @ApiProperty({
    description: 'شناسه کالا',
    example: 'product-uuid',
  })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({
    description: 'شناسه انبار مبدا',
    example: 'warehouse-from-uuid',
  })
  @IsOptional()
  @IsString()
  fromWarehouseId?: string;

  @ApiPropertyOptional({
    description: 'شناسه انبار مقصد',
    example: 'warehouse-to-uuid',
  })
  @IsOptional()
  @IsString()
  toWarehouseId?: string;

  @ApiProperty({
    description: 'تعداد/مقدار',
    example: 12,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @ApiPropertyOptional({
    description: 'بهای واحد',
    example: 450000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({
    description: 'نوع مرجع مرتبط',
    example: 'purchase_invoice',
  })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({
    description: 'شناسه مرجع مرتبط',
    example: 'invoice-uuid',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
