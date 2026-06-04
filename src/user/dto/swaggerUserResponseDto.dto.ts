import { ApiProperty } from '@nestjs/swagger';
import { Theme } from '@prisma/client';

//* Create a DTO for the Favorite model if you haven't already
class UserFavoriteDto {
  @ApiProperty({ example: 'f3b3b4b5-c6d7-4e8f-9a0b-1c2d3e4f5g6h' })
  id!: string;

  @ApiProperty({
    example: 'f3b3b4b5-c6d7-4e8f-9a0b-1c2d3e4f5g6h',
    description: 'ID of the favorite item',
  })
  userId!: string;

  @ApiProperty({ example: '18110009', description: 'ID of the favorite item' })
  verseId!: string;

  @ApiProperty({ example: '2026-06-02T12:34:56.789Z' })
  createdAt!: Date;
}

//* Create the sanitized User Entity DTO (Omitting password & refreshToken)
class UserDataDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id!: string;

  @ApiProperty({ example: 'developer@example.com' })
  email!: string;

  @ApiProperty({ enum: Theme, example: Theme.light })
  theme!: Theme;

  @ApiProperty({ example: 5, description: 'Current daily active streak count' })
  streakCount!: number;

  @ApiProperty({ example: '2026-06-02T00:00:00.000Z', nullable: true })
  lastActiveDate!: Date | null;

  @ApiProperty({ example: '2026-01-15T08:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-02T18:30:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({
    type: [UserFavoriteDto],
    description: 'List of user favorites',
  })
  favorites!: UserFavoriteDto[];
}

//* The main wrapper DTO that your service returns
export class GetUserResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'User data successfully retrieved.' })
  description!: string;

  @ApiProperty({ type: UserDataDto })
  data!: UserDataDto;
}
