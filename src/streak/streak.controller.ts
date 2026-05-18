import { Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { StreakService } from './streak.service';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  updateStreak(@CurrentUser() user: AuthUser) {
    return this.streakService.updateStreak(user.userId);
  }
}
