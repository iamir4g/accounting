import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalesItemDto {
  @ApiProperty({
    description: 'شناسه کالا',
    example: 'product-uuid',
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    description: 'تعداد',
    example: 3,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @ApiProperty({
    description: 'قیمت واحد فروش',
    example: 1800000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

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
    example: 150000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateSalesInvoiceDto {
  @ApiProperty({
    description: 'شناسه مشتری',
    example: 'customer-uuid',
  })
  @IsString()
  customerId!: string;

  @ApiProperty({
    description: 'شناسه انبار',
    example: 'warehouse-uuid',
  })
  @IsString()
  warehouseId!: string;

  @ApiPropertyOptional({
    description: 'یادداشت فاکتور فروش',
    example: 'فروش نقدی فروردین',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'اقلام فاکتور فروش',
    type: () => [CreateSalesItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesItemDto)
  items!: CreateSalesItemDto[];
}
