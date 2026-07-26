/*
 * Copyright (c) 2026 Sokhorio Margon D' Costa. All Rights Reserved.
 *
 * This repository is for portfolio demonstration purposes only.
 * No part of this code may be used, copied, or distributed for commercial or private projects without explicit written permission.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BibleModule } from './bible/bible.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PrismaModule } from './prisma/prisma.module';
import { StreakModule } from './streak/streak.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { validate } from './config/validation';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    //! Must be first!
    ConfigModule.forRoot({
      isGlobal: true,

      validate,

      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, //? ttl = Time To Live = 60 seconds
          limit: 100, //? limit = 100 means limit = 100 per 60s from the same IP
        },
      ],
    }),
    BibleModule,
    PrismaModule,
    UserModule,
    FavoritesModule,
    StreakModule,
    AuthModule,
    RedisModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  // controllers: [AppController, StreakController],
  // providers: [AppService, PrismaService, StreakService],
})
export class AppModule {}
