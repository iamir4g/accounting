import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseItemDto {
  @ApiProperty({
    description: 'شناسه کالا',
    example: 'product-uuid',
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    description: 'تعداد',
    example: 20,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @ApiProperty({
    description: 'بهای واحد خرید',
    example: 250000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitCost!: number;

  @ApiPropertyOptional({
    description: 'نرخ مالیات',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'مبلغ تخفیف',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreatePurchaseInvoiceDto {
  @ApiProperty({
    description: 'شناسه تامین کننده',
    example: 'supplier-uuid',
  })
  @IsString()
  supplierId!: string;

  @ApiProperty({
    description: 'شناسه انبار مقصد',
    example: 'warehouse-uuid',
  })
  @IsString()
  warehouseId!: string;

  @ApiPropertyOptional({
    description: 'یادداشت فاکتور خرید',
    example: 'فاکتور خرید مواد اولیه اردیبهشت',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'اقلام فاکتور خرید',
    type: () => [CreatePurchaseItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items!: CreatePurchaseItemDto[];
}
