import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}
@Entity('user')
export class UserEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  nameTh: string;

  @Column({ type: 'varchar' })
  lastNameTh: string;

  @Column({ type: 'varchar' })
  nameEn: string;

  @Column({ type: 'varchar' })
  lastNameEn: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;
}
