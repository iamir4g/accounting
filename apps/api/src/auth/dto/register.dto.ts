import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'ایمیل یکتای کاربر',
    example: 'amirfarahani10@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'رمز عبور با حداقل 8 کاراکتر',
    example: '1Qazxsw@',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'شماره تماس کاربر',
    example: '09123456789',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
