import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from '../guard/auth.guard';
import {
  ListUserRequestBodyDTO,
  ParamsUserRequestDTO,
} from './dto/user.request';
import { UserRequestBodyResponse } from './interface/user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDataBodyRequestDTO } from './dto/create.user.request';
import { UpdateUserRequestDTO } from './dto/update.user.request';
import { PaginationRequestDTO } from '../pagination/dto/pagination.request.dto';
import { Token } from '../decorator/token.decorator';
import { SignInRequestDTO } from './dto/login.request';
import { RegisterRequestDTO } from './dto/register.request';
import { ResetPasswordRequestDTO } from './dto/reset-password.request';
import { UpdateUserInterface } from './interface/update.interface';

@Controller('user')
@ApiTags('User')
// @UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/sign-in')
  async signIn(@Body() body: SignInRequestDTO): Promise<any> {
    try {
      return await this.userService.signIn(body);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('/register')
  async register(@Body() body: RegisterRequestDTO): Promise<any> {
    try {
      return await this.userService.register(body);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() body: ResetPasswordRequestDTO,
    @Token() token: string,
  ): Promise<any> {
    try {
      return await this.userService.resetPassword(body, token);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('/')
  @UseGuards(AuthGuard)
  async createUser(
    @Body() body: UserDataBodyRequestDTO,
    @Token() token: string,
  ): Promise<UserRequestBodyResponse> {
    try {
      return await this.userService.createUser(body, token);
    } catch (error) {
      throw error;
    }
  }

  @Get('/list')
  @ApiBearerAuth()
  async getUserList(
    @Body() body: ListUserRequestBodyDTO,
    @Query() query: PaginationRequestDTO,
  ) {
    try {
      return await this.userService.getUserList(body, query);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('/:id')
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

  @Patch('/:id')
  @ApiBearerAuth()
  async updateUser(
    @Param() param: ParamsUserRequestDTO,
    @Body() body: UpdateUserRequestDTO,
  ): Promise<UpdateUserInterface> {
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
}
