import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  //* Add favorite
  @Post()
  addFavorites(
    @Body('userId') userId: string,
    @Body('verseId') verseId: string,
  ) {
    if (!userId || !verseId) {
      return { message: 'userId and verseId are required' };
    }

    return this.favoriteService.addFavorites(userId, verseId);
  }

  //* Get favorites
  @Get()
  getFavorites(@Query('userId') userId: string) {
    if (!userId) {
      return { message: 'userId is required' };
    }

    return this.favoriteService.getFavorites(userId);
  }

  //* Delete favorites
  @Delete()
  @Delete(':userId/:verseId')
  removeFavorites(
    @Param('userId') userId: string,
    @Param('verseId') verseId: string,
  ) {
    return this.favoriteService.removeFavorites(userId, verseId);
  }
}
