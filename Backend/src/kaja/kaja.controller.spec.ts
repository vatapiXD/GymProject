import { Test, TestingModule } from '@nestjs/testing';
import { KajaController } from './kaja.controller';
import { KajaService } from './kaja.service';
import { PrismaService } from '../prisma.service';

describe('KajaController', () => {
  let controller: KajaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KajaController],
      providers: [
        KajaService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<KajaController>(KajaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
