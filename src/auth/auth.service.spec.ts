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

  //* Testing new successful user registration
  it('should register a new user successfully', async () => {
    const email = 'test@mail.com';
    const password = 'Password123!';

    //? Create a real bcrypt hash for the test
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = {
      id: 'user-123',
      email,
      password: hashedPassword,
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

  //* Testing reject user registration
  it('should reject registration if the email already exists', async () => {
    const email = 'existing@mail.com';
    const password = 'Password123!';

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-user-123',
      email,
      password: 'some-hashed-password',
    });

    await expect(service.register(email, password)).rejects.toThrow(
      `Email ${email} already exists!`,
    );

    //? User creation must never happen
    expect(prismaMock.user.create).not.toHaveBeenCalled();

    //? Token generation must never happen
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  //* Testing successful user login
  it('should login a user successfully', async () => {
    const email = 'LOGIN@mail.com';
    const normalizedEmail = 'login@mail.com';
    const password = 'Password123!';

    //? Create a real bcrypt hash for the test
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = {
      id: 'user-123',
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    };

    //? Mock finding the existing user
    prismaMock.user.findUnique.mockResolvedValue(existingUser);

    //? Mock JWT generation
    jwtMock.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    //? Mock saving the hashed refresh token
    prismaMock.user.update.mockResolvedValue({
      ...existingUser,
      refreshToken: 'hashed-refresh-token',
    });

    const result = await service.login(email, password);

    //? Check successful response
    expect(result.success).toBe(true);
    expect(result.description).toBe('User login successful');

    //? Check email normalization
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: normalizedEmail },
    });

    //? Check password is not exposed
    expect(result.data.user).not.toHaveProperty('password');

    //? Check JWT generation
    expect(jwtMock.signAsync).toHaveBeenCalledTimes(2);

    //? Check refresh token storage
    const updateCall = prismaMock.user.update.mock.calls[0][0];

    expect(updateCall.where.id).toBe(existingUser.id);

    expect(
      await bcrypt.compare('new-refresh-token', updateCall.data.refreshToken),
    ).toBe(true);

    // Check returned tokens
    expect(result.data.access_token).toBe('new-access-token');
    expect(result.data.refresh_token).toBe('new-refresh-token');
  });
});
