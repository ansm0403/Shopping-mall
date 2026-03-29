import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../user/entity/role.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector as any);
  });

  const createMockContext = (user?: { roles: Role[] }) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  };

  it('@Roles 없는 엔드포인트 → 항상 통과', () => {
    reflector.getAllAndOverride.mockReturnValue(null);

    expect(guard.canActivate(createMockContext())).toBe(true);
  });

  it('@Roles([]) 빈 배열 → 항상 통과', () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(createMockContext())).toBe(true);
  });

  it('BUYER 필요, roles에 buyer → 통과', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.BUYER]);

    expect(guard.canActivate(createMockContext({ roles: [Role.BUYER] }))).toBe(true);
  });

  it('BUYER 필요, roles에 buyer + seller (셀러가 구매) → 통과', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.BUYER]);

    expect(guard.canActivate(createMockContext({ roles: [Role.BUYER, Role.SELLER] }))).toBe(true);
  });

  it('SELLER 필요, roles에 seller → 통과', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.SELLER]);

    expect(guard.canActivate(createMockContext({ roles: [Role.SELLER] }))).toBe(true);
  });

  it('ADMIN 필요, roles에 buyer → ForbiddenException', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(createMockContext({ roles: [Role.BUYER] }))).toThrow(
      ForbiddenException,
    );
  });

  it('SELLER 필요, roles에 buyer만 → ForbiddenException', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.SELLER]);

    expect(() => guard.canActivate(createMockContext({ roles: [Role.BUYER] }))).toThrow(
      ForbiddenException,
    );
  });

  it('request.user 없음 (비인증) → ForbiddenException', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.BUYER]);

    expect(() => guard.canActivate(createMockContext(undefined))).toThrow(ForbiddenException);
  });
});
