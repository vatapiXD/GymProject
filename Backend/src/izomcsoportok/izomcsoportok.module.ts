import { Module } from '@nestjs/common';
import { IzomcsoportokService } from './izomcsoportok.service';
import { IzomcsoportokController } from './izomcsoportok.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IzomcsoportokController],
  providers: [IzomcsoportokService],
})
export class IzomcsoportokModule {}
