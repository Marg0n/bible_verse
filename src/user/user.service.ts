import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Theme } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  //* Create user data by Admin
  // async createUser(email: string, password: string) {
  //   try {
  //     const mail = email.toLowerCase();

  //     const result = await this.prisma.user.create({
  //       data: {
  //         email: mail,
  //         password,
  //       },
  //     });

  //     return {
  //       success: true,
  //       data: result,
  //     };
  //   } catch (error) {
  //     console.log('create user:', error);
  //     throw new BadRequestException('Creating user failed');
  //   }
  // }

  //* Get user data (Redis used)
  async getUser(id: string) {
    try {
      //? Cache Key
      const cacheKey = `user:${id}`;

      //? Checking Cache First
      const redis = this.redisService.getClient();

      const cached = await redis.get(cacheKey);

      if (cached) {
        console.log('USER CACHE HIT');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(cached);
      }

      //? test cache
      console.log('USER CACHE MISS');

      //? Query Database Only on Cache Miss
      const result = await this.prisma.user.findUnique({
        where: { id },
        include: {
          favorites: true,
        },
      });

      if (!result) {
        throw new NotFoundException('User not found');
      }

      //! Destructure password and refreshToken out, and gather everything else into "sanitizedUser"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, ...sanitizedUser } = result;

      const response = {
        success: true,
        description: 'User data successfully retrieved.',
        data: sanitizedUser,
      };

      //? Cache The Response
      await redis.set(cacheKey, JSON.stringify(response), {
        EX: 300, //? 5 minutes
      });

      return response;
    } catch (error) {
      console.log('get user:', error);
      throw new BadRequestException('Problem getting user');
    }
  }

  //* Update theme data (Redis used)
  async updateTheme(userId: string, theme: Theme) {
    try {
      const result = await this.prisma.user.update({
        where: { id: userId },
        data: { theme },
      });

      const redis = this.redisService.getClient();

      await redis.del(`user:${userId}`); //? This forces the next GET request to fetch fresh data.

      return {
        success: true,
        description: 'Theme updated successfully.',
        data: result,
      };
    } catch (error) {
      console.log('Theme:', error);
      throw new BadRequestException('Theme updating failed');
    }
  }
}
