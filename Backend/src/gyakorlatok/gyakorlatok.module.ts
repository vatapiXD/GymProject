import { Module } from '@nestjs/common';
import { GyakorlatokService } from './gyakorlatok.service';
import { GyakorlatokController } from './gyakorlatok.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GyakorlatokController],
  providers: [GyakorlatokService],
})
export class GyakorlatokModule {}
