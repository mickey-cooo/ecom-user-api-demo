import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/db/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: Repository<UserEntity>) {}

  async findUserById(id: string): Promise<any> {
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
