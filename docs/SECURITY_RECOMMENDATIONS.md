# 보안 개선 권장 사항

## 1. CSRF (Cross-Site Request Forgery) 방어 추가

### 현재 상태
- JWT를 Authorization 헤더로 전송
- localStorage에 토큰 저장

### 문제점
현재는 CSRF 공격에 상대적으로 안전하지만, 쿠키 기반 인증으로 변경 시 취약해질 수 있습니다.

### 해결 방법

#### A. SameSite 쿠키 사용 (권장)
```typescript
// backend/src/main.ts
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// auth.controller.ts - 로그인 응답 시
@Post('login')
async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) response: Response,
  @Ip() ipAddress: string,
  @Headers('user-agent') userAgent?: string,
  @Headers('x-device-id') deviceId?: string,
) {
  const result = await this.authService.login(dto, {
    ipAddress,
    userAgent,
    deviceId,
  });

  // HttpOnly 쿠키로 리프레시 토큰 전송
  response.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,       // JavaScript 접근 불가 (XSS 방어)
    secure: true,         // HTTPS에서만 전송
    sameSite: 'strict',   // CSRF 방어
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    path: '/v1/auth/refresh', // 특정 경로에서만 전송
  });

  return {
    accessToken: result.accessToken,
    user: result.user,
  };
}
```

#### B. CSRF 토큰 사용 (추가 보안)
```bash
npm install csurf
```

```typescript
// backend/src/main.ts
import csurf from 'csurf';

app.use(csurf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
}));

// CSRF 토큰 엔드포인트 추가
@Get('csrf-token')
getCsrfToken(@Req() req: Request) {
  return { csrfToken: req.csrfToken() };
}
```

---

## 2. Content Security Policy (CSP) 강화

### 현재 문제
```typescript
styleSrc: ["'self'", "'unsafe-inline'"], // ⚠️ 인라인 스타일 허용
```

### 해결 방법

#### A. Nonce 기반 CSP
```typescript
// backend/src/main.ts
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  res.locals.nonce = uuidv4();
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          process.env.NODE_ENV === 'production'
            ? 'https://api.yoursite.com'
            : 'http://localhost:4000'
        ],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], // Clickjacking 방어
      },
    },
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  })
);
```

#### B. Hash 기반 CSP (정적 스타일)
```typescript
styleSrc: ["'self'", "'sha256-HASH_VALUE'"],
```

---

## 3. Token Storage 개선

### 현재 문제
```typescript
// frontend/src/lib/axios/axios-http-client.ts
const token = localStorage.getItem('accessToken'); // ⚠️ XSS에 취약
```

### 해결 방법

#### A. 메모리 저장 (가장 안전)
```typescript
// frontend/src/lib/token-manager.ts
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export const tokenManager = new TokenManager();
```

**단점:** 새로고침 시 토큰 손실 → 리프레시 토큰으로 재발급 필요

#### B. HttpOnly 쿠키 (권장)
위의 CSRF 방어 섹션 참조

---

## 4. Input Validation 강화

### A. 화이트리스트 검증
```typescript
// backend/src/auth/dto/register.dto.ts
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RegisterDto implements RegisterRequest {
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  email: string;

  @Expose()
  @IsString()
  @MinLength(8)
  password: string;

  @Expose()
  @IsString()
  nickName: string;

  @Expose()
  @IsString()
  phoneNumber: string;

  @Expose()
  @IsString()
  address: string;
}
```

```typescript
// backend/src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,          // DTO에 없는 속성 제거
    forbidNonWhitelisted: true, // 추가 속성 있으면 에러
    transformOptions: {
      enableImplicitConversion: true,
      excludeExtraneousValues: true, // @Expose()만 허용
    },
  })
);
```

### B. Sanitization (살균)
```bash
npm install class-sanitizer
```

```typescript
import { Trim, Escape } from 'class-sanitizer';

export class RegisterDto {
  @Trim()
  @IsEmail()
  email: string;

  @Escape() // HTML 태그 이스케이프
  @IsString()
  nickName: string;
}
```

---

## 5. Rate Limiting 개선

### A. Distributed Rate Limiting
```typescript
// backend/src/auth/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../intrastructure/redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];
    const userId = request.user?.sub;

    // 복합 키 생성 (IP + User Agent + User ID)
    const identifier = `${ip}:${userAgent}:${userId || 'anonymous'}`;

    const isAllowed = await this.redisService.checkRateLimit(
      identifier,
      100, // 100 requests
      60   // per 60 seconds
    );

    if (!isAllowed) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
```

### B. Token Bucket 알고리즘
```typescript
// backend/src/intrastructure/redis/redis.service.ts
async checkRateLimitTokenBucket(
  identifier: string,
  capacity: number,
  refillRate: number, // tokens per second
): Promise<boolean> {
  const key = `rate_limit:token_bucket:${identifier}`;
  const now = Date.now() / 1000;

  const bucket = await this.redis.get(key);
  let tokens = capacity;
  let lastRefill = now;

  if (bucket) {
    const data = JSON.parse(bucket);
    const elapsed = now - data.lastRefill;
    tokens = Math.min(capacity, data.tokens + elapsed * refillRate);
    lastRefill = now;
  }

  if (tokens >= 1) {
    tokens -= 1;
    await this.redis.setex(
      key,
      3600,
      JSON.stringify({ tokens, lastRefill })
    );
    return true;
  }

  return false;
}
```

