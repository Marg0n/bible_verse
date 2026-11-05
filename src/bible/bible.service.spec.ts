import { Test, TestingModule } from '@nestjs/testing';
import { BibleService } from './bible.service';
import { RedisService } from '../redis/redis.service';

describe('BibleService', () => {
  let service: BibleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BibleService,
        {
          provide: RedisService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BibleService>(BibleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
