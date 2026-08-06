import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { EdzestervGyakorlatokController } from './edzesterv_gyakorlatok.controller';
import { EdzestervGyakorlatokService } from './edzesterv_gyakorlatok.service';

@Module({
  imports: [PrismaModule],
  controllers: [EdzestervGyakorlatokController],
  providers: [EdzestervGyakorlatokService],
})
export class EdzestervGyakorlatokModule {}
