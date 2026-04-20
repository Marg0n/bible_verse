import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StreakService {
  constructor(private prisma: PrismaService) {}

  //* Streak update
  async updateStreak(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = user?.lastActiveDate?.toISOString().split('T')[0];

      let streak = user?.streakCount ?? 0;

      //? Streak count
      if (!lastActiveDate) {
        streak = 1;
      } else {
        const difference =
          (new Date(today).getTime() - new Date(lastActiveDate).getTime()) /
          (1000 * 60 * 60 * 24);

        if (difference === 1) streak += 1;
        else if (difference > 1) streak = 1;
      }

      return this.prisma.user.update({
        where: { id: userId },
        data: {
          streakCount: streak,
          lastActiveDate: new Date(),
        },
      });
    } catch (err) {
      console.log('update streak: ', err);
      throw new BadRequestException('Error at updating the streak');
    }
  }
}
