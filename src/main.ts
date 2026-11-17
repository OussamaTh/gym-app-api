import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Under NodeNext, TypeScript types the default import as a module object.
  // At runtime it is either the function itself or its .default, so this handles both.
  const helmetFn = (helmet as any).default ?? helmet;
  app.use(helmetFn());
  app.enableCors();

  app.setGlobalPrefix('api');
  // whitelist strips any field that is not declared in a DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 0.0.0.0 lets other devices reach the server; PORT is set by the host (Render, Vercel)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();