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
    // RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  // controllers: [AppController, StreakController],
  // providers: [AppService, PrismaService, StreakService],
})
export class AppModule {}
