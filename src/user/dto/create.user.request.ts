import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserAdminRequestDTO {
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
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @MaxLength(10)
  phoneNumber: string;
}

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
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @MaxLength(10)
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  createdBy: string;
}
