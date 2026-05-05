import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StreakService } from './streak.service';
import { UpdateStreakDto } from './dto/updateStreakDto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  updateStreak(@Body() dto: UpdateStreakDto) {
    return this.streakService.updateStreak(dto.userId);
  }
}
