import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import type { Request } from 'express';
import type { AuthUser } from './auth.decorators';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<Request & { user: AuthUser }>();
    const token: unknown = request.cookies?.access_token;
    if (typeof token !== 'string') throw new UnauthorizedException('Bejelentkezés szükséges.');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; sid: string }>(token, { algorithms: ['HS256'], issuer: 'gym-api', audience: 'gym-web' });
      const session = await this.prisma.authSession.findUnique({ where: { id: payload.sid }, include: { user: { select: { id: true, rang: true } } } });
      if (!session || session.revokedAt || session.expiresAt <= new Date() || session.userId !== payload.sub) throw new Error('Invalid session');
      request.user = { id: session.user.id, rang: session.user.rang ?? 'tag', sessionId: session.id };
      return true;
    } catch { throw new UnauthorizedException('A munkamenet lejárt. Jelentkezz be újra.'); }
  }
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [context.getHandler(), context.getClass()]);
    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    if (roles && (!user || !roles.includes(user.rang))) throw new ForbiddenException('Nincs jogosultságod ehhez a művelethez.');
    return true;
  }
}
