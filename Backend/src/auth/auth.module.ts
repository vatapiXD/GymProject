import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard, RolesGuard } from './auth.guards';
@Global()
@Module({ imports: [PrismaModule, JwtModule.registerAsync({ useFactory: () => { const secret = process.env.JWT_SECRET; if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters'); return { secret }; } }), ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }])], controllers: [AuthController], providers: [AuthService, { provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }], exports: [AuthService, JwtModule] })
export class AuthModule {}
