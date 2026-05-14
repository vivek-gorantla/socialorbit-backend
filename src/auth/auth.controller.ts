import { Body, Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Logger } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenGuard } from './refresh-token.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {
    this.logger.log('AuthController initialized');
  }

  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('verify-email')
  @Public()
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @Public()
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @Public()
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @CurrentUser() user: any,
  ) {
    return this.authService.refreshToken(
      user,
    );
  }


  @Get('me')
  getMe(
    @CurrentUser() user: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }

  @Post('logout')
  logout(
    @CurrentUser() user: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.authService.logout(user.sessionId);
  }
}
