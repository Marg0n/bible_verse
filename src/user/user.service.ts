import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Theme } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  createUser() {
    try {
      return this.prisma.user.create({
        data: {},
      });
    } catch (error) {
      console.log('create user:', error);
      throw new BadRequestException('Creating user failed');
    }
  }

  getUser(id: string) {
    try {
      return this.prisma.user.findUnique({
        where: { id },
        include: { favorites: true },
      });
    } catch (error) {
      console.log('get user:', error);
      throw new BadRequestException('Problem getting user');
    }
  }

  updateTheme(userId: string, theme: Theme) {
    try {
      return this.prisma.user.update({
        where: { id: userId },
        data: { theme },
      });
    } catch (error) {
      console.log('Theme:', error);
      throw new BadRequestException('Theme updating failed');
    }
  }
}
