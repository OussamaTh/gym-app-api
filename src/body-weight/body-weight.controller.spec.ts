import { Test, TestingModule } from '@nestjs/testing';
import { BodyWeightController } from './body-weight.controller.js';

describe('BodyWeightController', () => {
  let controller: BodyWeightController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodyWeightController],
    }).compile();

    controller = module.get<BodyWeightController>(BodyWeightController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
