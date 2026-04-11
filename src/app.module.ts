import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BibleModule } from './bible/bible.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [BibleModule, PrismaModule, UserModule, FavoritesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
