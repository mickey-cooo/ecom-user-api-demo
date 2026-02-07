import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { MailerAppModule } from 'src/mailer/mailer.module';
import { PaginationModule } from 'src/pagination/pagination.mudule';
import { DataSource } from 'typeorm/browser';

export const modules = [
  UserModule,
  JwtModule,
  MailerAppModule,
  PaginationModule,
];
