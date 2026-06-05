import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

//* Incoming Query DTO for Swagger
export class LanguageDto {
  @ApiPropertyOptional({
    description:
      'Filter language of the returned verse. If left empty, both languages will be returned.',
    enum: ['en', 'bn'],
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'bn'])
  lang?: 'en' | 'bn';
}

//* The structural data shape when lang is passed ('en' or 'bn')
class LocalizedVerseDto {
  @ApiProperty({ example: 1, description: 'The chapter number' })
  chapter!: number;

  @ApiProperty({ example: 1, description: 'The verse number' })
  verse!: number;

  @ApiProperty({
    example: 'Genesis',
    description: 'The name of the book in the selected language',
  })
  book!: string;

  @ApiProperty({
    example: 'In the beginning...',
    description: 'The verse content text',
  })
  text!: string;

  @ApiPropertyOptional({
    example: '2026-06-04',
    description: 'Only present on daily verse endpoint requests',
  })
  date?: string;
}

//* The structural data shape when NO lang is passed (default fallback containing both)
class DualLanguageVerseDto {
  @ApiProperty({ example: 1 })
  chapter!: number;

  @ApiProperty({ example: 1 })
  verse!: number;

  @ApiProperty({ example: 'আদিপুস্তক' })
  book_bn!: string;

  @ApiProperty({ example: 'Genesis' })
  book_en!: string;

  @ApiProperty({ example: 'প্রথমেই ঈশ্বর আকাশ ও পৃথিবীর সৃষ্টি করিলেন।' })
  text_bn!: string;

  @ApiProperty({
    example: 'In the beginning God created the heaven and the earth.',
  })
  text_en!: string;

  @ApiPropertyOptional({ example: '2026-06-04' })
  date?: string;
}

//* Combined Wrapper Response using Swagger's 'oneOf' schema mapping matrix
export class BibleVerseResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    oneOf: [
      { $ref: '#/components/schemas/LocalizedVerseDto' },
      { $ref: '#/components/schemas/DualLanguageVerseDto' },
    ],
    description:
      'Returns a localized model if lang param is passed, otherwise a dual-language object structural layout.',
  })
  data!: LocalizedVerseDto | DualLanguageVerseDto;
}