---

## 6. Logging & Monitoring

### A. 보안 이벤트 로깅
```typescript
// backend/src/audit/audit.service.ts
async logSecurityEvent(event: {
  type: 'SUSPICIOUS_ACTIVITY' | 'BRUTE_FORCE' | 'SQL_INJECTION_ATTEMPT' | 'XSS_ATTEMPT',
  userId?: number,
  ipAddress: string,
  userAgent?: string,
  details: string,
}) {
  // 즉시 알림 전송 (Slack, Email 등)
  if (event.type === 'BRUTE_FORCE') {
    await this.notificationService.sendAlert(event);
  }

  // 로그 저장
  await this.auditLogRepository.save({
    action: AuditAction.SECURITY_EVENT,
    ...event,
  });
}
```

### B. Intrusion Detection
```typescript
// backend/src/middleware/intrusion-detection.middleware.ts
@Injectable()
export class IntrusionDetectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const suspiciousPatterns = [
      /<script>/i,           // XSS
      /(\bOR\b|\bAND\b).*=/i, // SQL Injection
      /\.\.\//,              // Path Traversal
      /__proto__/,           // Prototype Pollution
    ];

    const inputs = [
      JSON.stringify(req.body),
      JSON.stringify(req.query),
      JSON.stringify(req.params),
    ];

    for (const input of inputs) {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(input)) {
          this.auditService.logSecurityEvent({
            type: 'SUSPICIOUS_ACTIVITY',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: `Suspicious pattern detected: ${pattern}`,
          });

          throw new HttpException(
            'Invalid input detected',
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    next();
  }
}
```

---

## 7. Secure Headers 추가

### A. Helmet 설정 강화
```typescript
// backend/src/main.ts
app.use(
  helmet({
    contentSecurityPolicy: { /* ... */ },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
  })
);
```

### B. Custom Security Headers
```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

---

## 8. Database Security

### A. 연결 암호화
```typescript
// backend/src/app/app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem').toString(),
  } : false,
  // ...
}),
```

### B. 민감 정보 암호화
```typescript
// backend/src/user/entity/user.entity.ts
import { Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as crypto from 'crypto';

@Entity('users')
export class UserModel extends BaseModel {
  @Column()
  email: string;

  @Column({ transformer: encryptionTransformer })
  phoneNumber: string; // 암호화된 전화번호

  @Column({ transformer: encryptionTransformer })
  address: string; // 암호화된 주소
}

// Transformer
const encryptionTransformer = {
  to: (value: string) => {
    if (!value) return value;
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
      Buffer.from(process.env.ENCRYPTION_IV, 'hex')
    );
    return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
  },
  from: (value: string) => {
    if (!value) return value;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
      Buffer.from(process.env.ENCRYPTION_IV, 'hex')
    );
    return decipher.update(value, 'hex', 'utf8') + decipher.final('utf8');
  },
};
```

---

## 9. API Security

### A. API Versioning
```typescript
// backend/src/main.ts
app.setGlobalPrefix('v1');

// 새 버전 출시 시
app.setGlobalPrefix('v2');
```

### B. API Key / Rate Limiting per User
```typescript
@Controller('v1/api')
export class ApiController {
  @Get('sensitive-data')
  @UseGuards(JwtAuthGuard, ApiKeyGuard, UserRateLimitGuard)
  async getSensitiveData(@User('sub') userId: number) {
    // ...
  }
}
```

---

## 10. Frontend Security

### A. Subresource Integrity (SRI)
```typescript
// frontend/next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'sha256-...'",
          },
        ],
      },
    ];
  },
};
```

### B. Input Sanitization (DOMPurify)
```bash
npm install dompurify
```

```typescript
import DOMPurify from 'dompurify';

function sanitizeHTML(dirty: string) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}
```

---

## 우선순위

### High Priority (즉시 적용)
1. ✅ CSRF 방어 (SameSite 쿠키)
2. ✅ CSP 강화 (unsafe-inline 제거)
3. ✅ HttpOnly 쿠키로 토큰 저장
4. ✅ Input Validation 화이트리스트
5. ✅ Security Headers 추가

### Medium Priority (1-2주 내)
6. ⚠️ 민감 정보 암호화 (전화번호, 주소)
7. ⚠️ Intrusion Detection 시스템
8. ⚠️ Advanced Rate Limiting (Token Bucket)
9. ⚠️ Security Event Logging

### Low Priority (향후 고려)
10. 📋 2FA/MFA 구현
11. 📋 API Key 관리 시스템
12. 📋 SIEM 통합 (Splunk, ELK)

---

## 보안 체크리스트

- [ ] HTTPS 강제 적용
- [ ] HttpOnly, Secure, SameSite 쿠키 사용
- [ ] CSRF 토큰 검증
- [ ] XSS 방어 (CSP, sanitization)
- [ ] SQL Injection 방어 (Parameterized Queries)
- [ ] Rate Limiting (IP, User, Endpoint)
- [ ] Input Validation & Sanitization
- [ ] Output Encoding
- [ ] 민감 정보 암호화
- [ ] Audit Logging
- [ ] Security Headers
- [ ] 정기 보안 감사
- [ ] 의존성 취약점 스캔 (`npm audit`)
- [ ] 침투 테스트 (Penetration Testing)

---

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
