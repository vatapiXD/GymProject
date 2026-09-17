import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response, CookieOptions } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './auth.decorators';
import type { AuthUser } from './auth.decorators';
import { RegisterAuthDto } from '../userek/dto/register-auth.dto';
import { LoginAuthDto } from '../userek/dto/login-auth.dto';
import { PrismaService } from '../prisma.service';
import { privateUserSelect } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService) {}
  private cookieOptions(): CookieOptions { return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' }; }
  private setCookies(response: Response, tokens: { access: string; refresh: string }) {
    response.cookie('access_token', tokens.access, { ...this.cookieOptions(), maxAge: 15 * 60000 });
    response.cookie('refresh_token', tokens.refresh, { ...this.cookieOptions(), path: '/auth', maxAge: 7 * 86400000 });
  }
  @Public() @Throttle({ default: { limit: 5, ttl: 60000 } }) @Post('register')
  register(@Body() dto: RegisterAuthDto) { return this.auth.register(dto); }
  @Public() @Throttle({ default: { limit: 10, ttl: 60000 } }) @Post('login')
  async login(@Body() dto: LoginAuthDto, @Res({ passthrough: true }) response: Response) { const tokens = await this.auth.login(dto); this.setCookies(response, tokens); return tokens.user; }
  @Public() @Throttle({ default: { limit: 20, ttl: 60000 } }) @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) { const tokens = await this.auth.refresh(request.cookies?.refresh_token as string | undefined); this.setCookies(response, tokens); return tokens.user; }
  @Public() @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) { const result = await this.auth.logout(request.cookies?.refresh_token as string | undefined); response.clearCookie('access_token', this.cookieOptions()); response.clearCookie('refresh_token', { ...this.cookieOptions(), path: '/auth' }); return result; }
  @Get('me') me(@CurrentUser() user: AuthUser) { return this.prisma.userek.findUniqueOrThrow({ where: { id: user.id }, select: privateUserSelect }); }
}
