import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AddFavoriteDto } from './dto/addFavoriteDto';
import { RemoveFavoriteDto } from './dto/removeFavoriteDto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  //* Add favorite
  @UseGuards(JwtAuthGuard)
  @Post()
  addFavorites(@Body() dto: AddFavoriteDto, @Req() req: RequestWithUser) {
    return this.favoriteService.addFavorites(req.user.userId, dto.verseId);
  }

  //* Get favorites
  @UseGuards(JwtAuthGuard)
  @Get()
  getFavorites(@Req() req: RequestWithUser) {
    return this.favoriteService.getFavorites(req.user.userId);
  }

  //* Delete favorites
  @UseGuards(JwtAuthGuard)
  @Delete(':verseId')
  removeFavorites(
    @Param() dto: RemoveFavoriteDto,
    @Req() req: RequestWithUser,
  ) {
    return this.favoriteService.removeFavorites(
      req.user.userId,
      dto.verseId as string,
    );
  }
}
