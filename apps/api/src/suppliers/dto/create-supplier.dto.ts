import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'نام تامین کننده',
    example: 'تامین گستر پارس',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'شماره تماس تامین کننده',
    example: '02188776655',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'ایمیل تامین کننده',
    example: 'supplier@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'آدرس تامین کننده',
    example: 'تهران، شهرک صنعتی شمس آباد',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'توضیحات تکمیلی',
    example: 'ارسال هفتگی مواد اولیه',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
