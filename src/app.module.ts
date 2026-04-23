import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BibleModule } from './bible/bible.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { FavoritesModule } from './favorites/favorites.module';
import { StreakService } from './streak/streak.service';
import { StreakController } from './streak/streak.controller';
import { StreakModule } from './streak/streak.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    BibleModule,
    PrismaModule,
    UserModule,
    FavoritesModule,
    StreakModule,
    AuthModule,
  ],
  controllers: [AppController, StreakController],
  providers: [AppService, PrismaService, StreakService],
})
export class AppModule {}
