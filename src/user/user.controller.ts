import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guard/auth.guard';
import {
  ListUserRequestBodyDTO,
  ParamsUserRequestDTO,
} from './dto/user.request';
import {
  ListUserRequestBodyResponse,
  UserRequestBodyResponse,
} from './interface/user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RegisterRequestDTO, SignInRequestDTO } from './dto/auth.request';
import { UserDataBodyRequestDTO } from './dto/create.user.request';
import { UpdateUserRequestDTO } from './dto/update.user.request';

@Controller('user')
// @UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @ApiBearerAuth()
  async getUser(
    @Param() param: ParamsUserRequestDTO,
  ): Promise<UserRequestBodyResponse> {
    try {
      return await this.userService.getUserById(param);
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
  // @ApiBearerAuth()
  async createUser(
    @Body() body: UserDataBodyRequestDTO,
    @Req() req: Request,
  ): Promise<any> {
    try {
      return await this.userService.createUser(body, req);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/:id')
  @ApiBearerAuth()
  async updateUser(
    @Param() param: ParamsUserRequestDTO,
    @Body() body: UpdateUserRequestDTO,
  ): Promise<any> {
    try {
      return await this.userService.updateUser(param, body);
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id')
  @ApiBearerAuth()
  async deleteUser(@Param() param: ParamsUserRequestDTO): Promise<any> {
    try {
      return await this.userService.deleteUser(param);
    } catch (error) {
      throw error;
    }
  }

  @Post('/sign-in')
  async signIn(@Body() body: SignInRequestDTO): Promise<any> {
    try {
      return await this.userService.signIn(body);
      // mickey na hee
    } catch (error) {
      throw error;
    }
  }

  @Post('/register')
  async register(@Body() body: RegisterRequestDTO): Promise<any> {
    try {
      return await this.userService.register(body);
    } catch (error) {
      throw error;
    }
  }
}
