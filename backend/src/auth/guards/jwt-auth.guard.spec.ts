import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../auth.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: jest.Mocked<Pick<AuthService, 'verifyAccessToken'>>;

  beforeEach(() => {
    authService = { verifyAccessToken: jest.fn() } as any;
    guard = new JwtAuthGuard(authService as any);
  });

  const createMockContext = (authHeader?: string) => {
    const request: Record<string, any> = {
      headers: authHeader ? { authorization: authHeader } : {},
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  };

  it('유효한 Bearer 토큰 → true 반환, request.user 설정', async () => {
    const mockPayload = { sub: 1, email: 'test@example.com', roles: ['buyer'] };
    authService.verifyAccessToken.mockResolvedValue(mockPayload as any);

    const ctx = createMockContext('Bearer valid-token');
    const result = await guard.canActivate(ctx);
    const request = ctx.switchToHttp().getRequest();

    expect(result).toBe(true);
    expect(request.user).toEqual(mockPayload);
    expect(authService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
  });

  it('Authorization 헤더 없음 → UnauthorizedException', async () => {
    const ctx = createMockContext();
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('Bearer 형식 아님 (Basic) → UnauthorizedException', async () => {
    const ctx = createMockContext('Basic some-token');
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('만료/무효 토큰 → UnauthorizedException 전파', async () => {
    authService.verifyAccessToken.mockRejectedValue(new UnauthorizedException());

    const ctx = createMockContext('Bearer expired-token');
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
