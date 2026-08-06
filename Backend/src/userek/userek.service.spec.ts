import { Test, TestingModule } from '@nestjs/testing';
import { UserekService } from './userek.service';

describe('UserekService', () => {
  let service: UserekService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserekService],
    }).compile();

    service = module.get<UserekService>(UserekService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
