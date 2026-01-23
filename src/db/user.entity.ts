import { Entity } from "typeorm";
import { TemplateEntity } from "./template.entity";

@Entity('user') extends TemplateEntity {

}