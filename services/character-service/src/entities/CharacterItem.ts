import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn
} from "typeorm";
import { Character } from "./Character";
import { Item } from "./Item";

@Entity()
export class CharacterItem {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @ManyToOne(() => Character, character => character.items)
  character?: Character;

  @ManyToOne(() => Item, { eager: true })
  item?: Item;

  @CreateDateColumn()
  acquiredAt?: Date;
}
