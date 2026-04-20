/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import qs from 'qs';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie Parser 미들웨어 (쿠키 읽기 위해 필요)
  app.use(cookieParser());

  // 보안 헤더 설정 (CSP 포함)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://cdn.iamport.kr'],
          styleSrc: ["'self'", "'unsafe-inline'"], // emotion, styled-components 등을 위해
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'http://localhost:4000', 'https://api.iamport.kr'],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ['https://*.iamport.kr'],
        },
      },
      crossOriginEmbedderPolicy: false, // 개발 환경에서 CORS 문제 방지
    })
  );

  // CORS 설정
  // FRONTEND_URL: 로컬은 http://localhost:3000, 운영은 Vercel URL (https://your-app.vercel.app)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'x-idempotency-key'],
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('query parser', (str: string) => {
    return qs.parse(str, {
      allowDots: false,       // a.b.c 형식 비활성화
      allowPrototypes: false, // 보안: 프로토타입 오염 방지
      depth: 5,               // 최대 중첩 깊이
      parameterLimit: 100,    // 최대 파라미터 개수
      parseArrays: true,      // 배열 파싱 활성화
      comma: false,           // 쉼표로 배열 분리 (a=1,2,3)
      delimiter: '&',         // 파라미터 구분자
    });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 4000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
