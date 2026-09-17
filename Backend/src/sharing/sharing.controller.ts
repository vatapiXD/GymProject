import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.decorators';
import { CreateShareDto, SearchUsersDto } from './sharing.dto';
import { SharingService } from './sharing.service';
import { PrismaService } from '../prisma.service';
@Controller()
export class SharingController {
  constructor(private readonly shares: SharingService, private readonly prisma: PrismaService) {}
  @Throttle({ default: { limit: 20, ttl: 60000 } }) @Get('users/search') search(@Query() q: SearchUsersDto, @CurrentUser() u: AuthUser) { return this.shares.search(u.id, q.query); }
  @Throttle({ default: { limit: 10, ttl: 60000 } }) @Post('plan-shares') create(@Body() dto: CreateShareDto, @CurrentUser() u: AuthUser) { return this.shares.create(u.id, dto); }
  @Get('plan-shares/incoming') incoming(@CurrentUser() u: AuthUser) { return this.shares.list(u.id, false); }
  @Get('plan-shares/sent') sent(@CurrentUser() u: AuthUser) { return this.shares.list(u.id, true); }
  @Post('plan-shares/:id/accept') accept(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.shares.accept(id, u.id); }
  @Post('plan-shares/:id/decline') decline(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.shares.decline(id, u.id); }
  @Post('plan-shares/:id/revoke') revoke(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.shares.revoke(id, u.id); }
  @Get('notifications') notifications(@CurrentUser() u: AuthUser) { return this.prisma.notification.findMany({ where: { recipientId: u.id }, orderBy: { createdAt: 'desc' }, take: 50 }); }
  @Get('notifications/unread-count') async unread(@CurrentUser() u: AuthUser) { return { count: await this.prisma.notification.count({ where: { recipientId: u.id, readAt: null } }) }; }
  @Patch('notifications/:id/read') async read(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { await this.prisma.notification.updateMany({ where: { id, recipientId: u.id }, data: { readAt: new Date() } }); return { success: true }; }
  @Patch('notifications/read-all') async readAll(@CurrentUser() u: AuthUser) { await this.prisma.notification.updateMany({ where: { recipientId: u.id, readAt: null }, data: { readAt: new Date() } }); return { success: true }; }
  @Post('blocks/:id') block(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { if (id === u.id) return { success: false }; return this.prisma.userBlock.upsert({ where: { blockerId_blockedId: { blockerId: u.id, blockedId: id } }, create: { blockerId: u.id, blockedId: id }, update: {} }); }
  @Delete('blocks/:id') async unblock(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { await this.prisma.userBlock.deleteMany({ where: { blockerId: u.id, blockedId: id } }); return { success: true }; }
}
