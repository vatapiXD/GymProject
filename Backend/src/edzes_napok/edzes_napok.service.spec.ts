import { Test, TestingModule } from '@nestjs/testing';
import { EdzesNapokService } from './edzes_napok.service';

describe('EdzesNapokService', () => {
  let service: EdzesNapokService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdzesNapokService],
    }).compile();

    service = module.get<EdzesNapokService>(EdzesNapokService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
