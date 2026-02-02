import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { MailerAppModule } from 'src/utils/mailer/mailer.module';

export const modules = [UserModule, JwtModule, MailerAppModule];
