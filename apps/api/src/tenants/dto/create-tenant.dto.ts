import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'نام نمایشی tenant',
    example: 'شرکت حسابداری امیر',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name!: string;

  /**
   * slug انگلیسی/لاتین برای نام دیتابیس و URL (مثلاً: acme).
   */
  @ApiProperty({
    description: 'شناسه انگلیسی tenant برای نام دیتابیس و مسیرها',
    example: 'amir-accounting',
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;
}
