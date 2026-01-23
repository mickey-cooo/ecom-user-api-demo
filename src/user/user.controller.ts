import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ListUserRequestBodyDTO,
  ParamsUserRequestDTO,
} from './dto/user.request';
import {
  ListUserRequestBodyResponse,
  UserRequestBodyResponse,
} from './interface/user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @ApiBearerAuth()
  async getUser(
    @Param() param: ParamsUserRequestDTO,
  ): Promise<UserRequestBodyResponse> {
    try {
      return await this.userService.getUserById(param.id);
    } catch (error) {
      throw error;
    }
  }

  @Get('/list')
  @ApiBearerAuth()
  async getUserList(
    @Body() body: ListUserRequestBodyDTO,
  ): Promise<ListUserRequestBodyResponse[]> {
    try {
      return await this.userService.getUserList(body);
    } catch (error) {
      throw error;
    }
  }

  @Post('/')
  @ApiBearerAuth()
  async createUser(): Promise<any> {
    try {
      return true;
    } catch (error) {
      throw error;
    }
  }

  @Patch('/:id')
  @ApiBearerAuth()
  async updateUser(@Param() param: ParamsUserRequestDTO): Promise<any> {
    try {
      return true;
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id')
  @ApiBearerAuth()
  async deleteUser(@Param() param: ParamsUserRequestDTO): Promise<any> {
    try {
      return true;
    } catch (error) {
      throw error;
    }
  }
}
