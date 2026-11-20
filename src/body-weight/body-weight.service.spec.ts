import { Test, TestingModule } from '@nestjs/testing';
import { BodyWeightService } from './body-weight.service.js';

describe('BodyWeightService', () => {
  let service: BodyWeightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BodyWeightService],
    }).compile();

    service = module.get<BodyWeightService>(BodyWeightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
