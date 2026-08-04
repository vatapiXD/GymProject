import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GyakorlatokModule } from './gyakorlatok/gyakorlatok.module';
import { IzomcsoportokModule } from './izomcsoportok/izomcsoportok.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    GyakorlatokModule,
    IzomcsoportokModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
