import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { EdzestervekController } from './edzestervek.controller';
import { EdzestervekService } from './edzestervek.service';

@Module({
  imports: [PrismaModule],
  controllers: [EdzestervekController],
  providers: [EdzestervekService],
})
export class EdzestervekModule {}
