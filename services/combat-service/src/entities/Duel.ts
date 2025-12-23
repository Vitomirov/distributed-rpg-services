import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("duels")
export class Duel {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  attackerId!: string;

  @Column()
  defenderId!: string;

  @Column("int") attackerHp!: number;
  @Column("int") defenderHp!: number;
  @Column("int") attackerStr!: number;
  @Column("int") attackerAgi!: number;
  @Column("int") attackerInt!: number;
  @Column("int") defenderStr!: number;
  @Column("int") defenderAgi!: number;
  @Column("int") defenderInt!: number;
  @Column("int") attackerFaith!: number;
  @Column("int") defenderFaith!: number;

  // Cooldown tracking
  @Column({ type: "timestamp", nullable: true }) lastAttackAt!: Date;
  @Column({ type: "timestamp", nullable: true }) lastCastAt!: Date;
  @Column({ type: "timestamp", nullable: true }) lastHealAt!: Date;

  @Column({ default: "IN_PROGRESS" })
  status!: string;

  @Column({ nullable: true })
  winnerId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}