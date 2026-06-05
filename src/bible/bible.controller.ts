import { Controller, Get, Query } from '@nestjs/common';
import { BibleService } from './bible.service';
import { BibleVerseResponseDto, LanguageDto } from './dto/languageDto.dto';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @ApiOperation({
    summary: 'Get the stable verse of the day',
    description:
      'Retrieves a calculated verse based on a daily time hash string value.',
  })
  @ApiOkResponse({
    description: 'Daily verse data fetched successfully.',
    type: BibleVerseResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters passed.' })
  @Get()
  getDailyVerse(@Query() query: LanguageDto) {
    return this.bibleService.getDailyVerse(query.lang);
  }

  @ApiOperation({
    summary: 'Get a completely random bible verse record',
    description:
      'Generates unpredictable indices across existing indexes to pick a verse.',
  })
  @ApiOkResponse({
    description: 'Random verse fetched successfully.',
    type: BibleVerseResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters passed.' })
  @Get('random')
  getRandomVerse(@Query() query: LanguageDto) {
    return this.bibleService.getRandomVerse(query.lang);
  }
}
