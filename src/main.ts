/*
 * Copyright (c) 2026 Sokhorio Margon D' Costa. All Rights Reserved.
 *
 * This repository is for portfolio demonstration purposes only.
 * No part of this code may be used, copied, or distributed for commercial or private projects without explicit written permission.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //? Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //? strips unknown fields
      forbidNonWhitelisted: true, //? throws error if extra fields sent
      transform: true,
    }),
  );

  //? This helps Express report the real client IP instead of the proxy's IP.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  //? Globally observes every request and gets logged
  app.useGlobalInterceptors(new LoggingInterceptor());

  //? Swagger config
  const config = new DocumentBuilder()
    .setTitle('Bible Verse API')
    .setDescription(
      'Backend API for Bangla & english Bible Verse Widget and chrome extension.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
