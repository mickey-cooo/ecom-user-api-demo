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

@Controller('user')
@ApiTags('User')
// @UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Post('/')
  @UseGuards(AuthGuard)
  async createUser(
    @Body() body: UserDataBodyRequestDTO,
    @Req() req: Request,
    @Token() token: string,
  ): Promise<UserRequestBodyResponse> {
    try {
      return await this.userService.createUser(body, req, token);
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
  async signIn(@Body() body: SignInRequestDTO, @Res() res: Response) {
    try {
      return await this.userService.signIn(body);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Post('/register')
  async register(@Body() body: RegisterRequestDTO, @Res() res: Response) {
    try {
      return await this.userService.register(body);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Patch('/reset-password')
  async resetPassword(
    @Body() body: ResetPasswordRequestDTO,
    @Res() res: Response,
  ) {
    try {
      return await this.userService.resetPassword(body);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }
}
