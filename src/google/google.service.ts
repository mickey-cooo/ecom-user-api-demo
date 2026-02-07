import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { IGoogleAuthCredentials } from './dto/auth.credential.request';
import { AuthUrlInterface } from './interface/auth.url.interface';
import { AuthClientDataInterface } from './interface/auth.client.interface';

@Injectable()
export class GoogleService {
  private readonly scopeApi: string[];
  private readonly credentialsPath: string;
  constructor(private readonly configService: ConfigService) {
    this.credentialsPath = path.join(
      process.cwd(),
      this.configService.get('GOOGLE_CREDENTIALS_PATH') || '',
    );
    this.scopeApi =
      this.configService.get('GOOGLE_SCOPES_API')?.split(',') || [];
  }

  async getOAuth2Client(): Promise<AuthUrlInterface> {
    try {
      const authClient = this.getAuthClient();
      return this.getAuthUrl(authClient);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAuthClientData(code: string): Promise<AuthClientDataInterface> {
    try {
      const authClient = this.getAuthClient();
      const tokenData = await authClient.getToken(code);
      const tokens = tokenData.tokens;
      const refreshToken = tokens.refresh_token || '';
      const accessToken = tokens.access_token || '';

      authClient.setCredentials(tokens);

      const googleAuth = google.oauth2({
        version: 'v2',
        auth: authClient,
      } as any);

      const googleUserInfo = await googleAuth.userinfo.get();
      const email = googleUserInfo.data.email || '';
      return { email, refreshToken, accessToken };
    } catch (error) {
      throw new Error(error);
    }
  }

  private readCredentials(filePath: string): IGoogleAuthCredentials {
    try {
      const credentialsPath = path.join(filePath);
      const content: string = fs.readFileSync(credentialsPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(error);
    }
  }

  private getAuthClient(): OAuth2Client {
    try {
      const keys: IGoogleAuthCredentials = this.readCredentials(
        this.credentialsPath,
      );
      const authClient = new OAuth2Client(
        keys.web.client_id,
        keys.web.client_secret,
        keys.web.redirect_uris[0],
      );
      return authClient;
    } catch (error) {
      throw new Error(error);
    }
  }

  private getAuthUrl(authClient: OAuth2Client): AuthUrlInterface {
    try {
      const authorizeUrl = authClient.generateAuthUrl({
        access_type: 'offline',
        scope: this.scopeApi,
        propmt: 'consent',
        include_granted_scopes: true,
      });
      return { url: authorizeUrl };
    } catch (error) {
      throw new Error(error);
    }
  }
}
