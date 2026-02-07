import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Redirect,
  Query,
} from '@nestjs/common';
import { GoogleService } from './google.service';
import { AuthUrlInterface } from './interface/auth.url.interface';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('google-auth')
  @Redirect()
  async googleAuthCallBack(
    @Query('code') code: string,
  ): Promise<AuthUrlInterface> {
    try {
      const { email, refreshToken, accessToken } =
        await this.googleService.getAuthClientData(code);
      return {
        url:
          process.env.REDIRECT_TO_LOGIN +
          `?email=${email}&refreshToken=${refreshToken}&accessToken=${accessToken}`,
      };
    } catch (erorr) {
      throw new Error(erorr);
    }
  }
}
