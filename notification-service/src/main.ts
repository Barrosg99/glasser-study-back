import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 4000;

  app.enableCors();
  app.use(express.json());

  await app.listen(port);

  const serverUrl = await app.getUrl();
  const url = serverUrl.replace('[::1]', 'localhost');

  Logger.log(`🚀 Notification Service is running on: ${url}`, 'API');
}
bootstrap();
