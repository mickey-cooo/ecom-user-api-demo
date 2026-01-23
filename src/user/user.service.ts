import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: any) {}

  async findUserById(id: string): Promise<any> {
    // const user = await this.q
    return true;
  }
}
