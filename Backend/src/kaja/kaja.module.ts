import { Module } from '@nestjs/common';
import { KajaService } from './kaja.service';
import { KajaController } from './kaja.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KajaController],
  providers: [KajaService],
})
export class KajaModule {}
