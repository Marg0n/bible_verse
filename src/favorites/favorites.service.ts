import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BibleService } from '../bible/bible.service';

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private bibleService: BibleService,
  ) {}

  addFavorites(userId: string, verseId: string) {
    return this.prisma.favorite.create({
      data: {
        userId,
        verseId,
      },
    });
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
      },
    });

    //? returns decoded verse
    return favorites.map((fav) => ({
      ...fav,
      verse: this.bibleService.getVerseById(fav.id),
    }));
  }

  removeFavorites(userId: string, verseId: string) {
    return this.prisma.favorite
      .delete({
        where: {
          userId_verseId: {
            userId,
            verseId,
          },
        },
      })
      .catch(() => {
        return { message: 'Favorite not found' };
      });
  }
}
