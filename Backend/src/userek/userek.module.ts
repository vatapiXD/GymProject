import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { AuthController } from './auth.controller';
import { UserekController } from './userek.controller';
import { UserekService } from './userek.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, UserekController],
  providers: [UserekService],
})
export class UserekModule {}
