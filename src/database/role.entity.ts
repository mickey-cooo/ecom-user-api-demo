import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';

import { UserEntity } from './user.entity';
import { RoleType } from 'src/enum/role.status';
import { CommonStatus } from 'src/enum/common.status';

@Entity('role')
export class RoleEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  name: RoleType;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  additionalInfo: string;

  @Column({ type: 'integer' })
  priority: number;

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status: CommonStatus;

  @ManyToOne(() => UserEntity, (user) => user.role_uuid)
  @JoinColumn({ name: 'user_uuid' })
  user_uuid: UserEntity;
}
