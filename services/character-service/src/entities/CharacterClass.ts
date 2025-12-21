import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { Character } from "./Character";

@Entity()
export class CharacterClass {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ unique: true })
  name?: string;

  @Column()
  description?: string;

  @OneToMany(() => Character, character => character.characterClass)
  characters?: Character[];
}
