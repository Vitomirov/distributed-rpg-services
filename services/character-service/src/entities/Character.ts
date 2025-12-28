import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn
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
  characterClassId!: string;

  @ManyToOne(() => CharacterClass, (characterClass) => characterClass.characters)
  @JoinColumn({ name: "characterClassId" }) 
  characterClass!: CharacterClass;

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

  @OneToMany(() => CharacterItem, (ci: CharacterItem) => ci.character)
  items!: CharacterItem[];
}
