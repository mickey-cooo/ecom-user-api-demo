import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParamsUserRequest } from './dto/user.request';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getUser(@Param() param: ParamsUserRequest): Promise<any> {
    try {
      return await this.userService.getUserById(param.id);
    } catch (error) {
      throw error;
    }
  }
}
