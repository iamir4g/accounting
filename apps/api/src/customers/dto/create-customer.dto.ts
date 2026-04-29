import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'نام مشتری',
    example: 'شرکت نمونه ایرانیان',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'شماره تماس مشتری',
    example: '02188887766',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'ایمیل مشتری',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'آدرس مشتری',
    example: 'تهران، خیابان ولیعصر',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'شناسه ملی یا کد شناسایی مشتری',
    example: '14001234567',
  })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({
    description: 'توضیحات تکمیلی',
    example: 'مشتری کلیدی قرارداد سال 1405',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
