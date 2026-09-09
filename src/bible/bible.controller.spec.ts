import { Test, TestingModule } from '@nestjs/testing';
import { BibleController } from './bible.controller';
import { BibleService } from './bible.service';

describe('BibleController', () => {
  let controller: BibleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BibleController],
      providers: [
        {
          provide: BibleService,
          useValue: {
            getAllVerses: jest.fn(),
            getRandomVerse: jest.fn(),
            getVerseById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BibleController>(BibleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
