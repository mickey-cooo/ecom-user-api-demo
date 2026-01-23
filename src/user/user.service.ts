import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity, UserStatus } from 'src/db/user.entity';
import { Repository } from 'typeorm';
import {
  ListUserRequestBodyResponse,
  UserRequestBodyResponse,
} from './interface/user.interface';
import { ListUserRequestBodyDTO } from './dto/user.request';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: Repository<UserEntity>) {}

  async getUserById(id: string): Promise<UserRequestBodyResponse> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }
    return user;
  }

  async getUserList(
    body: ListUserRequestBodyDTO,
  ): Promise<ListUserRequestBodyResponse[]> {
    try {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .whereInIds(body.ids)
        .getRawMany();

      if (!users.length) {
        throw new NotFoundException({
          message: 'Users not found',
        });
      }

      return users;
    } catch (error) {
      throw error;
    }
  }

  async createUser(): Promise<any> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.email = :email`, { email: `` })
        .getOne();

      if (user) {
        throw new BadRequestException({
          message: 'Email already exists',
        });
      }

      const newUser = this.userRepository.create({
        nameTh: '',
        lastNameTh: '',
        nameEn: '',
        lastNameEn: '',
        email: '',
        phoneNumber: '',
        createdBy: '',
      });

      await this.userRepository.save(newUser);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string): Promise<any> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.id = :id`, { id })
        .andWhere(`u.status != :status`, { status: UserStatus.DELETED })
        .getOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async deleteUser(id: string): Promise<any> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .getOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }

      user.status = UserStatus.DELETED;
      await this.userRepository.save(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
