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

@Module({
  imports: [
    //! Must be first!
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BibleModule,
    PrismaModule,
    UserModule,
    FavoritesModule,
    StreakModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  // controllers: [AppController, StreakController],
  // providers: [AppService, PrismaService, StreakService],
})
export class AppModule {}
