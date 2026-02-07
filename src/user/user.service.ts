import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/database/user.entity';
import { Repository } from 'typeorm';
import {
  ListUserRequestBodyResponse,
  UserRequestBodyResponse,
} from './interface/user.interface';
import {
  ListUserRequestBodyDTO,
  ParamsUserRequestDTO,
} from './dto/user.request';
import { RegisterRequestDTO, SignInRequestDTO } from './dto/auth.request';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { UserDataBodyRequestDTO } from './dto/create.user.request';
import { CommonStatus } from '../enum/common.status';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerEmailService } from 'src/mailer/mailer.service';
import { UpdateUserRequestDTO } from './dto/update.user.request';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerEmailService,
  ) {}

  async getUserById(
    param: ParamsUserRequestDTO,
  ): Promise<UserRequestBodyResponse> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: param.id })
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
  ): Promise<ListUserRequestBodyResponse[]> {
    try {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .whereInIds(body.ids)
        .getRawMany();

      if (!users.length) {
        throw new NotFoundException({
          message: 'Users not found',
        });
      }

      return users;
    } catch (error) {
      throw error;
    }
  }

  async createUser(body: UserDataBodyRequestDTO, req: Request): Promise<any> {
    try {
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.email = :email`, { email: body.email })
        .getRawOne();

      if (user) {
        throw new BadRequestException({
          message: 'Email already exists',
        });
      }
      const newUser = await this.userRepository
        .createQueryBuilder(`u`)
        .insert()
        .into(UserEntity)
        .values({
          nameTh: body.nameTh,
          lastNameTh: body.lastNameTh,
          nameEn: body.nameEn,
          lastNameEn: body.lastNameEn,
          phoneNumber: body.phoneNumber,
          createdBy: req.headers['x-user-token'],
        })
        .execute();

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    param: ParamsUserRequestDTO,
    body: UpdateUserRequestDTO,
  ): Promise<any> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.id = :id`, { id: param.id })
        .andWhere(`u.status != :status`, { status: CommonStatus.DELETED })
        .getRawOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }
      const updatedUser = await this.userRepository
        .createQueryBuilder(`u`, queryRunner)
        .update()
        .set({
          nameTh: body.nameTh,
          lastNameTh: body.lastNameTh,
          nameEn: body.nameEn,
          lastNameEn: body.lastNameEn,
          phoneNumber: body.phoneNumber,
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
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.id = :id`, { id: param.id })
        .getRawOne();

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }

      const deleteUser = await this.userRepository
        .createQueryBuilder(`u`, queryRunner)
        .update(UserEntity)
        .set({
          status: CommonStatus.DELETED,
        })
        .where(`u.id = :id`, { id: param.id })
        .execute();

      await queryRunner.commitTransaction();
      return deleteUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
    }
  }

  async register(body: RegisterRequestDTO): Promise<any> {
    try {
      const email = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.email = :email`, { email: body.email })
        .getRawOne();

      if (email) {
        throw new BadRequestException({
          message: 'Email already exists',
        });
      }

      const password = uuidv4();
      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository
        .createQueryBuilder(`u`)
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

      if (mailer.success) {
        return true;
      }

      return newUser;
    } catch (error) {
      throw new Error(error);
    }
  }

  async signIn(body: SignInRequestDTO): Promise<any> {
    try {
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.email = :email`, { email: body.email })
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
}
