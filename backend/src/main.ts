/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import qs from 'qs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 4000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
