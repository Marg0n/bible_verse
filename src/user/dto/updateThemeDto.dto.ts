import { Theme } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateThemeDto {
  @IsEnum(Theme)
  theme!: Theme;
}
