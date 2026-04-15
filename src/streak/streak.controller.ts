import { Body, Controller, Get } from '@nestjs/common';
import { StreakService } from './streak.service';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get()
  updateStreak(@Body('userId') userId: string) {
    if (!userId) {
      return { message: 'userId is required' };
    }

    return this.streakService.updateStreak(userId);
  }
}
