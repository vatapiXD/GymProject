import { Test, TestingModule } from '@nestjs/testing';
import { UserekController } from './userek.controller';
import { UserekService } from './userek.service';

describe('UserekController', () => {
  let controller: UserekController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserekController],
      providers: [UserekService],
    }).compile();

    controller = module.get<UserekController>(UserekController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
