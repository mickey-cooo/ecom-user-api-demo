import { ApiProperty } from '@nestjs/swagger';

export class AuthClientDataInterface {
  @ApiProperty()
  email: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  accessToken: string;
}
