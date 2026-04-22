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

  //* adding a favorite
  async addFavorites(userId: string, verseId: string) {
    try {
      const result = await this.prisma.favorite.create({
        data: {
          userId,
          verseId,
        },
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('add favorites: ', error);
      throw new BadRequestException('Already added to favorites');
    }
  }

  //* getting favorites
  async getFavorites(userId: string) {
    try {
      const favorites = await this.prisma.favorite.findMany({
        where: {
          userId,
        },
      });

      //? returns decoded verse
      const result = favorites.map((fav) => ({
        ...fav,
        verse: this.bibleService.getVerseById(fav.id),
      }));

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('get fav: ', error);
      throw new NotFoundException('Getting issues to get favorites');
    }
  }

  //* remove a favorites
  async removeFavorites(userId: string, verseId: string) {
    try {
      const result = await this.prisma.favorite.delete({
        where: {
          userId_verseId: {
            userId,
            verseId,
          },
        },
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('remove fav: ', error);
      throw new NotFoundException('Favorite not found');
    }
  }
}
