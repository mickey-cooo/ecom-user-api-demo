import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class UpdateUserRequestDTO {
  @ApiProperty()
  @IsDefined()
  @IsString()
  nameTh?: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  lastNameTh?: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  nameEn?: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  lastNameEn?: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @Optional()
  token?: string;
}

export class ParamUpdateUserRequestDTO {
  @ApiProperty()
  @IsDefined()
  id: string;
}
