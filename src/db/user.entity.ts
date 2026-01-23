import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';
@Entity('user')
export class UserEntity extends TemplateEntity {
  // Additional user-specific columns can be added here
  @Column({ type: 'varchar' })
  nameTh: string;

  @Column({ type: 'varchar' })
  lastNameTh: string;

  @Column({ type: 'varchar' })
  nameEn: string;

  @Column({ type: 'varchar' })
  lastNameEn: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;
}
