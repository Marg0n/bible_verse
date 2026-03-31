/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query } from '@nestjs/common';
import { BibleService } from './bible.service';

@Controller('bible')
export class BibleController {
  constructor(private readonly BibleService: BibleService) {}

  @Get()
  getDailyVerse(@Query('lang') lang: string) {
    return this.BibleService.getDailyVerse(lang);
  }

  @Get('random')
  getRandomVerse(@Query('lang') lang: string) {
    return this.BibleService.getRandomVerse(lang);
  }
}
