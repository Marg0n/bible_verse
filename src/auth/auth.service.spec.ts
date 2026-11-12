/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
    }),
  };

  const redisMock = {
    getClient: jest.fn(),
  };

  const mailMock = {
    senOtpEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtMock,
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: configMock,
        },
        {
          provide: RedisService,
          useValue: redisMock,
        },
        {
          provide: MailService,
          useValue: mailMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user successfully', async () => {
    const email = 'test@mail.com';
    const password = 'Password123!';

    const createdUser = {
      id: 'user-123',
      email,
      password: 'hashed-password',
      createdAt: new Date(),
    };

    //? No existing user
    prismaMock.user.findUnique.mockResolvedValue(null);

    //? Simulated successful database creation
    prismaMock.user.create.mockResolvedValue(createdUser);

    //? Simulate JWT generation
    jwtMock.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    //? Simulate refresh-token DB update
    prismaMock.user.update.mockResolvedValue({
      ...createdUser,
      refreshToken: 'hashed-refresh-token',
    });

    const result = await service.register(email, password);

    //? Check response
    expect(result.success).toBe(true);
    expect(result.description).toBe('User registered successfully');

    //? Password must not be returned
    expect(result.data.user).not.toHaveProperty('password');

    //? Check email normalization and database lookup
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: email.toLowerCase() },
    });

    //? Check that the password was hashed before saving
    const createCall = prismaMock.user.create.mock.calls[0][0];
    expect(createCall.data.email).toBe(email);
    expect(await bcrypt.compare(password, createCall.data.password)).toBe(true);

    //? Check token generation
    expect(jwtMock.signAsync).toHaveBeenCalledTimes(2);

    //? Check refresh token was stored as a hash
    const updateCall = prismaMock.user.update.mock.calls[0][0];

    expect(updateCall.where.id).toBe(createdUser.id);
    expect(
      await bcrypt.compare('refresh-token', updateCall.data.refreshToken),
    ).toBe(true);

    //? Check returned tokens
    expect(result.data.access_token).toBe('access-token');
    expect(result.data.refresh_token).toBe('refresh-token');
  });
});
