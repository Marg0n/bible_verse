import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Theme } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  createUser() {
    return this.prisma.user.create({
      data: {},
    });
  }

  getUser(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { favorites: true },
    });
  }

  updateTheme(userId: string, theme: Theme) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { theme },
    });
  }
}
