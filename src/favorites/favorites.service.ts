import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  addFavorites(userId: string, verseId: string) {
    return this.prisma.favorite.create({
      data: {
        userId,
        verseId,
      },
    });
  }

  getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: {
        userId,
      },
    });
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
