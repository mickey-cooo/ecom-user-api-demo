import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleEntity } from 'src/database/role.entity';
import { Repository } from 'typeorm';
import {
  ListRoleRequestBodyDTO,
  ParamsRoleRequestDTO,
} from './dto/role.request';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: Repository<RoleEntity>) {}

  async getRoleById(param: ParamsRoleRequestDTO): Promise<any> {
    try {
      const role = await this.roleRepository
        .createQueryBuilder(`r`)
        .where(`r.id = :id`, { id: param.id })
        .getRawOne();

      if (!role) {
        throw new NotFoundException({
          message: 'Role not found',
        });
      }

      return role;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllRoles(body: ListRoleRequestBodyDTO): Promise<any> {
    try {
      const roles = await this.roleRepository
        .createQueryBuilder(`r`)
        .andWhereInIds(body.ids)
        .getRawMany();

      if (!roles.length) {
        throw new NotFoundException({
          message: 'Roles not found',
        });
      }

      return roles;
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(body: any): Promise<any> {
    try {
      const role = await this.roleRepository
        .createQueryBuilder(`r`)
        .where(`r.name = :name`, { name: body.name })
        .getRawOne();

      if (role) {
        throw new BadRequestException({
          message: 'Role with this name already exists',
        });
      }

      const newRole = await this.roleRepository
        .createQueryBuilder(`r`)
        .insert()
        .into(RoleEntity)
        .values({
          name: body.name,
          description: body.description,
          additionalInfo: body.additionalInfo,
          priority: body.priority,
        })
        .execute();

      return newRole;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(param: ParamsRoleRequestDTO, body: any): Promise<any> {
    const queryRunner =
      await this.roleRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const role = await this.roleRepository
        .createQueryBuilder(`r`, queryRunner)
        .where(`r.id = :id`, { id: param.id })
        .getRawOne();

      if (!role) {
        throw new NotFoundException({
          message: 'Role not found',
        });
      }

      const updatedRole = await this.roleRepository
        .createQueryBuilder(`r`, queryRunner)
        .update(RoleEntity)
        .set({
          name: body.name,
          description: body.description,
          additionalInfo: body.additionalInfo,
          priority: body.priority,
        });

      await queryRunner.commitTransaction();
      return updatedRole;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
    }
  }
}
