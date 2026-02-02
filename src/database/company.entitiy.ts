import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('company')
export class CompanyEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  name: string;
}
