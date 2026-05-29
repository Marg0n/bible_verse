import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //? strips unknown fields
      forbidNonWhitelisted: true, //? throws error if extra fields sent
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Bible Verse API')
    .setDescription(
      'Backend API for Bangla & english Bible Verse Widget and chrome extension.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
