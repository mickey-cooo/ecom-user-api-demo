import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../database/user.entity';
import { DataSource, Repository } from 'typeorm';
import {
  ListUserRequestBodyResponse,
  UserRequestBodyResponse,
} from './interface/user.interface';
import {
  ListUserRequestBodyDTO,
  ParamsUserRequestDTO,
} from './dto/user.request';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserAdminRequestDTO,
  UserDataBodyRequestDTO,
} from './dto/create.user.request';
import { CommonStatus } from '../enum/common.status';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerEmailService } from '../mailer/mailer.service';
import { UpdateUserRequestDTO } from './dto/update.user.request';
import { PaginationService } from '../pagination/pagination.service';
import { PaginationRequestDTO } from '../pagination/dto/pagination.request.dto';
import { PaginationResult } from '../pagination/inteface/pagination.interface';
import { ResetPasswordRequestDTO } from './dto/reset-password.request';
import { RegisterByEmailDTO, RegisterRequestDTO } from './dto/register.request';
import { SignInRequestDTO } from './dto/login.request';
import { ResetPasswordEntity } from 'src/database/reset-password.entity';
import { ResetPasswordStatus } from 'src/enum/reset.password.status';
import { UpdateUserInterface } from './interface/update.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ResetPasswordEntity)
    private readonly resetPasswordRepository: Repository<ResetPasswordEntity>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerEmailService,
    private readonly paginationService: PaginationService,
    private dataSource: DataSource,
  ) {}

  async getUserById(
    param: ParamsUserRequestDTO,
  ): Promise<UserRequestBodyResponse> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('u')
        .select([
          'u.uuid AS "uuid"',
          'u.nameTh AS "nameTh"',
          'u.lastNameTh AS "lastNameTh"',
          'u.nameEn AS "nameEn"',
          'u.lastNameEn AS "lastNameEn"',
          'u.email AS "email"',
          'u.phoneNumber AS "phoneNumber"',
          'u.status AS "status"',
          'u.createdAt AS "createdAt"',
        ])
        .where('u.uuid = :id', { id: param.id })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserList(
    body: ListUserRequestBodyDTO,
    query: PaginationRequestDTO,
  ): Promise<PaginationResult<ListUserRequestBodyResponse>> {
    try {
      const users = await this.userRepository
        .createQueryBuilder('u')
        .select([
          'u.uuid AS "uuid"',
          'u.nameTh AS "nameTh"',
          'u.lastNameTh AS "lastNameTh"',
          'u.nameEn AS "nameEn"',
          'u.lastNameEn AS "lastNameEn"',
          'u.email AS "email"',
          'u.phoneNumber AS "phoneNumber"',
          'u.status AS "status"',
          'u.createdAt AS "createdAt"',
        ])
        .whereInIds(body.ids)
        .andWhere('u.status = :status', {
          status: CommonStatus.ACTIVE,
        })
        .orderBy('u.uuid', 'DESC')
        .getRawMany();

      if (!users.length) {
        throw new NotFoundException({
          message: 'Users not found',
        });
      }

      const result = this.paginationService.paginateArray(users, query);
      const data = {
        data: result.data,
        pagination: result.pagination,
      };
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(
    body: CreateUserAdminRequestDTO,
    token: string,
  ): Promise<UserRequestBodyResponse> {
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

      if (user) {
        throw new BadRequestException({
          message: 'Email already exists',
        });
      }

      const tempPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = await this.userRepository
        .createQueryBuilder('u')
        .insert()
        .into(UserEntity)
        .values({
          nameTh: body.nameTh,
          lastNameTh: body.lastNameTh,
          nameEn: body.nameEn,
          lastNameEn: body.lastNameEn,
          email: body.email,
          password: hashedPassword,
          phoneNumber: body.phoneNumber,
          createdBy: userId,
        })
        .returning('*')
        .execute();

      const resetToken = this.jwtService.sign(
        { sub: newUser.raw[0].uuid, type: 'password-reset' },
        { expiresIn: '24h' },
      );

      const expiredAt = new Date();
      expiredAt.setHours(expiredAt.getHours() + 24);

      await this.resetPasswordRepository
        .createQueryBuilder('rp')
        .insert()
        .into(ResetPasswordEntity)
        .values({
          user: newUser.raw[0].uuid,
          resetToken: resetToken,
          expiredAt: expiredAt,
          status: ResetPasswordStatus.PENDING,
        })
        .execute();

      const resetUrl = `https://your-frontend-domain.com/reset-password?token=${resetToken}`;

      try {
        await this.mailerService.sendEmail({
          to: body.email || '',
          subject: 'Set Your Password',
          text: `Click the link to set your password: ${resetUrl}`,
          body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome!</h2>
            <p>Your account has been created by administrator.</p>
            <p>Please click the button below to set your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Set Password
            </a>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours.
            </p>
          </div>
        `,
        });
      } catch (error) {
        console.error('Failed to send set password email:', error);
        throw new BadRequestException({
          message: 'Cannot send email to the provided address',
        });
      }

      return {
        ...newUser.raw[0],
        message:
          'User created successfully. Password setup link sent via email.',
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(
    param: ParamsUserRequestDTO,
    body: UpdateUserRequestDTO,
  ): Promise<UpdateUserInterface> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.uuid = :id', { id: param.id })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }
      const updatedUser = await this.userRepository
        .createQueryBuilder('u', queryRunner)
        .update()
        .set({
          nameTh: body.nameTh,
          lastNameTh: body.lastNameTh,
          nameEn: body.nameEn,
          lastNameEn: body.lastNameEn,
          phoneNumber: body.phoneNumber,
          email: body.email,
          updatedBy: user.uuid,
        })
        .where('uuid = :id', { id: param.id })
        .returning('*')
        .execute();

      await queryRunner.commitTransaction();
      const result = updatedUser.raw[0];

      return {
        uuid: result.uuid,
        nameTh: result.nameTh,
        lastNameTh: result.lastNameTh,
        nameEn: result.nameEn,
        lastNameEn: result.lastNameEn,
        phoneNumber: result.phoneNumber,
        email: result.email,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(param: ParamsUserRequestDTO): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.uuid = :id', { id: param.id })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }

      const deleteUser = await this.userRepository
        .createQueryBuilder('u', queryRunner)
        .update(UserEntity)
        .set({
          status: CommonStatus.DELETED,
        })
        .where('uuid = :id', { id: param.id })
        .returning('*')
        .execute();

      await queryRunner.commitTransaction();
      return deleteUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async register(body: RegisterRequestDTO) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

      if (user) {
        throw new BadRequestException({
          message: 'Email already exists',
        });
      }

      if (body.password !== body.confirmPassword) {
        throw new BadRequestException({
          message: 'Password and Confirm Password do not match',
        });
      }
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const newUser = await this.userRepository
        .createQueryBuilder('u')
        .insert()
        .into(UserEntity)
        .values({
          email: body.email,
          password: hashedPassword,
        })
        .execute();

      return {
        message: 'User registered successfully',
        user: {
          uuid: newUser.raw[0].uuid,
          email: newUser.raw[0].email,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async registerByEmail(body: RegisterByEmailDTO): Promise<any> {
    try {
      const email = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

      if (email) {
        throw new BadRequestException({
          message: 'Email already exists',
        });
      }

      const password = uuidv4();
      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository
        .createQueryBuilder('u')
        .insert()
        .into(UserEntity)
        .values({
          email: body.email,
          password: hashPassword,
        })
        .execute();

      const mailer = await this.mailerService.sendEmail({
        to: body.email,
        subject: 'Account Registration',
        body: `Your account has been created. Your password is ${password} Please change your password after logging in.`,
        text: `Your account has been created. Your password is ${password} Please change your password after logging in.`,
      });

      if (mailer.failed.length) {
        throw new BadRequestException({
          message: 'Cannot send email to your address',
        });
      }

      return newUser;
    } catch (error) {
      throw new Error(error);
    }
  }

  async signIn(body: SignInRequestDTO): Promise<any> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }
      const isPasswordValid = await bcrypt.compare(
        body.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException({
          message: 'Invalid email or password',
        });
      }

      const accessToken = this.jwtService.sign({
        id: user.uuid,
      });

      return {
        accessToken,
        user: {
          uuid: user.uuid,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async resetPassword(body: ResetPasswordRequestDTO, token: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Invalid token type');
      }

      const resetRecord = await this.resetPasswordRepository
        .createQueryBuilder('rp')
        .leftJoinAndSelect('rp.user', 'user')
        .where('rp.resetToken = :token', { token })
        .andWhere('rp.status = :status', {
          status: ResetPasswordStatus.PENDING,
        })
        .andWhere('rp.expiredAt > :now', { now: new Date() })
        .andWhere('user.uuid = :userId', { userId: payload.sub })
        .andWhere('user.status = :userStatus', {
          userStatus: CommonStatus.ACTIVE,
        })
        .getOne();

      if (!resetRecord) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      if (body.newPassword !== body.confirmNewPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 10);

      await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({ password: hashedPassword })
        .where('uuid = :uuid', { uuid: resetRecord.user.uuid })
        .execute();

      await this.resetPasswordRepository
        .createQueryBuilder()
        .update(ResetPasswordEntity)
        .set({ status: ResetPasswordStatus.EXPIRED })
        .where('uuid = :uuid', { uuid: resetRecord.uuid })
        .execute();

      try {
        await this.mailerService.sendEmail({
          to: resetRecord.user.email,
          subject: 'Password Changed Successfully',
          text: 'Your password has been changed successfully.',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">Password Changed Successfully</h2>
              <p>Your password has been changed successfully.</p>
              <p>You can now login with your new password.</p>
              <p style="color: #dc3545; margin-top: 24px;">
                <strong>⚠️ If you didn't make this change, please contact support immediately.</strong>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      return {
        message:
          'Password reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
