import { ApiProperty } from '@nestjs/swagger';

export class UserRequestBodyResponse {
  @ApiProperty()
  nameTh: string;

  @ApiProperty()
  lastNameTh: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  lastNameEn: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedBy?: string;

  @ApiProperty()
  updatedAt?: Date;
}

export interface ListUserRequestBodyResponse {
  userDetails: UserRequestBodyResponse[];
}

export interface UserRequestParamsResponse {
  id: string;
}
