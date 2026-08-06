import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { UserekController } from './userek.controller';
import { UserekService } from './userek.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserekController],
  providers: [UserekService],
})
export class UserekModule {}
