import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            logoutAllDevices: jest.fn(),
            refresh: jest.fn(),
            verifyEmail: jest.fn(),
            resendVerificationEmail: jest.fn(),
            getMe: jest.fn(),
            getActiveSessions: jest.fn(),
            revokeSession: jest.fn(),
            checkEmailDuplicate: jest.fn(),
            checkNicknameDuplicate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
