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
import { UserDataBodyRequestDTO } from './dto/create.user.request';
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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
        .getRawOne();

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
    body: UserDataBodyRequestDTO,
    req: Request,
    token: string,
  ): Promise<UserRequestBodyResponse> {
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
      const newUser = await this.userRepository
        .createQueryBuilder('u')
        .update()
        .set({
          nameTh: body.nameTh,
          lastNameTh: body.lastNameTh,
          nameEn: body.nameEn,
          lastNameEn: body.lastNameEn,
          phoneNumber: body.phoneNumber,
          createdBy: token,
        })
        .where('u.email = :email', { email: body.email })
        .returning('*')
        .execute();

      return newUser.raw[0];
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    param: ParamsUserRequestDTO,
    body: UpdateUserRequestDTO,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.uuid = :id', { id: param.id })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

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
          updatedBy: body.token,
        })
        .execute();

      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
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
        .getRawOne();

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
        .where('u.uuid = :id', { id: param.id })
        .execute();

      await queryRunner.commitTransaction();
      return deleteUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
    }
  }

  async register(body: RegisterRequestDTO) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

      if (!user) {
        throw new BadRequestException({
          message: 'Email already exists',
        });
      }

      const comparedPassword = await bcrypt.compare(
        body.password,
        body.confirmPassword,
      );
      if (!comparedPassword) {
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

      return newUser;
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

  async signIn(body: SignInRequestDTO) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

      if (user) {
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

      const token = this.jwtService.sign({ id: user.id });

      return {
        token,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async resetPassword(body: ResetPasswordRequestDTO): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existedUser = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

      if (!existedUser) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }

      const isOldPasswordValid = await bcrypt.compare(
        body.oldPassword,
        existedUser.password,
      );
      if (!isOldPasswordValid) {
        throw new BadRequestException({
          message: 'Password is incorrect',
        });
      }

      const comparedNewPassword = await bcrypt.compare(
        body.newPassword,
        body.confirmPassword,
      );
      if (!comparedNewPassword) {
        throw new BadRequestException({
          message: 'Password and Confirm Password do not match',
        });
      }

      const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);
      const updatedUser = await this.userRepository
        .createQueryBuilder('u')
        .update()
        .set({
          password: hashedNewPassword,
        })
        .where('u.email = :email', { email: body.email })
        .execute();

      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
