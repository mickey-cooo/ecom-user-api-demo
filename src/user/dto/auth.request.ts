import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class RegisterRequestDTO {
  @ApiProperty()
  @IsDefined()
  email: string;
}

export class SignInRequestDTO {
  @ApiProperty()
  @IsDefined()
  email: string;

  @ApiProperty()
  @IsDefined()
  password: string;
}
