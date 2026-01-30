import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRequestDTO {
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
}
