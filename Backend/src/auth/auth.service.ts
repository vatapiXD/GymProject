import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma.service';
import { hashPassword, verifyPassword } from './password';
import { RegisterAuthDto } from '../userek/dto/register-auth.dto';
import { LoginAuthDto } from '../userek/dto/login-auth.dto';
export const privateUserSelect = { id: true, nev: true, username: true, bio: true, avatar_url: true, profil_publikus: true, email: true, rang: true, suly_kg: true, magassag_cm: true, eletkor: true, nem: true, cel: true } as const;
export const digestToken = (token: string) => createHash('sha256').update(token).digest('hex');
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async register(dto: RegisterAuthDto) {
    const jelszo_hash = await hashPassword(dto.jelszo);
    const username = dto.username.trim();
    try { return await this.prisma.userek.create({ data: { nev: dto.nev.trim(), username, username_normalized: username.toLowerCase(), email: dto.email.trim().toLowerCase(), jelszo_hash, rang: 'tag' }, select: privateUserSelect }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('A megadott adatokkal nem lehet regisztrálni.'); throw error; }
  }
  async login(dto: LoginAuthDto) {
    const user = await this.prisma.userek.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    const valid = await verifyPassword(dto.jelszo, user?.jelszo_hash ?? `${'0'.repeat(32)}:${'0'.repeat(128)}`);
    if (!user || !valid) throw new UnauthorizedException('Hibás email vagy jelszó.');
    const refresh = randomBytes(48).toString('base64url');
    const session = await this.prisma.authSession.create({ data: { userId: user.id, refreshHash: digestToken(refresh), expiresAt: new Date(Date.now() + 7 * 86400000) } });
    return this.tokens(user.id, session.id, refresh);
  }
  private async tokens(id: number, sessionId: string, refresh: string) {
    return { access: await this.jwt.signAsync({ sub: id, sid: sessionId }, { expiresIn: '15m', algorithm: 'HS256', issuer: 'gym-api', audience: 'gym-web' }), refresh, user: await this.prisma.userek.findUniqueOrThrow({ where: { id }, select: privateUserSelect }) };
  }
  async refresh(token?: string) {
    if (!token) throw new UnauthorizedException();
    const hash = digestToken(token);
    const session = await this.prisma.authSession.findUnique({ where: { refreshHash: hash } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) throw new UnauthorizedException();
    const refresh = randomBytes(48).toString('base64url');
    const changed = await this.prisma.authSession.updateMany({ where: { id: session.id, refreshHash: hash, revokedAt: null, expiresAt: { gt: new Date() } }, data: { refreshHash: digestToken(refresh) } });
    if (changed.count !== 1) throw new UnauthorizedException();
    return this.tokens(session.userId, session.id, refresh);
  }
  async logout(token?: string) {
    if (token) await this.prisma.authSession.updateMany({ where: { refreshHash: digestToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
    return { success: true };
  }
}
