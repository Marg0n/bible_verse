import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

//* Used for incoming POST requests
export class FavoriteDto {
  @ApiProperty({
    example: '18110009',
    description: 'The unique identifier/ID of the bible verse',
  })
  @IsString()
  @IsNotEmpty()
  verseId!: string;
}

//* Represents the data layout inside the database
class FavoriteRecordDto {
  @ApiProperty({ example: 'f3b3b4b5-c6d7-4e8f-9a0b-1c2d3e4f5g6h' })
  id!: string;

  @ApiProperty({ example: 'user-uuid-12345' })
  userId!: string;

  @ApiProperty({ example: '18110009' })
  verseId!: string;

  @ApiProperty({ example: '2026-06-03T12:00:00.000Z' })
  createdAt!: Date;
}

//* Represents the hydrated data containing the verse payload from BibleService
class HydratedFavoriteDto extends FavoriteRecordDto {
  @ApiProperty({
    example: {
      text: 'In the beginning, God created the heavens and the earth.',
      book: 'Genesis',
      chapter: 1,
      verse: 1,
    },
    description: 'The decoded verse details fetched from the Bible service',
  })
  verse!: any;
}

//* Standard Wrapped Success Response DTO
export class FavoriteResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Action executed successfully' })
  description!: string;

  @ApiProperty({ type: FavoriteRecordDto })
  data!: any;
}

//* Paginated / List Success Response DTO
export class FavoriteListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Favorites data successfully retrieved' })
  description!: string;

  @ApiProperty({ type: [HydratedFavoriteDto] })
  data!: HydratedFavoriteDto[];
}
