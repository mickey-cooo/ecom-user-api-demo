import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString, Max, Min } from 'class-validator';

export class ParamsUserRequestDTO {
  @ApiProperty()
  @IsDefined()
  @IsString()
  id: string;
}

export class ListUserRequestBodyDTO {
  @ApiProperty()
  @IsDefined()
  ids: string[];
}
