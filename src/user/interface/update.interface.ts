import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInterface {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  nameTh?: string;

  @ApiProperty()
  lastNameTh?: string;

  @ApiProperty()
  nameEn?: string;

  @ApiProperty()
  lastNameEn?: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  email?: string;
}
