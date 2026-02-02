import { ApiProperty } from '@nestjs/swagger';

export class CreateBodyRoleRequestDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  additionalInfo: string;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  createdBy: string;
}
