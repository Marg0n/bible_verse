import { PartialType } from '@nestjs/mapped-types';
import { AddFavoriteDto } from './addFavoriteDto';

export class RemoveFavoriteDto extends PartialType(AddFavoriteDto) {}
