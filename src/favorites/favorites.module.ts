import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { BibleService } from '../bible/bible.service';

@Module({
  providers: [FavoritesService, BibleService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
