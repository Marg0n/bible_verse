import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { GetFavoriteDto } from './dto/getFavoriteDto.dto';
import { AddFavoriteDto } from './dto/addFavoriteDto';
import { RemoveFavoriteDto } from './dto/removeFavoriteDto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  //* Add favorite
  @UseGuards(JwtAuthGuard)
  @Post()
  addFavorites(@Body() dto: AddFavoriteDto) {
    return this.favoriteService.addFavorites(dto.userId, dto.verseId);
  }

  //* Get favorites
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getFavorites(@Param() dto: GetFavoriteDto) {
    return this.favoriteService.getFavorites(dto.userId);
  }

  //* Delete favorites
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/:verseId')
  removeFavorites(@Param() dto: RemoveFavoriteDto) {
    return this.favoriteService.removeFavorites(
      dto.userId as string,
      dto.verseId as string,
    );
  }
}
