import { IsString, Matches, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  name!: string;

  /**
   * slug انگلیسی/لاتین برای نام دیتابیس و URL (مثلاً: acme).
   */
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;
}

