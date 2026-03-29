import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogEntity } from './entity/audit-log.entity';

describe('AuditController', () => {
  let controller: AuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLogEntity),
          useValue: { save: jest.fn(), find: jest.fn(), create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
