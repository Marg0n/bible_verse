import { Controller, Get, Query } from '@nestjs/common';
import { BibleService } from './bible.service';
import {
  BibleVerseResponseDto,
  DualLanguageVerseDto,
  LanguageDto,
  LocalizedVerseDto,
} from './dto/languageDto.dto';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('bible')
@ApiExtraModels(LocalizedVerseDto, DualLanguageVerseDto)
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @ApiOperation({
    summary: 'Get the stable verse of the day',
    description:
      'Retrieves a calculated verse based on a daily time hash string value.',
  })
  @ApiOkResponse({
    description: 'Daily verse data fetched successfully.',
    type: BibleVerseResponseDto, //? This handles the wrapper (success, data)
    schema: {
      // ? Explicitly override the 'data' property schema to show the union
      allOf: [
        { $ref: getSchemaPath(BibleVerseResponseDto) },
        {
          properties: {
            data: {
              oneOf: [
                { $ref: getSchemaPath(LocalizedVerseDto) },
                { $ref: getSchemaPath(DualLanguageVerseDto) },
              ],
            },
          },
        },
      ],
    },
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
    schema: {
      //? Explicitly override the 'data' property schema to show the union
      allOf: [
        { $ref: getSchemaPath(BibleVerseResponseDto) },
        {
          properties: {
            data: {
              oneOf: [
                { $ref: getSchemaPath(LocalizedVerseDto) },
                { $ref: getSchemaPath(DualLanguageVerseDto) },
              ],
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters passed.' })
  @Get('random')
  getRandomVerse(@Query() query: LanguageDto) {
    return this.bibleService.getRandomVerse(query.lang);
  }
}
