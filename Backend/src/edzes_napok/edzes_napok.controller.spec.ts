import { Test, TestingModule } from '@nestjs/testing';
import { EdzesNapokController } from './edzes_napok.controller';
import { EdzesNapokService } from './edzes_napok.service';

describe('EdzesNapokController', () => {
  let controller: EdzesNapokController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdzesNapokController],
      providers: [EdzesNapokService],
    }).compile();

    controller = module.get<EdzesNapokController>(EdzesNapokController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
