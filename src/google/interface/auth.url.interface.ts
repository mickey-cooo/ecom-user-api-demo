import { ApiProperty } from '@nestjs/swagger';

export class AuthUrlInterface {
  @ApiProperty()
  url: string;
}
