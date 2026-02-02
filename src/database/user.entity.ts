import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CommonStatus } from 'src/enum/common.status';
import { RoleEntity } from './role.entity';

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

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status: CommonStatus;

  @OneToMany(() => RoleEntity, (role) => role.user_uuid)
  role_uuid: RoleEntity[];
}
