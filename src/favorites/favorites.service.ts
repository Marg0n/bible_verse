import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BibleService } from '../bible/bible.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private bibleService: BibleService,
  ) {}

  async addFavorites(userId: string, verseId: string) {
    try {
      return await this.prisma.favorite.create({
        data: {
          userId,
          verseId,
        },
      });
    } catch (error) {
      console.log('add favorites: ', error);
      throw new BadRequestException('Already added to favorites');
    }
  }

  async getFavorites(userId: string) {
    try {
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
    } catch (error) {
      console.log('get fav: ', error);
      throw new NotFoundException('Getting issues to get favorites');
    }
  }

  async removeFavorites(userId: string, verseId: string) {
    try {
      return await this.prisma.favorite
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
    } catch (error) {
      console.log('remove fav: ', error);
      throw new NotFoundException('Favorite not found');
    }
  }
}
