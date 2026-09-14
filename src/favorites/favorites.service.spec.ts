import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';
import { BibleService } from '../bible/bible.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        //? Mock PrismaService
        {
          provide: PrismaService,
          useValue: {},
        },

        //? Mock BibleService
        {
          provide: BibleService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
