import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CommonStatus } from '../enum/common.status';
import { RoleEntity } from './role.entity';
import { ResetPasswordEntity } from './reset-password.entity';

@Entity('user')
export class UserEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  nameTh: string;

  @Column({ type: 'varchar', nullable: true })
  lastNameTh: string;

  @Column({ type: 'varchar', nullable: true })
  nameEn: string;

  @Column({ type: 'varchar', nullable: true })
  lastNameEn: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status: CommonStatus;

  @OneToMany(() => RoleEntity, (role) => role.user_uuid)
  role_uuid: RoleEntity[];

  @OneToMany(() => ResetPasswordEntity, (resetpassword) => resetpassword.user)
  @JoinColumn({ name: 'user_uuid' })
  resetPassword: ResetPasswordEntity;
}
