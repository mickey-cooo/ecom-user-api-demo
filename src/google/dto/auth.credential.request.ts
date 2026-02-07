import { ApiProperty } from '@nestjs/swagger';

export class IGoogleAuthCredentials {
  @ApiProperty({ type: () => GoogleAuthCredentialRequestDTO })
  web: GoogleAuthCredentialRequestDTO;
}

export class GoogleAuthCredentialRequestDTO {
  @ApiProperty()
  client_id: string;

  @ApiProperty()
  client_secret: string;

  @ApiProperty()
  redirect_uris: string[];

  @ApiProperty()
  auth_uri: string;

  @ApiProperty()
  token_uri: string;

  @ApiProperty()
  auth_provider_x509_cert_url: string;

  @ApiProperty()
  javascript_origins: string[];
}
