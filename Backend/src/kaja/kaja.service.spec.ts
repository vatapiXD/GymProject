import { Test, TestingModule } from '@nestjs/testing';
import { KajaService } from './kaja.service';
import { PrismaService } from '../prisma.service';

describe('KajaService', () => {
  let service: KajaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KajaService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<KajaService>(KajaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
