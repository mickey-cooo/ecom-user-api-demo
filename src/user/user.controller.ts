import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
@AuthGuard()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getUser() {
    try {
      return await this.userService.findUserById('some-id');
    } catch (error) {
      throw error;
    }
  }
}
