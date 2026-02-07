import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString } from 'class-validator';

export class ResetPasswordRequestDTO {
  @ApiProperty()
  @IsEmail()
  @IsDefined()
  email: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  confirmPassword: string;
}
