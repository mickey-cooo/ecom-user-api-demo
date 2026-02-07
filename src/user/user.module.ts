import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/user.entity';
import { MailerAppModule } from 'src/mailer/mailer.module';
import { MailerEmailService } from 'src/mailer/mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtModule.register({})],
  controllers: [UserController],
  providers: [UserService, MailerEmailService],
})
export class UserModule {}
