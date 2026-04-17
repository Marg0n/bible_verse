import { IsString, IsNotEmpty } from 'class-validator';

export class GetFavoriteDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
