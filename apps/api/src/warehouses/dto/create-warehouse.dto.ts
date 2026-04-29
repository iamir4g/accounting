import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'نام فارسی انبار',
    example: 'انبار مرکزی',
  })
  @IsString()
  nameFa!: string;

  @ApiPropertyOptional({
    description: 'آدرس انبار',
    example: 'قم، جاده قدیم تهران',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
