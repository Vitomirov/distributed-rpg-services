import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from "typeorm";
import { CharacterClass } from "./CharacterClass";
import { CharacterItem } from "./CharacterItem";

@Entity()
export class Character {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  health!: number;

  @Column()
  mana!: number;

  @Column()
  baseStrength!: number;

  @Column()
  baseAgility!: number;

  @Column()
  baseIntelligence!: number;

  @Column()
  baseFaith!: number;

  @Column()
  createdBy!: string; // userId from JWT

  @ManyToOne(() => CharacterClass, (cls: CharacterClass) => cls.characters, { eager: true })
  characterClass!: CharacterClass;

  @OneToMany(() => CharacterItem, (ci: CharacterItem) => ci.character)
  items!: CharacterItem[];
}
