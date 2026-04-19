/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query } from '@nestjs/common';
import { BibleService } from './bible.service';
import { LanguageDto } from './dto/languageDto.dto';

@Controller('bible')
export class BibleController {
  constructor(private readonly BibleService: BibleService) {}

  @Get()
  getDailyVerse(@Query() query: LanguageDto) {
    return this.BibleService.getDailyVerse(query.lang);
  }

  @Get('random')
  getRandomVerse(@Query() query: LanguageDto) {
    return this.BibleService.getRandomVerse(query.lang);
  }
}
