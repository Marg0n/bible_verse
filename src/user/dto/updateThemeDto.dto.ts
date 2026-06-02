import { ApiProperty } from '@nestjs/swagger';
import { Theme } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateThemeDto {
  @ApiProperty({
    enum: Theme,
    example: Theme.dark,
  })
  @IsEnum(Theme)
  theme!: Theme;
}
