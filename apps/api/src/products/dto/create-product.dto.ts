import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'کد یکتای کالا',
    example: 'PRD-1001',
  })
  @IsString()
  sku!: string;

  @ApiProperty({
    description: 'نام فارسی کالا',
    example: 'پرینتر لیزری',
  })
  @IsString()
  nameFa!: string;

  @ApiProperty({
    description: 'شناسه واحد سنجش',
    example: 'unit-uuid',
  })
  @IsString()
  unitId!: string;

  @ApiPropertyOptional({
    description: 'شناسه دسته بندی کالا',
    example: 'category-uuid',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'قیمت فروش',
    example: 12500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  salePrice!: number;

  @ApiProperty({
    description: 'قیمت خرید',
    example: 9800000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiPropertyOptional({
    description: 'نرخ مالیات به درصد',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'حداقل موجودی قابل قبول',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({
    description: 'وضعیت فعال بودن کالا',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
