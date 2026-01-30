import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString, Max, Min } from 'class-validator';

export class UserDataBodyRequestDTO {
  @ApiProperty()
  @IsDefined()
  @IsString()
  nameTh: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  lastNameTh: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  nameEn: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  lastNameEn: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Max(10)
  phoneNumber: string;

  @ApiProperty()
  createdBy: string;
}
