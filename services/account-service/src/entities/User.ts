import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { UserRole } from "@shared/types";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;
}
