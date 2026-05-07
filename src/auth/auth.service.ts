import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  //* Create user by registration
  async createAnonymousUser(email: string) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
        },
      });

      const token = this.jwtService.sign({
        sub: user.id, //? sub = subject (standard JWT field))
      });

      const result = {
        user,
        access_token: token,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('createAnonymousUser: ', error);
      throw new BadRequestException('User Creation failed');
    }
  }

  //* Login
  async userLogin(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const token = this.jwtService.sign({
        sub: user.id, //? sub = subject (standard JWT field))
      });

      const result = {
        user,
        access_token: token,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Login error: ', error);
      throw new BadRequestException('User Login failed');
    }
  }
}
