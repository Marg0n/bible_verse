import { IsIn, IsOptional, IsString } from 'class-validator';

export class LanguageDto {
  @IsOptional()
  @IsString()
  @IsIn(['en', 'bn'])
  lang!: 'en' | 'bn';
}
