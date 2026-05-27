/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/auth.interface';
import { access } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  //* Create user by registration
  async register(email: string, password: string) {
    try {
      const mail = email.toLowerCase();

      //? Check existing user
      const existingUser = await this.prisma.user.findUnique({
        where: { email: mail },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exist');
      }

      //? Hashing
      const hashPassword = await bcrypt.hash(password, 10);

      //? Create user
      const user = await this.prisma.user.create({
        data: {
          email: mail,
          password: hashPassword,
        },
      });

      //? Create token
      const tokens = await this.generateTokens(user.id, user.email);

      //? Update refresh token to db
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      //? Removing password from respnse
      const { password: _, ...safeUser } = user;

      const result = {
        user: safeUser,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Register error: ', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('User Creation failed');
    }
  }

  //* Token generation helper function
  private async generateTokens(userId: string, email: string) {
    const payload = {
      sub: userId, //? sub = subject (standard JWT field))
      email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  //* Hashed Refresh Token to db
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  //* Login
  async login(email: string, password: string) {
    try {
      const mail = email.toLowerCase();

      //? Find user
      const user = await this.prisma.user.findUnique({
        where: {
          email: mail,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      //? Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }

      //? Token
      const tokens = await this.generateTokens(user.id, user.email);

      //? Update refresh token to db
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      //? Remove password
      const { password: _, ...safeUser } = user;

      const result = {
        user: safeUser,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Login error: ', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('User Login failed');
    }
  }

  //* Refresh Token
  async refreshToken(refreshToken: string) {
    try {
      //? Check validity/ verify token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          // secret: process.env.JWT_REFRESH_SECRET,
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      //? Find user
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Unauthorized user');
      }

      //! Compare hashed token
      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid user');
      }

      //! Generate new token
      const tokens = await this.generateTokens(user.id, user.email);

      //! Rotate refresh token to DB
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        },
      };
    } catch (error) {
      console.log('Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
