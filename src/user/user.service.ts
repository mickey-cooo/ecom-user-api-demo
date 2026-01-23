import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/db/user.entity';
import { Repository } from 'typeorm';
import { UserRequestBodyResponse } from './interface/user.interface';

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
}
