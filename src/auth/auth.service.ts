import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtservice: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  //* Create user by registration
  async createAnonymousUser() {
    try {
      const user = await this.prisma.user.create({
        data: {},
      });

      const token = this.jwtservice.sign({
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
}
