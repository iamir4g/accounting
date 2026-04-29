import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './auth.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'ثبت نام کاربر جدید' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'کاربر با موفقیت ساخته شد',
    schema: {
      example: {
        id: '2f84ef98-a977-4148-ae72-d0df2546bd47',
        email: 'amirfarahani10@gmail.com',
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'ورود کاربر و دریافت access token' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'توکن ورود با موفقیت صادر شد',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'نام کاربری یا رمز عبور نادرست است' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'مشاهده اطلاعات کاربر فعلی' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
