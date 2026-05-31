import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { FavoriteDto } from './dto/favoriteDto';
import { FavoritesService } from './favorites.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  //* Add favorite
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  addFavorites(@Body() dto: FavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favoriteService.addFavorites(user.userId, dto.verseId);
  }

  //* Get favorites
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getFavorites(@CurrentUser() user: AuthUser) {
    return this.favoriteService.getFavorites(user.userId);
  }

  //* Delete favorites
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':verseId')
  removeFavorites(@Param() dto: FavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favoriteService.removeFavorites(user.userId, dto.verseId);
  }
}
