import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { StreakService } from './streak.service';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  updateStreak(@Req() req: RequestWithUser) {
    return this.streakService.updateStreak(req.user.userId);
  }
}
