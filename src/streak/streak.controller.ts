import { Body, Controller, Get } from '@nestjs/common';
import { StreakService } from './streak.service';
import { UpdateStreakDto } from './dto/updateStreakDto.dto';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get()
  updateStreak(@Body() dto: UpdateStreakDto) {
    return this.streakService.updateStreak(dto.userId);
  }
}
