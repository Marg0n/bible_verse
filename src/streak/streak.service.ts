import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

      if (!user) {
        throw new NotFoundException('User not found');
      }

      //? Normalize dates to absolute UTC midnight boundaries to avoid fractional time bugs
      const now = new Date();
      const todayUtcMidnight = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
      );

      // const today = new Date().toISOString().split('T')[0];
      // const lastActiveDate = user?.lastActiveDate?.toISOString().split('T')[0];
      // const lastActiveDate = user?.lastActiveDate;

      let streak = user?.streakCount ?? 0;

      //? Streak count
      if (!user?.lastActiveDate) {
        //? First time ever initializing activity
        streak = 1;
      } else {
        // const difference =
        //   (new Date(today).getTime() - new Date(lastActiveDate).getTime()) /
        //   (1000 * 60 * 60 * 24);

        const lastActive = new Date(user.lastActiveDate);
        const lastActiveUtcMidnight = Date.UTC(
          lastActive.getUTCFullYear(),
          lastActive.getUTCMonth(),
          lastActive.getUTCDate(),
        );

        //? Calculate precise day difference
        const msPerDay = 1000 * 60 * 60 * 24;
        const difference = Math.floor(
          (todayUtcMidnight - lastActiveUtcMidnight) / msPerDay,
        );

        //! Note: If daysDifference === 0, they already checked in today! Streak remains unchanged.
        //? Exactly tomorrow! Increment streak
        if (difference === 1) streak += 1;
        //? Broke the streak, reset to 1
        else if (difference > 1) streak = 1;
      }

      const result = await this.prisma.user.update({
        where: { id: userId },
        data: {
          streakCount: streak,
          lastActiveDate: now, //new Date(),
        },
        //? optimization
        select: {
          // id: true,
          streakCount: true,
          lastActiveDate: true,
        },
      });

      return {
        success: true,
        description: 'Streak calculated and updated successfully.',
        data: result,
      };
    } catch (error) {
      console.log('update streak: ', error);
      throw new BadRequestException('Error at updating the streak');
    }
  }
}
