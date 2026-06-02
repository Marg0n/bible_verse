import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Theme } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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

  //* Get user data
  async getUser(id: string) {
    try {
      const result = await this.prisma.user.findUnique({
        where: { id },
        include: {
          favorites: true,
        },
      });

      if (!result) {
        throw new NotFoundException('User not found');
      }

      //? Destructure password and refreshToken out, and gather everything else into "sanitizedUser"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, ...sanitizedUser } = result;

      return {
        success: true,
        description: 'User data successfully retrieved.',
        data: sanitizedUser,
      };
    } catch (error) {
      console.log('get user:', error);
      throw new BadRequestException('Problem getting user');
    }
  }

  //* Update theme data
  async updateTheme(userId: string, theme: Theme) {
    try {
      const result = await this.prisma.user.update({
        where: { id: userId },
        data: { theme },
      });

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
