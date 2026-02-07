import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { MailerAppModule } from '../mailer/mailer.module';
import { PaginationModule } from '../pagination/pagination.mudule';

export const modules = [
  UserModule,
  JwtModule,
  MailerAppModule,
  PaginationModule,
];
