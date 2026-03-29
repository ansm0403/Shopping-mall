import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleEntity } from '../../user/entity/role.entity';

@Injectable()
export class RolesSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async onApplicationBootstrap() {
    for (const name of Object.values(Role)) {
      const exists = await this.roleRepository.findOne({ where: { name } });
      if (!exists) {
        await this.roleRepository.save(this.roleRepository.create({ name }));
      }
    }
  }
}
