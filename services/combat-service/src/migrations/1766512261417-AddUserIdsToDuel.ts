import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdsToDuel1766512261417 implements MigrationInterface {
    name = 'AddUserIdsToDuel1766512261417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Prvo kreiramo tabelu jer ona ne postoji u čistoj bazi
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "duels" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "attackerId" uuid NOT NULL,
                "defenderId" uuid NOT NULL,
                "attackerHp" integer NOT NULL,
                "defenderHp" integer NOT NULL,
                "attackerStr" integer NOT NULL,
                "attackerAgi" integer NOT NULL,
                "attackerInt" integer NOT NULL,
                "attackerFaith" integer NOT NULL,
                "defenderStr" integer NOT NULL,
                "defenderAgi" integer NOT NULL,
                "defenderInt" integer NOT NULL,
                "defenderFaith" integer NOT NULL,
                "status" character varying NOT NULL DEFAULT 'IN_PROGRESS',
                "winnerId" uuid,
                "lastAttackAt" TIMESTAMP,
                "lastCastAt" TIMESTAMP,
                "lastHealAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_duels_id" PRIMARY KEY ("id")
            )
        `);

        // Zatim dodajemo kolone koje su specifično tražene ovim zadatkom
        await queryRunner.query(`ALTER TABLE "duels" ADD COLUMN IF NOT EXISTS "attackerUserId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "duels" ADD COLUMN IF NOT EXISTS "defenderUserId" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "duels" DROP COLUMN IF EXISTS "defenderUserId"`);
        await queryRunner.query(`ALTER TABLE "duels" DROP COLUMN IF EXISTS "attackerUserId"`);
    }
}