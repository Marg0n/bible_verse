import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Theme } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  createUser() {
    try {
      const result = this.prisma.user.create({
        data: {},
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('create user:', error);
      throw new BadRequestException('Creating user failed');
    }
  }

  getUser(id: string) {
    try {
      const result = this.prisma.user.findUnique({
        where: { id },
        include: { favorites: true },
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('get user:', error);
      throw new BadRequestException('Problem getting user');
    }
  }

  updateTheme(userId: string, theme: Theme) {
    try {
      const result = this.prisma.user.update({
        where: { id: userId },
        data: { theme },
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('Theme:', error);
      throw new BadRequestException('Theme updating failed');
    }
  }
}
