import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdzesNapokModule } from './edzes_napok/edzes_napok.module';
import { EdzestervekModule } from './edzestervek/edzestervek.module';
import { EdzestervGyakorlatokModule } from './edzesterv_gyakorlatok/edzesterv_gyakorlatok.module';
import { GyakorlatokModule } from './gyakorlatok/gyakorlatok.module';
import { IzomcsoportokModule } from './izomcsoportok/izomcsoportok.module';
import { PrismaModule } from './prisma.module';
import { UserekModule } from './userek/userek.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    GyakorlatokModule,
    IzomcsoportokModule,
    UserekModule,
    EdzesNapokModule,
    EdzestervekModule,
    EdzestervGyakorlatokModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
