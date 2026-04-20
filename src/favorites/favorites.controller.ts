import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { GetFavoriteDto } from './dto/getFavoriteDto.dto';
import { AddFavoriteDto } from './dto/addFavoriteDto';
import { RemoveFavoriteDto } from './dto/removeFavoriteDto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  //* Add favorite
  @Post()
  addFavorites(@Body() dto: AddFavoriteDto) {
    return this.favoriteService.addFavorites(dto.userId, dto.verseId);
  }

  //* Get favorites
  @Get(':userId')
  getFavorites(@Param() dto: GetFavoriteDto) {
    return this.favoriteService.getFavorites(dto.userId);
  }

  //* Delete favorites
  @Delete(':userId/:verseId')
  removeFavorites(@Param() dto: RemoveFavoriteDto) {
    return this.favoriteService.removeFavorites(
      dto.userId as string,
      dto.verseId as string,
    );
  }
}
