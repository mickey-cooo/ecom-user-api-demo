import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { MailerController } from './mailer.controller';
import { MailerEmailService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
  ],
  controllers: [MailerController],
  providers: [MailerEmailService],
  exports: [MailerEmailService],
})
export class MailerAppModule {}
