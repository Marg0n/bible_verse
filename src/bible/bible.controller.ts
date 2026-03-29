import { Controller, Get } from '@nestjs/common';
import { BibleService } from './bible.service';

@Controller('bible')
export class BibleController {
  constructor(private readonly BibleService: BibleService) {}

  @Get('random')
  getRandomVerse() {
    return this.BibleService.getRandomVerse();
  }
}
