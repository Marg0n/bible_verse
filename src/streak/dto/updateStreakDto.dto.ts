import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStreakDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
