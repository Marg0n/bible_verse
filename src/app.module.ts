import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BibleModule } from './bible/bible.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [BibleModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
