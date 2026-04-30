import { Body, Controller, Post } from '@nestjs/common';
import { StreakService } from './streak.service';
import { UpdateStreakDto } from './dto/updateStreakDto.dto';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Post()
  updateStreak(@Body() dto: UpdateStreakDto) {
    return this.streakService.updateStreak(dto.userId);
  }
}
