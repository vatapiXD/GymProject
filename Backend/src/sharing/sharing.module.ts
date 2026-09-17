import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';
@Module({ imports: [PrismaModule], controllers: [SharingController], providers: [SharingService] }) export class SharingModule {}
