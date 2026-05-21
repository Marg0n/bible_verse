/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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
      const token = this.jwtService.sign({
        sub: user.id, //? sub = subject (standard JWT field))
        email: user.email,
      });

      //? Removing password from respnse
      const { password: _, ...safeUser } = user;

      const result = {
        user: safeUser,
        access_token: token,
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
      const token = this.jwtService.sign({
        sub: user.id, //? sub = subject (standard JWT field))
        email: user.email,
      });

      //* Remove password
      const { password: _, ...safeUser } = user;

      const result = {
        user: safeUser,
        access_token: token,
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
}
