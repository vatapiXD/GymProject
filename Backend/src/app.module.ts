import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdzestervekModule } from './edzestervek/edzestervek.module';
import { GyakorlatokModule } from './gyakorlatok/gyakorlatok.module';
import { IzomcsoportokModule } from './izomcsoportok/izomcsoportok.module';
import { PrismaModule } from './prisma.module';
import { UserekModule } from './userek/userek.module';
import { KajaModule } from './kaja/kaja.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { SharingModule } from './sharing/sharing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, AuthModule,
    GyakorlatokModule,
    IzomcsoportokModule,
    UserekModule,
    EdzestervekModule,
    WorkoutsModule,
    SharingModule,
    KajaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
