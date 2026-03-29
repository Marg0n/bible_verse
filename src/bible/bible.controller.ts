import { Controller, Get, Query } from '@nestjs/common';
import { BibleService } from './bible.service';

@Controller('bible')
export class BibleController {
  constructor(private readonly BibleService: BibleService) {}

  @Get('random')
  getRandomVerse() {
    return this.BibleService.getRandomVerse();
  }

  @Get('daily')
  getDailyVerse(@Query('lang') lang: string) {
    return this.BibleService.getDailyVerse(lang);
  }
}
