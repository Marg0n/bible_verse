import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import {
  FavoriteDto,
  FavoriteListResponseDto,
  FavoriteResponseDto,
} from './dto/favoriteDto';
import { FavoritesService } from './favorites.service';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  //* Add favorite
  @ApiOperation({ summary: 'Add a verse to user favorites' })
  @ApiCreatedResponse({
    description: 'Added to Favorites successfully.',
    type: FavoriteResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Verse already added to favorites or validation failed.',
  })
  @Post()
  addFavorites(@Body() dto: FavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favoriteService.addFavorites(user.userId, dto.verseId);
  }

  //* Get favorites
  @ApiOperation({ summary: 'Get all user favorite verses' })
  @ApiOkResponse({
    description: 'Favorites data successfully retrieved.',
    type: FavoriteListResponseDto,
  })
  @Get()
  getFavorites(@CurrentUser() user: AuthUser) {
    return this.favoriteService.getFavorites(user.userId);
  }

  //* Delete favorites
  @ApiOperation({ summary: 'Remove a verse from favorites' })
  @ApiParam({
    name: 'verseId',
    description: 'The unique ID of the verse to remove',
    example: '18110009',
  })
  @ApiOkResponse({
    description: 'Favorites data successfully removed.',
    type: FavoriteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Favorite matching the user and verseId not found.',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':verseId')
  removeFavorites(
    @Param('verseId') dto: FavoriteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.favoriteService.removeFavorites(user.userId, dto.verseId);
  }
}
