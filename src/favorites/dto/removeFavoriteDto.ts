import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveFavoriteDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  verseId!: string;
}
