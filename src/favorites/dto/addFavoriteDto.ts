import { IsString, IsNotEmpty } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  verseId!: string;
}
