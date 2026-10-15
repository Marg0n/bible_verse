import { Controller, Get, Headers, Query } from '@nestjs/common';
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
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

//* GeDaily verse
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
  getDailyVerse(
    @Query() query: LanguageDto,
    @Headers('x-timezone') tz = 'UTC',
  ) {
    return this.bibleService.getDailyVerse(query.lang, tz);
  }

  //* Get Random verse
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

  //* Search verse
  @ApiOperation({
    summary: 'Search bible verses by keyword',
    description:
      'Searches through English and Bengali verses for keyword matches.',
  })
  @ApiOkResponse({
    description: 'Search results fetched successfully.',
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
  //? Add Swagger Query Parameter Documentation for the options
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search keyword',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['en', 'bn', 'both'],
    default: 'both',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    default: 10,
    description: 'Max number of results to return',
  })
  @ApiQuery({
    name: 'bookIndex',
    required: false,
    type: Number,
    description:
      'Optional 0-based book index to search within a specific book (e.g. 42 for John)',
  })
  @Get('search')
  searchVerses(
    @Query('q') query: string,
    @Query('lang') lang: string = 'both',
    @Query('limit') limit?: string,
    @Query('bookIndex') bookIndex?: string,
  ) {
    //? Parse query parameters safely to numbers (NestJS Query params come in as strings)
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedBookIndex =
      bookIndex !== undefined ? parseInt(bookIndex, 10) : undefined;

    return this.bibleService.searchVerses(
      query,
      lang,
      parsedLimit,
      parsedBookIndex,
    );
  }
}
