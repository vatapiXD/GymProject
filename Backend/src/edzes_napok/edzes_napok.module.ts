import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { EdzesNapokController } from './edzes_napok.controller';
import { EdzesNapokService } from './edzes_napok.service';

@Module({
  imports: [PrismaModule],
  controllers: [EdzesNapokController],
  providers: [EdzesNapokService],
})
export class EdzesNapokModule {}
