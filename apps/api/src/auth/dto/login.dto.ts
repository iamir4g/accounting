import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'ایمیل کاربر ثبت شده در سیستم',
    example: 'amirfarahani10@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'رمز عبور کاربر',
    example: '1Qazxsw@',
  })
  @IsString()
  password!: string;
}
