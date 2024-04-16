import helmet from 'helmet';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
const logger = new Logger('main');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });

  const { httpAdapter } = app.get(HttpAdapterHost,);
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(httpAdapter)
  ) 
  
  const configService = app.get(ConfigService);

  const PORT = 8000;

  app.enableCors({ credentials: true, origin: true });

  app.use(bodyParser.json({ limit: '8mb' }));

  app.use(cookieParser());

  const PREFIX = configService.get<string>('PREFIX');
  app.setGlobalPrefix(PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Due to this the img stream is not working
  // app.use(helmet()); 
  logger.log(`Starting server on port ${PORT}`);
  await app.listen(PORT);
}
bootstrap();
